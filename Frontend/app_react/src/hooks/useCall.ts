import { useCallContext } from "../contexts/CallContext";

// const getHeaders = () => {
// 	const headers: any = {
// 		"content-type": "application/json"
// 	};

// 	return headers;
// }

export const useCall = () => {
  const { startCall } = useCallContext();
  // const { user } = useAuth();

  const callToAUser = async (id: string) => {
    // const response = await fetch('http://localhost:8080/api/voice', {
    // method: "POST",
    // credentials: "include",
    // headers: getHeaders(),
    // body: JSON.stringify({
    // 	creatorId : user?.id,
    // 	invitedUsers: [id]
    // 	})
    // })

    // if (!response.ok) {
    // 	throw Error("TODO");
    // }

    // const responseData = await response.json();

    // const roomId = responseData.roomId;

    startCall({
      roomId: "cb9b647f-59a7-4580-934f-7da9b41eb7a8",
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
