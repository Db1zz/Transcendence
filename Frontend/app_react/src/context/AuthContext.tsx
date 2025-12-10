import React, { useState } from 'react';
import { createContext, useContext, useEffect, type ReactNode } from "react";

type AuthContextType = {
	isAuthenticated: boolean;
	loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
	isAuthenticated: false,
	loading: false,
});

export const useAuth = () => useContext(AuthContext);

type Props = {
	children: ReactNode;
};

export const AuthProvider = ({children}: Props) => {
	const [loading, setloading] = useState(true);

	useEffect(()=> {
		fetch("http://localhost:8080/api/user", {credentials: "include"})
	})
	.then()
	return (
		<AuthContext.Provider value={{isAuthenticated, loading}}>
			{children}
			</AuthContext.Provider>
	)
}