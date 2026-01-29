import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
// import ProfileButton from "../components/ProfileButton";
import MainLayout from "../components/MainLayout";

const HomePage = () => {
  const { isAuthenticated, loading, user } = useAuth();

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
