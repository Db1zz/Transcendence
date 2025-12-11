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

export const AuthProvider = ({ children }: Props) => {

	const [loading, setLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		fetch("http://localhost:8080/api/user", {
			credentials: "include"
		})
			.then((res) => {
				if (!res.ok) throw new Error("not authenticated");
				return res.json();
			})
			.then(data => {
				console.log("data= ", data);
				if (data !== null)
					setIsAuthenticated(true);
			})
			.catch((e) => console.log("error = ", e))
			.finally(() => setLoading(false));
	}, []);
	return (
		<AuthContext.Provider value={{ isAuthenticated, loading }}>
			{children}
		</AuthContext.Provider>
	)
}