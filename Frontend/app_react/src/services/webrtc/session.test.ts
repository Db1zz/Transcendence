import { WebRtcSession } from "./session";

const mockGetTracks = jest.fn();
const mockStream = { getTracks: mockGetTracks };
const mockGetUserMedia = jest.fn();

const mockWsSend = jest.fn();
const mockWsClose = jest.fn();

const mockAddTrack = jest.fn();
const mockCreateOffer = jest.fn();
const mockCreateAnswer = jest.fn();
const mockSetLocalDescription = jest.fn();
const mockSetRemoteDescription = jest.fn();
const mockAddIceCandidate = jest.fn();

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("WebRtcSession", () => {
  const roomId = "test-room";
  const signalingUrl = "ws://localhost:8080/signaling";
  const stunAddress = "stun:stun.l.google.com:19302";

  let session: WebRtcSession;
  let mockCallbacks: any;
  let mockWsInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetTracks.mockReturnValue([{ id: "mock-track-1", stop: jest.fn() }]);
    mockGetUserMedia.mockResolvedValue(mockStream);
    Object.defineProperty(global.navigator, "mediaDevices", {
      value: { getUserMedia: mockGetUserMedia },
      configurable: true,
    });

    (global as any).RTCSessionDescription = jest.fn().mockImplementation((init) => init);
    (global as any).RTCIceCandidate = jest.fn().mockImplementation((init) => init);

    global.WebSocket = jest.fn().mockImplementation((url) => {
      mockWsInstance = {
        url,
        send: mockWsSend,
        close: mockWsClose,
        readyState: 1,
        onmessage: null,
      };
      return mockWsInstance;
    }) as any;
    (global.WebSocket as any).OPEN = 1;

    mockCreateOffer.mockResolvedValue({ type: "offer", sdp: "fake-offer" });
    mockCreateAnswer.mockResolvedValue({ type: "answer", sdp: "fake-answer" });
    mockSetLocalDescription.mockImplementation(function (this: any, desc: any) {
      this.localDescription = desc;
      return Promise.resolve();
    });
    mockSetRemoteDescription.mockResolvedValue(undefined);
    mockAddIceCandidate.mockResolvedValue(undefined);

    global.RTCPeerConnection = jest.fn().mockImplementation(() => {
      return {
        addTrack: mockAddTrack,
        createOffer: mockCreateOffer,
        createAnswer: mockCreateAnswer,
        setLocalDescription: mockSetLocalDescription,
        setRemoteDescription: mockSetRemoteDescription,
        addIceCandidate: mockAddIceCandidate,
        close: jest.fn(),
        signalingState: "new",
        remoteDescription: {},
        localDescription: null,
      };
    }) as any;

    mockCallbacks = {
      onLocalStream: jest.fn(),
      onRemoteStream: jest.fn(),
      onRemoteStreamDelete: jest.fn(),
    };

    session = new WebRtcSession(
      roomId,
      signalingUrl,
      stunAddress,
      mockCallbacks,
    );
  });

  it("initializes with correct properties", () => {
    expect(session.roomId).toBe(roomId);
    expect(session.peers.size).toBe(0);
    expect((session as any).signalingServerAddress.href).toBe(
      `${signalingUrl}?roomId=${roomId}`,
    );
  });

  it("starts successfully, captures media, triggers callback, and connects WebSocket", async () => {
    await session.start();

    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true, video: true });
    expect(session.localStream).toBe(mockStream);
    expect(mockCallbacks.onLocalStream).toHaveBeenCalledWith(mockStream);
    expect(global.WebSocket).toHaveBeenCalledWith(
      (session as any).signalingServerAddress,
    );
  });

  it("cleans up the WebSocket when destroyed", async () => {
    await session.start();
    session.destroy();
    expect(mockWsClose).toHaveBeenCalledTimes(1);
  });

  describe("Signaling Message Handling", () => {
    beforeEach(async () => {
      await session.start();
      expect(mockWsInstance.onmessage).toBeTruthy();
    });

    it("handles 'new-connection' by creating an offer and sending it", async () => {
      const signal = { type: "new-connection", from: "peer-1" };
      mockWsInstance.onmessage({ data: JSON.stringify(signal) });
      await flushPromises();

      expect(session.peers.has("peer-1")).toBe(true);
      expect(mockAddTrack).toHaveBeenCalled();

      expect(mockCreateOffer).toHaveBeenCalled();
      expect(mockSetLocalDescription).toHaveBeenCalledWith({
        type: "offer",
        sdp: "fake-offer",
      });

      expect(mockWsSend).toHaveBeenCalledWith(
        JSON.stringify({
          type: "offer",
          to: "peer-1",
          sdp: { type: "offer", sdp: "fake-offer" },
        }),
      );
    });

    it("handles 'offer' by setting remote description, creating answer, and sending it", async () => {
      const incomingOffer = { type: "offer", sdp: "real-incoming-offer" };
      const signal = { type: "offer", from: "peer-2", sdp: incomingOffer };

      mockWsInstance.onmessage({ data: JSON.stringify(signal) });
      await flushPromises();

      expect(session.peers.has("peer-2")).toBe(true);

      expect(mockSetRemoteDescription).toHaveBeenCalledWith(incomingOffer);
      expect(mockCreateAnswer).toHaveBeenCalled();
      expect(mockSetLocalDescription).toHaveBeenCalledWith({
        type: "answer",
        sdp: "fake-answer",
      });

      expect(mockWsSend).toHaveBeenCalledWith(
        JSON.stringify({
          type: "answer",
          to: "peer-2",
          sdp: { type: "answer", sdp: "fake-answer" },
        }),
      );
    });

    it("handles 'answer' by setting the remote description on an existing peer", async () => {
      mockWsInstance.onmessage({
        data: JSON.stringify({ type: "new-connection", from: "peer-3" }),
      });
      await flushPromises();
      mockSetRemoteDescription.mockClear();

      const incomingAnswer = { type: "answer", sdp: "real-incoming-answer" };
      const signal = { type: "answer", from: "peer-3", sdp: incomingAnswer };

      mockWsInstance.onmessage({ data: JSON.stringify(signal) });
      await flushPromises();

      expect(mockSetRemoteDescription).toHaveBeenCalledWith(incomingAnswer);
    });

    it("handles 'ice' by adding the ICE candidate to the existing peer", async () => {
      mockWsInstance.onmessage({
        data: JSON.stringify({ type: "new-connection", from: "peer-4" }),
      });
      await flushPromises();

      const incomingCandidate = {
        candidate: "fake-candidate",
        sdpMid: "0",
        sdpMLineIndex: 0,
      };
      const signal = {
        type: "ice",
        from: "peer-4",
        candidate: incomingCandidate,
      };

      mockWsInstance.onmessage({ data: JSON.stringify(signal) });
      await flushPromises();

      expect(mockAddIceCandidate).toHaveBeenCalledWith(incomingCandidate);
    });

    it("handles 'user-disconnection' by removing the peer and firing the callback", async () => {
      mockWsInstance.onmessage({
        data: JSON.stringify({ type: "new-connection", from: "peer-5" }),
      });
      await flushPromises();

      expect(session.peers.has("peer-5")).toBe(true);

      const signal = { type: "user-disconnection", from: "peer-5" };
      mockWsInstance.onmessage({ data: JSON.stringify(signal) });
      await flushPromises();

      expect(session.peers.has("peer-5")).toBe(false);
      expect(mockCallbacks.onRemoteStreamDelete).toHaveBeenCalledWith("peer-5");
    });
  });
});