import { useAuth } from "../contexts/AuthContext";
import { useCallContext } from "../contexts/CallContext";

export const useCall = () => {
  const { startCall } = useCallContext();
  const { user } = useAuth();

  const callToAUser = async (calleeId: string) => {
    const response = await fetch("http://localhost:8080/api/voice/join", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        callerId: user?.id,
        invitedUsers: [calleeId],
      }),
    });

    if (!response.ok) {
      throw Error("TODO");
    }

    const responseData = await response.json();
    const roomId = responseData.roomId;

    startCall({
      roomId: roomId,
      signalingServerAddress: process.env.REACT_APP_SIGNALING_SERVER!,
      stunAddress: process.env.REACT_APP_STUN_SERVER!,
    });
  };

  const joinCall = async () => {
    // startCall({
    // });
  };

  return {
    callToAUser,
    joinCall,
  };
};
