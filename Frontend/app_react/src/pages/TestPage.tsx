import React, { useState, useRef, useEffect } from "react";

type Signal = 
  | {type: "offer"; sdp: RTCSessionDescriptionInit}
  | {type: "answer"; sdp: RTCSessionDescriptionInit}
  | {type: "ice"; candidate: RTCIceCandidateInit};

type RtcSession = {
  id: string | null;
  roomId: string | null;
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

      const reply = { roomId: session.roomId, type: "answer", sdp: session.pc.localDescription! };
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

  const message = {roomId: session.roomId, type: "ice", candidate: event.candidate.toJSON() };
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

function InitRtcSession(stunUrl: string, scUrl: string, id: string, roomId: string): RtcSession {
  const sc = new WebSocket(scUrl);

  const pcConfig: RTCConfiguration = { iceServers: [{ urls: stunUrl }] };
  const pc = new RTCPeerConnection(pcConfig);

  var session: RtcSession = {
    sc,
    pc,
    id,
    roomId
  };

  sc.addEventListener("message", (event) => OnMessageCallback(event, session));
  pc.addEventListener("icecandidate", (event) => OnIceCandidateCallback(event, session));

  return session;
}

export default function TestPage() {
  const meResponse = async () => 
    await fetch("http://localhost:8080/api/users/me", {
      credentials: "include"
    });

  var userId: string;

  async function fetchUserId() {
    try {
      const response = await meResponse();
      if (!response.ok) throw new Error('HTTP error ' + response.status);
      const data = await response.json();
      userId = data.id;
      console.log('userId:', userId);
      return userId;
    } catch (err) {
      console.log("Error: ", err);
    }
  }

  var roomId: string;

  const createRoomRequest = async () =>
      await fetch('http://localhost:8080/api/voice', {
      credentials: "include",
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
      creatorId: userId,
      invitedUsers: []
    })
  });

  const isInited = useRef(false);

  const s1Ref = useRef<RtcSession | null>(null);
  const s2Ref = useRef<RtcSession | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

useEffect(() => {
    fetchUserId()
    .then(res => {
    createRoomRequest()
      .then(res => res.json())
      .then(data => {
          roomId = data.roomId;

          var scUrl = "ws://127.0.0.1:8080/socket";
          const stunUrl = "stun:stun.l.google.com:19302";

          const params = new URLSearchParams({
            roomId: roomId
          })

          scUrl = scUrl + '?' + params.toString();

          console.log("Room id: ", roomId);

          if (isInited.current) return;
          isInited.current = true;

          const s1 = InitRtcSession(stunUrl, scUrl, "u1", roomId);
          const s2 = InitRtcSession(stunUrl, scUrl, "u2", roomId);
          s1Ref.current = s1;
          s2Ref.current = s2;

          const localVideo = document.getElementById("localVideo") as HTMLVideoElement;
          const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement;
          localVideoRef.current = localVideo;
          remoteVideoRef.current = remoteVideo;

          s2.pc.addEventListener('track', (event) => {
            remoteVideoRef.current!.srcObject = event.streams[0];
            console.log("[" + s2.id + "]: has received remote stream!");
          });

          Promise.all([
            new Promise<void>((resolve) => {
              if (s1.sc.readyState === WebSocket.OPEN) resolve();
              else s1.sc.addEventListener("open", () => resolve(), { once: true });
            }),
            new Promise<void>((resolve) => {
              if (s2.sc.readyState === WebSocket.OPEN) resolve();
              else s2.sc.addEventListener("open", () => resolve(), { once: true });
            })
          ]).then(async () => {
            const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            localVideoRef.current!.srcObject = localStream;
            localStream.getTracks().forEach(track => s1.pc.addTrack(track, localStream));
            
            const offer = await s1.pc.createOffer();
            await s1.pc.setLocalDescription(offer);
            console.log("Test: ", s1.roomId)
            const message = {roomId: s1.roomId, type: "offer", sdp: s1.pc.localDescription! };
            s1.sc.send(JSON.stringify(message));
            console.log("[" + s1.id + "]: Offer sent!");
          }).catch(console.error);
        });
    });

  return () => { /* cleanup(i'm lazy)*/ };
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
