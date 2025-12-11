import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const HomePage = () => {

	const { isAuthenticated, loading } = useAuth();

	if (loading) {
		return <div>loading...</div>
	}
	if (!isAuthenticated)
		return <Navigate to ="/login" replace/>

	const handleLogout = () => {
		window.location.href = 'http://localhost:8080/logout';
	}

	return (
		<div>
			<h2>hello you are on a home page.</h2>
			<h1>you have been logged in.</h1>
			
			<button onClick={handleLogout}>logout</button>
		</div>
	);
}

export default HomePage;