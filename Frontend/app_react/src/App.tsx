import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';

function App() {
	return (
		// <LoginPage />
		<Router>
			<Routes>
				<Route path='/home' element={<HomePage/>}/>
				<Route path='/login' element={<LoginPage/>}/>
		</Routes>
	</Router >
  );
}

export default App;