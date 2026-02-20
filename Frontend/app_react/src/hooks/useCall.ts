import { useState } from "react";
import { useAuth } from "../contexts/AuthContext"
import { useCallContext } from "../contexts/CallContext";

export const useCall = () => {
	const { startCall } = useCallContext();

	const { user } = useAuth();

	const getHeaders = () => {
		const headers: any = {
			"content-type": "application/json"
		};

		return headers;
	}

	const callToAUser = async (id: string) => {
		const response = await fetch('http://localhost:8080/api/voice', { 
		method: "POST", 
		credentials: "include",
		headers: getHeaders(), 
		body: JSON.stringify({
			creatorId : user?.id,
			invitedUsers: [id]
			})
		})

		if (!response.ok) {
			throw Error("TODO")
		}

		startCall({
			callerId: user!.id, // TODO check if user was authorized...
			invitedUsers: [id]
		});
	};

	return {
		callToAUser
	};
};