import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import { CallProvider } from "../contexts/CallContext";
import { SocketProvider } from "../contexts/SocketContext";

const HomePage = () => {
  const { t } = useTranslation();
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div>{t("common.loading")}</div>;
  }
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  return (
    <CallProvider>
      <SocketProvider>
        <MainLayout></MainLayout>
      </SocketProvider>
    </CallProvider>
  );
};

export default HomePage;
