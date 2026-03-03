import { useEffect, useRef, useState } from "react";
import { WebRtcSession } from "../services/webrtc/session";

export function useWebRtc(roomId: string, signalingServerAddress: string, stunAddress: string) {
	const [localStream, setLocalStream] = useState<MediaStream | null>(null);
	const [remoteStreams, setRemoteStream] = useState<Map<string, MediaStream>>(new Map());
	const webRtcSessionRef = useRef<WebRtcSession>(null);

 	useEffect(() => {
		webRtcSessionRef.current = new WebRtcSession(
		roomId,
		signalingServerAddress,
		stunAddress,
			{
				onLocalStream: setLocalStream,
				onRemoteStream: (peerId, stream) => {
					setRemoteStream(prev => new Map(prev.set(peerId, stream)));
				},
				onRemoteStreamDelete: (peerId) => {
					setRemoteStream(perv => {
						const newMap = new Map(perv);
						newMap.delete(peerId);
						return newMap;
					});
				}
			}
		);
		webRtcSessionRef.current.start();
	}, []);
	return { localStream, remoteStreams, webRtcSessionRef };
}