import { RtcSignal } from "./types";

type WebRtcSessionCallbacks = {
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (peerId: string, stream: MediaStream) => void;
  onRemoteStreamDelete?: (peerId: string) => void;
};

export class WebRtcSession {
  public roomId: string;
  public signalingServerSocket: WebSocket | null = null;
  public peers: Map<string, RTCPeerConnection> = new Map();
  public localStream: MediaStream | null = null;

  private stunAddress: string;
  private signalingServerAddress: URL;
  private callbacks: WebRtcSessionCallbacks;

  constructor(
    roomId: string,
    signalingServerAddress: string,
    stunAddress: string,
    callbacks: WebRtcSessionCallbacks = {},
  ) {
    this.roomId = roomId;
    this.signalingServerAddress = new URL(signalingServerAddress);
    this.signalingServerAddress.searchParams.append("roomId", roomId);
    this.stunAddress = stunAddress;
    this.callbacks = callbacks;
  }

  public async start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      this.localStream = stream;
      this.callbacks.onLocalStream?.(stream);

      this.signalingServerSocket = new WebSocket(this.signalingServerAddress);
      this.signalingServerSocket.onmessage = (msg) =>
        this.onMessageCallback(msg);

      this.signalingServerSocket.onclose = () => this.destroy();
    } catch (err) {
      console.error("Failed to acquire media or connect to signaling:", err);
    }
  }

  public destroy() {
    console.log("Destroying WebRtc session and cleaning hardware...");

    if (this.signalingServerSocket) {
      this.signalingServerSocket.close();
      this.signalingServerSocket = null;
    }

    this.localStream?.getTracks().forEach((track) => track.stop());
    this.localStream = null;

    this.peers.forEach((pc, peerId) => {
      pc.close();
      this.callbacks.onRemoteStreamDelete?.(peerId);
    });
    this.peers.clear();
  }

  private async onMessageCallback(message: MessageEvent) {
    const pm = JSON.parse(message.data) as RtcSignal;

    try {
      switch (pm.type) {
        case "new-connection":
          await this.handleNewConnectionEvent(pm.from);
          break;
        case "user-disconnection":
          this.handleUserDisconnectionEvent(pm.from);
          break;
        case "offer":
          await this.handleOfferEvent(pm.from, pm.sdp);
          break;
        case "answer":
          await this.handleAnswerEvent(pm.from, pm.sdp);
          break;
        case "ice":
          await this.handleIceEvent(pm.from, pm.candidate);
          break;
      }
    } catch (err) {
      console.error(`Error handling ${pm.type} from ${pm.from}:`, err);
    }
  }

  private async handleNewConnectionEvent(from: string) {
    const pc = this.createPeerConnection(from);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    this.sendSignal({ type: "offer", to: from, sdp: pc.localDescription! });
  }

  private async handleOfferEvent(from: string, sdp: RTCSessionDescriptionInit) {
    const pc = this.createPeerConnection(from);

    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    this.sendSignal({ type: "answer", to: from, sdp: pc.localDescription! });
  }

  private async handleAnswerEvent(
    from: string,
    sdp: RTCSessionDescriptionInit,
  ) {
    const pc = this.peers.get(from);
    if (!pc) return;

    if (pc.signalingState === "stable") {
      console.warn("Received answer but connection is already stable.");
      return;
    }

    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  private async handleIceEvent(from: string, candidate: RTCIceCandidateInit) {
    const pc = this.peers.get(from);
    if (!pc || !candidate) return;

    if (pc.remoteDescription) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  private handleUserDisconnectionEvent(from: string) {
    const pc = this.peers.get(from);
    if (pc) {
      pc.close();
      this.peers.delete(from);
    }
    this.callbacks.onRemoteStreamDelete?.(from);
  }

  private createPeerConnection(peerId: string): RTCPeerConnection {
    if (this.peers.has(peerId)) {
      this.peers.get(peerId)?.close();
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: this.stunAddress }],
    });

    this.localStream?.getTracks().forEach((track) => {
      pc.addTrack(track, this.localStream!);
    });

    pc.ontrack = (event) => {
      this.callbacks.onRemoteStream?.(peerId, event.streams[0]);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal({
          type: "ice",
          to: peerId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    this.peers.set(peerId, pc);
    return pc;
  }

  private sendSignal(message: any) {
    if (this.signalingServerSocket?.readyState === WebSocket.OPEN) {
      this.signalingServerSocket.send(JSON.stringify(message));
    }
  }
}
