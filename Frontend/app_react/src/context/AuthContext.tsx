import React, { useState, useCallback } from 'react';
import { createContext, useContext, useEffect, type ReactNode } from "react";
import defaultAvatar from "../img/default.png";

export type User = {
	id: string;
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
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
	isAuthenticated: false,
	loading: false,
	user: null,
	setUser: () => { },
	login: async () => false,
	logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

type Props = {
	children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {

	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	const saveAuthData = (data: any) => {
		const userData: User = {
			id: data.id || '',
			name: data.username || data.name || '',
			email: data.email || '',
			picture: data.picture || defaultAvatar,
			role: data.role || 'USER',
			status: 'online',
			about: 'default text',
			createdAt: data.createdAt || ""
		};

		localStorage.setItem('user', JSON.stringify(userData));
		setUser(userData);
	};

	useEffect(() => {
		const savedUser = localStorage.getItem('user');

		if (savedUser) {
			try {
				const parsedUser = JSON.parse(savedUser);
				setUser(parsedUser);
			} catch (error) {
				localStorage.removeItem('user');
				setUser(null);
				checkAuthStatus();
			}
		} else {
			checkAuthStatus();
		}
		setLoading(false);
	}, []);

	const checkAuthStatus = useCallback(async () => {
		try {
			const response = await fetch('http://localhost:8080/api/users/me', {
				credentials: 'include'
			});

			if (response.ok) {
				const data = await response.json();
				saveAuthData(data);
			} else {
				setUser(null);
				localStorage.removeItem('user');
			}
		} catch (error) {
			setUser(null);
			localStorage.removeItem('user');
		}
	}, []);

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
				const response = await fetch('http://localhost:8080/api/auth/login', {
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

	const logout = async () => {
		try {
			await fetch('http://localhost:8080/logout', {
				method: 'POST',
				credentials: 'include'
			});
		} catch (error) {
			console.error('error during logout:', error);
		} finally {
			localStorage.removeItem('user');
			setUser(null);
		}
	};

	const isAuthenticated = !!user;
	return (
		<AuthContext.Provider value={{ isAuthenticated, loading, user, setUser, login, logout }}>
			{children}
		</AuthContext.Provider>
	)
}