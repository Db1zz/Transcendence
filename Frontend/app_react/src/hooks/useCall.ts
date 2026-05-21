import { useAuth } from "../contexts/AuthContext";
import { useCallContext } from "../contexts/CallContext";

export const useCall = () => {
  const { initiateCall, endCall, activeCall, localStream, remoteStreams } =
    useCallContext();
  const { user } = useAuth();

  const joinOrCreateRoom = async (calleeId: string) => {
    try {
      const response = await fetch("http://localhost:8080/api/voice/join", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callerId: user?.id,
          invitedUsers: [calleeId],
        }),
      });

      if (!response.ok) throw new Error("Failed to join room");

      const { roomId } = await response.json();

      initiateCall({
        roomId,
        signalingServerAddress: process.env.REACT_APP_SIGNALING_SERVER!,
        stunAddress: process.env.REACT_APP_STUN_SERVER!,
      });
    } catch (error) {
      console.error("Call initialization failed", error);
    }
  };

  const joinVoiceChannel = async (channelId: string) => {
    try {
      const response = await fetch("http://localhost:8080/api/voice/join", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callerId: user?.id,
          roomId: channelId,
          invitedUsers: [],
        }),
      });

      if (!response.ok) throw new Error("Failed to join voice channel");
      const { roomId } = await response.json();

      initiateCall({
        roomId,
        signalingServerAddress: process.env.REACT_APP_SIGNALING_SERVER!,
        stunAddress: process.env.REACT_APP_STUN_SERVER!,
      });
    } catch (error) {
      console.error("Voice channel initialization failed", error);
    }
  };

  return {
    joinOrCreateRoom,
    joinVoiceChannel,
    leaveRoom: endCall,
    activeCall,
    localStream,
    remoteStreams,
  };
};
