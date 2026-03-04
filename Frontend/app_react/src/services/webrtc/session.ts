import { RtcSignal } from "./types";

type WebRtcSessionCallbacks = {
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (peerId: string, stream: MediaStream) => void;
  onRemoteStreamDelete?: (peerId: string) => void;
};

export class WebRtcSession {
  public roomId: string;
  public signalingServerSocket: WebSocket | null;
  public peers: Map<string, RTCPeerConnection>;
  public localStream: void | MediaStream | null;

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
    this.signalingServerSocket = null;
    this.peers = new Map<string, RTCPeerConnection>();
    this.signalingServerAddress = new URL(signalingServerAddress);
    this.signalingServerAddress.searchParams.append("roomId", roomId);
    this.stunAddress = stunAddress;
    this.localStream = null;
    this.callbacks = callbacks;
  }

  public destroy() {
    console.log("Destroying WebRtc session...");

    if (this.signalingServerSocket != null) {
      this.signalingServerSocket.close();
    }
  }

  public async start() {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        this.localStream = stream;

        if (this.callbacks.onLocalStream) {
          this.callbacks.onLocalStream(this.localStream);
        }

        this.signalingServerSocket = new WebSocket(this.signalingServerAddress);
        this.signalingServerSocket!.addEventListener("message", (message) =>
          this.onMessageCallback(message),
        );
      });
  }

  private onMessageCallback(message: MessageEvent) {
    console.log("Message data: ", message.data);
    const pm = JSON.parse(message.data) as RtcSignal;

    switch (pm.type) {
      case "new-connection": {
        this.handleNewConnectionEvent(pm.from);
        break;
      }
      case "user-disconnection": {
        this.handleUserDisconnectionEvent(pm.from);
        break;
      }
      case "offer": {
        this.handleOfferEvent(pm.from, pm.sdp);
        break;
      }
      case "answer": {
        this.handleAnswerEvent(pm.from, pm.sdp);
        break;
      }
      case "ice": {
        this.handleIceEvent(pm.from, pm.candidate);
        break;
      }
    }
  }

  private async handleNewConnectionEvent(from: string) {
    const pc = this.createPeerConnection(from);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    const message = { type: "offer", to: from, sdp: pc.localDescription! };
    this.signalingServerSocket!.send(JSON.stringify(message));
  }

  private handleUserDisconnectionEvent(from: string) {
    this.peers.delete(from);

    if (this.callbacks.onRemoteStreamDelete) {
      this.callbacks.onRemoteStreamDelete(from);
    }
  }

  private async handleOfferEvent(from: string, sdp: RTCSessionDescriptionInit) {
    const pc = this.createPeerConnection(from);

    pc.setRemoteDescription(sdp);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    const message = { type: "answer", to: from, sdp: pc.localDescription! };
    this.signalingServerSocket!.send(JSON.stringify(message));
  }

  private async handleAnswerEvent(
    from: string,
    sdp: RTCSessionDescriptionInit,
  ) {
    const pc = this.peers.get(from);
    if (pc === undefined) {
      throw new Error("TODO2");
    }

    pc.setRemoteDescription(sdp);
  }

  private async handleIceEvent(from: string, candidate: RTCIceCandidateInit) {
    if (candidate == null) {
      return;
    }

    const pc = this.peers.get(from);
    if (pc === undefined) {
      throw new Error("TODO3 WTf?");
    }

    await pc.addIceCandidate(candidate);
  }

  private createPeerConnection(peerId: string): RTCPeerConnection {
    const pcConfig: RTCConfiguration = {
      iceServers: [{ urls: this.stunAddress }],
    };
    const pc = new RTCPeerConnection(pcConfig);

    this.localStream!.getTracks().forEach((track) =>
      pc.addTrack(track, this.localStream!),
    );

    pc.addEventListener("track", (event) =>
      this.onTrackCallback(peerId, event),
    );
    pc.addEventListener("icecandidate", (event) =>
      this.onIceCandidateCallback(event, peerId),
    );

    this.peers.set(peerId, pc);

    return pc;
  }

  private onIceCandidateCallback(event: RTCPeerConnectionIceEvent, to: string) {
    if (event.candidate) {
      const message = {
        type: "ice",
        to: to,
        candidate: event.candidate.toJSON(),
      };
      this.signalingServerSocket!.send(JSON.stringify(message));
    }
  }

  private onTrackCallback(from: string, event: RTCTrackEvent) {
    if (this.callbacks.onRemoteStream) {
      this.callbacks.onRemoteStream(from, event.streams[0]);
    }
  }
}
