import React, { createContext, useContext, useState} from 'react';
import { type ReactNode } from 'react';

type CallData = {
	callerId: string
	invitedUsers: [string]
};

type CallContextType = {
	activeCall: CallData | null;
	startCall: (data: CallData) => void;
	endCall: () => void;
};

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider = ({ children }: { children: ReactNode } ) => {
	const [activeCall, setActiveCall] = useState<CallData | null>(null);

	const startCall = (data: CallData) => setActiveCall(data);
	const endCall = () => setActiveCall(null);

	return (
		<CallContext.Provider value={{activeCall, startCall, endCall}}>
			{children}
		</CallContext.Provider>
	);
};

export const useCallContext = () => {
	const context = useContext(CallContext);

	if (!context) {
		throw new Error('useCallContext must be used within CallProvider');
	}

	return context;
};