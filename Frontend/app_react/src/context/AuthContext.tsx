import React, { useState } from 'react';
import { createContext, useContext, useEffect, type ReactNode } from "react";


type User = {
	name: string;
	email: string;
	picture?: string;
	role: 'USER' | 'ADMIN';
}

type AuthContextType = {
	isAuthenticated: boolean;
	loading: boolean;
	user: User | null;
	setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
	isAuthenticated: false,
	loading: false,
	user: null,
	setUser: () => { },
});

export const useAuth = () => useContext(AuthContext);

type Props = {
	children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {

	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	//const [isAuthenticated, setIsAuthenticated] = useState(false);

useEffect(() => {
    const token = localStorage.getItem('accessToken');

    const headers: HeadersInit = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    fetch("http://localhost:8080/api/user", {
        credentials: "include",
        headers
    })
        .then((res) => {
            if (!res.ok) {
                localStorage.removeItem('accessToken');
                setUser(null);
                return;
            }
            return res.json();
        })
        .then(data => {
            if (data) {
                setUser({
                    name: data.username,
                    email: data.email,
                    picture: data.picture,
                    role: data.role
                });
            }
        })
        .catch(() => {
            setUser(null);
        })
        .finally(() => setLoading(false));
}, []);

	const isAuthenticated = !!user;
	return (
		<AuthContext.Provider value={{ isAuthenticated, loading, user, setUser }}>
			{children}
		</AuthContext.Provider>
	)
}