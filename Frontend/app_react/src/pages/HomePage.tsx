import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

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

	return (
		<div className="text-center mt-2">
			name: {user?.name}<br />
			email: {user?.email} <br />
			role: {user?.role}<br />
			picture:
			<div className="flex justify-center mt-4">
				<img className="h-[150px] w-[150px] object-cover rounded-full" src={user.picture} alt="profile picture" />
			</div>
			<div>
				<h2>hello you are on a home page.</h2>
				<h1>you have been logged in.</h1>

				<button
					onClick={handleLogout}
					className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer">logout</button>
			</div>
		</div>
	);
}

export default HomePage;