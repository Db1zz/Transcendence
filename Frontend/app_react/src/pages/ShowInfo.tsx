import React, { useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function ShowInfo() {
	const {user, loading, isAuthenticated} = useAuth();

	useEffect(() => {
		if(!loading && isAuthenticated && user?.role === 'ADMIN') {
			getInfo();
		}
	}, [loading, isAuthenticated]);

	const getInfo = () => {
		axios.get("http://localhost:8080/api/info", {withCredentials: true})
		.then(res => {
			console.log("admin info =", res);
		})
		.catch(err => {
			console.log("err=", err);
		})
		
	}

	if (user?.role === 'USER') {
		return (
			<div>USER PAGE</div>
		)
	}

	return (
		<div>secured admin page</div>
	)
}

export default ShowInfo