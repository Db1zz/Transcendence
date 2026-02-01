import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import ProfileButton from "../components/ProfileButton";
import { resolve } from "path";
import { error } from "console";

const testUser = {
	name: 'kaneki',
	email: 'example@example.com',
	picture: 'https://media.tenor.com/I9qt03YKkjQAAAAe/monkey-thinking.png',
	status: 'online' as const,
	role: 'ADMIN' as const,
	about: 'privet',
	createdAt: '2023-12-20T10:00:00Z',
}

const HomePage = () => {

	const { isAuthenticated, loading, user, setUser } = useAuth();

	if (loading) {
		return <div>loading...</div>
	}
	if (!isAuthenticated || !user)
		return <Navigate to="/login" replace />

	const handleLogout = () => {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('user');
		setUser(null);
		window.location.href = 'http://localhost:8080/logout';
	}

	const handleRefresh = async () => {
		const response = await fetch('http://localhost:8080/api/auth/refresh', {
				method: 'POST',
				credentials: 'include'
			});

		if (!response.ok) {
			throw new Error('Server failed to refresh tokens');
		}

		const data = await response.json();
		localStorage.setItem('accessToken', data.accessToken);
		localStorage.setItem('refreshToken', data.refreshToken);
	}

	return (
		<div className="flex flex-col gap-4 items-center">
			{user?.name} : {user?.email} 
		<div>
			<h2>hello you are on a home page.</h2>
			<h1>you have been logged in.</h1>
			<ProfileButton
				user={testUser}
				className="w-[280px] mt-5"
			/>

			<button 
				onClick={handleLogout}
				className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer mt-5">logout
			</button>

			<button 
				onClick={handleRefresh}
				className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer mt-5">refresh
			</button>

		</div>
		</div>
	);
}

export default HomePage;