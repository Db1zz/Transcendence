import React, { createContext, useContext, useState, ReactNode } from "react";
import { useWebRtc } from "../hooks/useWebRtc";

type CallData = {
  roomId: string;
  signalingServerAddress: string;
  stunAddress: string;
};

type CallContextType = {
  activeCall: CallData | null;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  initiateCall: (data: CallData) => void;
  endCall: () => void;
};

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider = ({ children }: { children: ReactNode }) => {
  const [activeCall, setActiveCall] = useState<CallData | null>(null);
  const { localStream, remoteStreams, start, leave } = useWebRtc();

  const initiateCall = (data: CallData) => {
    setActiveCall(data);
    start(data.roomId, data.signalingServerAddress, data.stunAddress);
  };

  const endCall = () => {
    leave();
    setActiveCall(null);
  };

  return (
    <CallContext.Provider
      value={{ activeCall, localStream, remoteStreams, initiateCall, endCall }}
    >
      {children}
      <div className="hidden">
        {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
          <RemoteAudio key={peerId} stream={stream} />
        ))}
      </div>
    </CallContext.Provider>
  );
};

const RemoteAudio = ({ stream }: { stream: MediaStream }) => {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  React.useEffect(() => {
    if (audioRef.current) audioRef.current.srcObject = stream;
  }, [stream]);
  return <audio ref={audioRef} autoPlay />;
};

export const useCallContext = () => {
  const context = useContext(CallContext);
  if (!context)
    throw new Error("useCallContext must be used within CallProvider");
  return context;
};
