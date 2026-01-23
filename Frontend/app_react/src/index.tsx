import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Outlet,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import { AuthProvider } from "./context/AuthContext";
import ShowInfo from "./pages/ShowInfo";
import TestFriendsView from "./pages/TestFriendsView";
import SignupPage from "./pages/SignupPage";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />}></Route>
          <Route path="/login" element={<LoginPage />}></Route>
          <Route path="/info" element={<ShowInfo />}></Route>
          <Route path="/testGrisha" element={<TestFriendsView />}></Route>
		  <Route path="/signup" element={<SignupPage/>}></Route>
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>,
);
