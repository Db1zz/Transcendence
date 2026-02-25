import React, { useRef, useEffect } from "react";
import { useCallContext } from "../contexts/CallContext";
import { useWebRtc } from "../hooks/useWebRtc";

export const VoiceView: React.FC = () => {
    const callContext = useCallContext();
    const { remoteStreams } = useWebRtc(
        callContext.activeCall?.roomId!, 
        callContext.activeCall?.signalingServerAddress!,
        callContext.activeCall?.stunAddress!
    );
    
    const remoteVideoRef = useRef<Map<string, HTMLVideoElement>>(new Map());

    useEffect(() => {
        remoteStreams.forEach((stream, peerId) => {
            const videoElement = remoteVideoRef.current.get(peerId);
            if (videoElement && videoElement.srcObject !== stream) {
                videoElement.srcObject = stream;
            }
        });
    }, [remoteStreams]);

    const streamArray = Array.from(remoteStreams.entries());
    const count = streamArray.length;

    const getGridConfig = () => {
        if (count === 1) return "grid-cols-1 max-w-[800px]";
        if (count === 2) return "grid-cols-1 md:grid-cols-2 max-w-[1200px]";
        if (count <= 4) return "grid-cols-2 max-w-[1200px]";
        if (count <= 6) return "grid-cols-3 max-w-[1400px]";
        return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-full";
    };

    return (
        <div className="w-full h-full min-h-[80vh] p-4 flex items-center justify-center bg-[#313338]">
            <div className={`grid gap-4 w-full transition-all duration-300 ${getGridConfig()}`}>
                {streamArray.map(([peerId]) => (
                    <div 
                        key={peerId} 
                        className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-transparent hover:border-indigo-500 transition-colors"
                    >
                        <video
                            ref={el => {
                                if (el) remoteVideoRef.current.set(peerId, el);
                                else remoteVideoRef.current.delete(peerId);
                            }}
                            playsInline
                            autoPlay
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-xs">
                            User {peerId.slice(0, 4)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};