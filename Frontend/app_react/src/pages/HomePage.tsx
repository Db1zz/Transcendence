import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import ProfileButton from "../components/ProfileButton";

const testUser = {
	name: 'kaneki',
	email: 'example@example.com',
	picture: 'https://media.tenor.com/I9qt03YKkjQAAAAe/monkey-thinking.png',
	status: 'online' as const,
	role: 'ADMIN' as const,
}

const HomePage = () => {

	const { isAuthenticated, loading, user, setUser } = useAuth();

	if (loading) {
		return <div>loading...</div>
	}
	if (!isAuthenticated || !user)
		return <Navigate to ="/login" replace/>

	const handleLogout = () => {
		setUser(null);
		window.location.href = 'http://localhost:8080/logout';
	}

	return (
		<div className="text-center mt-2">
			{user?.name} : {user?.email} 
		<div>
			<h2>hello you are on a home page.</h2>
			<h1>you have been logged in.</h1>
			<ProfileButton
				user={testUser}
				className="w-[280px] mx-auto"
			/>
			<button 
				onClick={handleLogout}
				className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer">logout</button>
		</div>
		</div>
	);
}

export default HomePage;