import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
// import ProfileButton from "../components/ProfileButton";
import MainLayout from "../components/MainLayout";
import { CallProvider } from "../contexts/CallContext";

const HomePage = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div>loading...</div>;
  }
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  return (
    <CallProvider>
    <MainLayout>
      <div>
        {/* <ProfileButton
				user={testUser}
				className="w-[280px] mt-5"
				/> */}

        {/* <button
				onClick={handleLogout}
				className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer mt-5">logout
			</button> */}
      </div>
      </MainLayout>
    </CallProvider>
  );
};

export default HomePage;
