import React from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import './index.css';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';

function App() {
	return (
		<>
		<LoginPage />
		<Outlet />
		</>

  );
}

export default App;