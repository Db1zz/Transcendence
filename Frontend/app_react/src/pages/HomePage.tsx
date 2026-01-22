import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
// import ProfileButton from "../components/ProfileButton";
import MainLayout from "../components/MainLayout";

const testUser = {
  name: "kaneki",
  email: "example@example.com",
  picture: "https://media.tenor.com/I9qt03YKkjQAAAAe/monkey-thinking.png",
  status: "online" as const,
  role: "ADMIN" as const,
  about: "privet",
  createdAt: "2023-12-20T10:00:00Z",
};

const HomePage = () => {
  const { isAuthenticated, loading, user, setUser } = useAuth();

  if (loading) {
    return <div>loading...</div>;
  }
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  return (
    <MainLayout>
      {/* <ProfileButton
				user={testUser}
				className="w-[280px] mt-5"
				/> */}

      {/* <button 
				onClick={handleLogout}
				className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer mt-5">logout
			</button> */}
    </MainLayout>
  );
};

export default HomePage;
