import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import bgLogin from '../img/bg_login.png';
import { Button } from '../components/Button';
import { OAuthLogin } from '../components/OAuthLogin';

const SignupPage: React.FC = () => {
	return (
		<div className="min-h-screen bg-brand-green flex flex-col items-center justify-center p-4 relative overflow-hidden">
			<div
				className="absolute inset-0 bg-cover bg-center"
				style={{ backgroundImage: `url(${bgLogin})` }}
			/>
			<div className="absolute inset-0 bg-brand-green opacity-80" />

			<div className="font-ananias border-2 border-gray-800 bg-white h-20 w-full max-w-md flex items-center justify-center p-4 relative z-10 mb-16">
				<h1 className="text-l text-gray-800">welcome to anteiku cafe</h1>
			</div>

			<div className="border-2 border-gray-800 bg-brand-beige rounded-2xl p-8 w-full max-w-lg shadow-sharp relative z-10">

				<h2 className="text-3xl font-ananias font-bold text-brand-brick text-center mb-3">sign up</h2>
				<h3 className="text-l font-ananias text-brand-brick text-center mb-4">sign up to continue</h3>

				<div className="block px-8 space-y-4 font-roboto">
					<div>
						<label className="block text-sm text-brand-brick mb-2">
							email
						</label>
						<input
							type="email"
							className="w-full px-4 py-3 bg-brand-green placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-brick"
							placeholder="enter your email"
						/>
					</div>

					<div>
						<label className="block text-sm text-brand-brick mb-2">
							password
						</label>
						<input
							type="password"
							className="w-full px-4 py-3 bg-brand-green placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-brick"
							placeholder="enter your password"
						/>
					</div>

					<div>
						<label className="block text-sm text-brand-brick mb-2">
							name
						</label>
						<input
							type="name"
							className="w-full px-4 py-3 bg-brand-green placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-brick"
							placeholder="enter your name"
						/>
					</div>
					<div>
						<label className="block text-sm text-brand-brick mb-2">
							username
						</label>
						<input
							type="username"
							className="w-full px-4 py-3 bg-brand-green placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-brick"
							placeholder="create a username "
						/>
					</div>

					<div className="flex justify-center">
						<Button text="sign up" />
					</div>
				</div>

				<div className="flex justify-center gap-4 my-6">
					<OAuthLogin />
				</div>

				<div className="text-center font-roboto text-brand-brick">
					<p>
						already have an account?{' '}
						<a href="/login" className="font-bold hover:underline">
							login
						</a>
					</p>
				</div>

			</div>
		</div>
	);
}

export default SignupPage