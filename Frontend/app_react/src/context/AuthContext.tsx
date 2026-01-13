import React, { useState } from 'react';
import { createContext, useContext, useEffect, type ReactNode } from "react";
import defaultAvatar from '../img/default.png';


export type User = {
	name: string;
	email: string;
	picture?: string;
	status: 'online' | 'idle' | 'dnd' | 'offline';
	//i will add it to db maybe we can migrate to redis later idk
	about: string;
	createdAt: string;
	role: 'USER' | 'ADMIN';
}

type AuthContextType = {
	isAuthenticated: boolean;
	loading: boolean;
	user: User | null;
	setUser: (user: User | null) => void;
	login: (provider: 'github' | 'google' | 'credentials', credentials?: { email: string; password: string }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
	isAuthenticated: false,
	loading: false,
	user: null,
	setUser: () => { },
	login: async () => false,
});

export const useAuth = () => useContext(AuthContext);

type Props = {
	children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {

	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	const saveAuthData = (data: any) => {
		const userInfo = data.userInfo || data;
		const userData: User = {
			name: userInfo.username || userInfo.name,
			email: userInfo.email,
			picture: userInfo.picture || defaultAvatar,
			role: userInfo.role
		};

		localStorage.setItem('user', JSON.stringify(userData));
		if (data.accessToken) {
			localStorage.setItem('accessToken', data.accessToken);
		}
		setUser(userData);
	};

	useEffect(() => {
		const token = localStorage.getItem('accessToken');
		const savedUser = localStorage.getItem('user');

		if (token && savedUser) {
			try {
				setUser(JSON.parse(savedUser));
			} catch (error) {
				localStorage.removeItem('accessToken');
				localStorage.removeItem('user');
				setUser(null);
			}
		} else if (!token && !savedUser) {
			checkAuthStatus();
		}
		setLoading(false);
	}, []);

	const checkAuthStatus = async () => {
		try {
			const response = await fetch('http://localhost:8080/api/users/me', {
				credentials: 'include'
			});

			if (response.ok) {
				const data = await response.json();
				saveAuthData(data);
			}
		} catch (error) {
		}
	};

	const login = async (
		provider: 'github' | 'google' | 'credentials',
		credentials?: { email: string; password: string }
	): Promise<boolean> => {
		if (provider === 'github' || provider === 'google') {
			window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
			return true;
		}

		if (provider === 'credentials' && credentials) {
			try {
				const response = await fetch('http://localhost:8080/api/auth', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						email: credentials.email,
						password: credentials.password,
					}),
					credentials: 'include'
				});

				if (response.ok) {
					const data = await response.json();
					//localStorage.setItem('accessToken', data.accessToken);
					saveAuthData(data);
					return true;
				} else {
					return false;
				}
			} catch (error) {
				console.error('error during login:', error);
				return false;
			}
		}

		return false;
	};

	const isAuthenticated = !!user;
	return (
		<AuthContext.Provider value={{ isAuthenticated, loading, user, setUser, login }}>
			{children}
		</AuthContext.Provider>
	)
}