import React, { useState, useRef, useEffect } from "react";

let isInited: boolean = false;

type Signal = 
  | {type: "offer"; sdp: RTCSessionDescriptionInit}
  | {type: "answer"; sdp: RTCSessionDescriptionInit}
  | {type: "ice"; candidate: RTCIceCandidateInit};

type RtcSession = {
  id: string | null;
  sc: WebSocket;
  pc: RTCPeerConnection;
};

async function OnMessageCallback(message: MessageEvent, session: RtcSession) {
  if (typeof message.data !== "string") {
    return;
  }

  const parsedMessage = JSON.parse(message.data) as Signal;

  switch (parsedMessage.type) {
    case "offer": {
      console.log("[" + session.id + "]: Offer accepted, responding with the answer...");
      await session.pc.setRemoteDescription(parsedMessage.sdp);
      const answer = await session.pc.createAnswer();
      await session.pc.setLocalDescription(answer);

      const reply: Signal = { type: "answer", sdp: session.pc.localDescription! };
      session.sc.send(JSON.stringify(reply));
      break;
    }
    case "answer": {
      console.log("[" + session.id + "]: Got answer, trying to set remote description...");
      await session.pc.setRemoteDescription(parsedMessage.sdp);
      break;
    }
    case "ice": {
      await session.pc.addIceCandidate(parsedMessage.candidate);
      console.log("[" + session.id + "]: Ice candidate was added successfuly!");
      break;
    }
  }
};

async function OnIceCandidateCallback(event: RTCPeerConnectionIceEvent, session: RtcSession) {
  if (!event.candidate) {
    return;
  }

  const message: Signal = { type: "ice", candidate: event.candidate.toJSON() };
  if (session.sc.readyState === WebSocket.OPEN) {
    session.sc.send(JSON.stringify(message));
  }
}

async function OnOpenCallback(session: RtcSession) {
  const offer = await session.pc.createOffer();
  await session.pc.setLocalDescription(offer);

  const message: Signal = { type: "offer", sdp: session.pc.localDescription! };
  session.sc.send(JSON.stringify(message));
  console.log("[" + session.id + "]: Offer sent!");
}

function InitRtcSession(stunUrl: string, scUrl: string, id: string): RtcSession {
  const sc = new WebSocket(scUrl);

  const pcConfig: RTCConfiguration = { iceServers: [{ urls: stunUrl }] };
  const pc = new RTCPeerConnection(pcConfig);

  var session: RtcSession = {
    sc,
    pc,
    id
  };

  sc.addEventListener("message", (event) => OnMessageCallback(event, session));
  // sc.addEventListener("open", () => OnOpenCallback(session));
  pc.addEventListener("icecandidate", (event) => OnIceCandidateCallback(event, session));

  return session;
}

export default function TestPage() {
  const scUrl = "ws://127.0.0.1:8080/socket";
  const stunUrl = "stun:stun.l.google.com:19302";

  const s1Ref = useRef<RtcSession | null>(null);
  const s2Ref = useRef<RtcSession | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isInited == true) {
      return;
    }

    const s1 = InitRtcSession(stunUrl, scUrl, "pc1");
    const s2 = InitRtcSession(stunUrl, scUrl, "pc2");

    s1.sc.addEventListener("open", async () => { 
      const offer = await s1.pc.createOffer();
      await s1.pc.setLocalDescription(offer);

      const message: Signal = {type: "offer", sdp: s1.pc.localDescription! };
      s1.sc.send(JSON.stringify(message));
      console.log("[" + s1.id + "]: Offer sent!");
    });

    s1Ref.current = s1;
    s2Ref.current = s2;

    const localVideo = document.getElementById("localVideo") as HTMLVideoElement;
    const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement;

    localVideoRef.current = localVideo;
    remoteVideoRef.current = remoteVideo;

    isInited = true;


    navigator.mediaDevices.getUserMedia({audio: true, video: true}).then((localStream) => {
      localVideoRef.current!.srcObject = localStream;
      localStream.getTracks().forEach(track => s1.pc.addTrack(track, localStream));
    });

    s2.pc.addEventListener('track', (event) => {
      remoteVideo.srcObject = event.streams[0];
    });

    return () => {
      console.log("Closing everything....");
    };
  }, []);

return (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex gap-6">
      <video
        id="localVideo"
        playsInline
        autoPlay
        muted
        className="w-[600px] h-[350px] bg-black rounded-lg shadow"
      />
      <video
        id="remoteVideo"
        playsInline
        autoPlay
        className="w-[600px] h-[350px] bg-black rounded-lg shadow"
      />
    </div>
  </div>
);
}
