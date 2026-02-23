import { useAuth } from "../contexts/AuthContext"
import { useCallContext } from "../contexts/CallContext";
import { WebRtcSession } from "../services/webrtc/session";

const getHeaders = () => {
	const headers: any = {
		"content-type": "application/json"
	};

	return headers;
}

export const useCall = () => {
	const { startCall } = useCallContext();
	const { user } = useAuth();

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

		const signalingServerAddress = process.env.REACT_APP_SIGNALING_SERVER;
		const stunAddress = process.env.REACT_APP_STUN_SERVER;

		const webRtcSession = new WebRtcSession("cb9b647f-59a7-4580-934f-7da9b41eb7a8", signalingServerAddress!, stunAddress!);
		webRtcSession.joinCall();
		startCall({ webRtcSession });
	};

	const joinCall = async () => {
		// startCall({
    
		// });
	};

	return {
		callToAUser,
		joinCall
	};
};