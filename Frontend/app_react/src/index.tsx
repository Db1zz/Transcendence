import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import { AuthProvider } from "./contexts/AuthContext";
import ShowInfo from "./pages/ShowInfo";
import TestFriendsView from "./pages/TestFriendsView";
import SignupPage from "./pages/SignupPage";
// import SenderPage from "./pages/SenderPage";
// import RecieverPage from "./pages/RecieverPage";
import TestPage from "./pages/TestPage";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />}></Route>
          <Route path="/login" element={<LoginPage />}></Route>
          <Route path="/info" element={<ShowInfo />}></Route>
          <Route path="/testGrisha" element={<TestFriendsView />}></Route>
          <Route path="/signup" element={<SignupPage />}></Route>
          <Route path="/test" element={<TestPage />}></Route>
        </Routes>
      </Router>
    </AuthProvider>
);
