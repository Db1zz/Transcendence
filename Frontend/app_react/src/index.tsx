import ReactDOM from "react-dom/client";
import "./index.css";
import "./i18n";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import { AuthProvider } from "./contexts/AuthContext";
import ShowInfo from "./pages/ShowInfo";
import TestFriendsView from "./pages/TestFriendsView";
import SignupPage from "./pages/SignupPage";
import { NotificationProvider } from "./contexts/NotificationContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <AuthProvider>
    <Router>
      <NotificationProvider notifyWsAddr="wss://localhost/notify/ws">
        <Routes>
          <Route path="/" element={<HomePage />}></Route>
          <Route path="/login" element={<LoginPage />}></Route>
          <Route path="/info" element={<ShowInfo />}></Route>
          <Route path="/testGrisha" element={<TestFriendsView />}></Route>
          <Route path="/signup" element={<SignupPage />}></Route>
        </Routes>
      </NotificationProvider>
    </Router>
  </AuthProvider>,
);
