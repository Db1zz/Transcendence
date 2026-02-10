import React, { useState, useRef, useEffect } from "react";

type Signal = 
  | {type: "offer"; sdp: RTCSessionDescriptionInit}
  | {type: "answer"; sdp: RTCSessionDescriptionInit}
  | {type: "ice"; candidate: RTCIceCandidateInit};

function handleEnter(userInput: string) {
  console.log("User input: " + userInput);
}

export default function TestPage() {
  const [userInput, setUserInput] = useState<string>("");

  const signalingRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const signalingChannel = new WebSocket("ws://127.0.0.1:8080/socket");
    signalingRef.current = signalingChannel;

    const configuration: RTCConfiguration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };
    const peerConnection = new RTCPeerConnection(configuration);
    pcRef.current = peerConnection;

    peerConnection.onicecandidate = (ice) => {
      if (!ice.candidate) return;

      const message: Signal = { type: "ice", candidate: ice.candidate.toJSON() };
      if (signalingChannel.readyState === WebSocket.OPEN) {
        signalingChannel.send(JSON.stringify(message));
      }
    };

    const onMessage = async (message: MessageEvent) => {
      if (typeof message.data !== "string") return;

      const parsedMessage = JSON.parse(message.data) as Signal;

      switch (parsedMessage.type) {
        case "offer": {
          await peerConnection.setRemoteDescription(parsedMessage.sdp);
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          const reply: Signal = { type: "answer", sdp: peerConnection.localDescription! };
          signalingChannel.send(JSON.stringify(reply));
          console.log("Offer accepted, responding with the answer!");
          break;
        }
        case "answer": {
          await peerConnection.setRemoteDescription(parsedMessage.sdp);
          console.log("Offer was successfuly accepted, answer accpeted as well!");
          break;
        }
        case "ice": {
          await peerConnection.addIceCandidate(parsedMessage.candidate);
          break;
        }
      }
    };

    const onOpen = async () => {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      const message: Signal = { type: "offer", sdp: peerConnection.localDescription! };
      signalingChannel.send(JSON.stringify(message));
      console.log("Offer sent!");
    };

    signalingChannel.addEventListener("message", onMessage);
    signalingChannel.addEventListener("open", onOpen);

    return () => {
      signalingChannel.removeEventListener("message", onMessage);
      signalingChannel.removeEventListener("open", onOpen);
      signalingChannel.close();
      peerConnection.close();

      signalingRef.current = null;
      pcRef.current = null;
    };
  }, []);

  return (
    <div>
      <input
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleEnter(userInput);
          }
        }}
      />
    </div>
  );
}
