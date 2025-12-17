import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import bgLogin from '../img/bg_login.png';


const LoginPage: React.FC = () => {
	
	const backendBase = process.env.REACT_APP_API_BASE_URL || '';
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const fromLocation = (location.state)?.from?.pathname || "/";
	useEffect(() => {
		if (isAuthenticated) {
			navigate(fromLocation, {replace: true});
		}
	}, [isAuthenticated, fromLocation, navigate])

	const handleLogin = (provider: string) => {
		if (provider == 'github')
			window.location.href = 'http://localhost:8080/oauth2/authorization/github';
		if (provider == 'google')
			window.location.href = 'http://localhost:8080/oauth2/authorization/google';
		else
			return;
	}

	return (
		<div className="min-h-screen bg-brand-green flex items-center justify-center p-4 relative overflow-hidden">
			<div
				className="absolute inset-0 bg-cover bg-center"
				style={{ backgroundImage: `url(${bgLogin})` }}
			/>
			<div className="absolute inset-0 bg-brand-green opacity-60" />
			<div className="bg-brand-beige rounded-2xl p-8 w-full max-w-md shadow-sharp relative z-10">

				<h2 className="text-3xl font-bold text-black-500 text-center mb-2">login</h2>

				<div className="space-y-4">
					<div>
						<label className="block text-sm text-gray-300 mb-2">
							email address
						</label>
						<input
							type="email"
							className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="enter your email"
						/>
					</div>

					<div>
						<label className="block text-sm text-gray-300 mb-2">
							password
						</label>
						<input
							type="password"
							className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="enter your password"
						/>
					</div>

					<div className="text-sm">
						<a href="#!" className="text-gray-400 hover:text-white">
							forgot password?
						</a>
					</div>

					<button className="w-full bg-transparent border-2 border-white text-white py-3 rounded-lg hover:bg-white hover:text-gray-900 transition-colors font-medium">
						log me in!
					</button>
				</div>

				<div className="flex justify-center gap-4 my-6">
					<a onClick={() => handleLogin('github')} className="text-white hover:text-blue-400 transition-colors">
						<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
						</svg>
					</a>
					<a onClick={() => handleLogin('google')} className="text-white hover:text-red-400 transition-colors">
						<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
						</svg>
					</a>
				</div>

				<div className="text-center">
					<p className="text-gray-400">
						don't have an account?{' '}
						<a href="#!" className="text-white font-bold hover:underline">
							sign up
						</a>
					</p>
				</div>

			</div>
		</div>
	);
};

export default LoginPage;