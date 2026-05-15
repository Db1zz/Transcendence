import { useEffect, useRef, useState, useCallback } from "react";
import { WebRtcSession } from "../services/webrtc/session";

export function useWebRtc() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStream] = useState<Map<string, MediaStream>>(new Map());
  const webRtcSessionRef = useRef<WebRtcSession | null>(null);

  const leave = useCallback(() => {
    localStream?.getTracks().forEach((track) => track.stop());
    
    webRtcSessionRef.current?.destroy();
    webRtcSessionRef.current = null;

    setLocalStream(null);
    setRemoteStream(new Map());
  }, [localStream]);

  const start = useCallback((roomId: string, signalingAddress: string, stunAddress: string) => {
    if (webRtcSessionRef.current) return;

    webRtcSessionRef.current = new WebRtcSession(
      roomId,
      signalingAddress,
      stunAddress,
      {
        onLocalStream: setLocalStream,
        onRemoteStream: (peerId, stream) => {
          setRemoteStream((prev) => new Map(prev).set(peerId, stream));
        },
        onRemoteStreamDelete: (peerId) => {
          setRemoteStream((prev) => {
            const newMap = new Map(prev);
            newMap.delete(peerId);
            return newMap;
          });
        },
      },
    );

    webRtcSessionRef.current.start();
  }, []);

  useEffect(() => {
    return () => {
      webRtcSessionRef.current?.destroy();
    };
  }, []);

  return { localStream, remoteStreams, start, leave };
}