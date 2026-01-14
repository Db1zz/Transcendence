import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import bgLogin from '../img/bg_login.png';
import { Button } from '../components/Button';
import { OAuthLogin } from '../components/OAuthLogin';
import validator from 'validator'

const SignupPage: React.FC = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [passwordCopy, setPasswordCopy] = useState('');
	const [username, setUsername] = useState('');
	const [loading, setLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [errorMessagePassword, setErrorMessagePassword] = useState('');
	const [errorMessageCopyPassword, setErrorMessageCopyPassword] = useState('');
	//const [errorMessageEmail, setErrorMessageEmail] = useState('');
	const [passwordChecks, setPasswordChecks] = useState({
		length: false,
		lower: false,
		upper: false,
		number: false,
		symbol: false,
	});

	// const validateEmail = (value: string): boolean => {
	// 	if (validator.isEmail(value)) {
	// 		setErrorMessagePassword('');
	// 		return true;
	// 	} else {
	// 		setErrorMessagePassword('please enter a valid email');
	// 		return false;
	// 	}
	//change to just parsing fetch responses when they are implemented
	// }

	const validateCopyPassword = (value: string) => {
		if (value && value !== password)
			setErrorMessageCopyPassword("passwords should match");
		else
			setErrorMessageCopyPassword("");
	}

		const validatePassword = (value: string): boolean => {
			const checks = {
				length: validator.isLength(value, { min: 8 }),
				lower: validator.matches(value, /[a-z]/),
				upper: validator.matches(value, /[A-Z]/),
				number: validator.matches(value, /[0-9]/),
				symbol: validator.matches(value, /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/),
			};

			setPasswordChecks(checks);

			const missing: string[] = [];
			if (!checks.length) missing.push('8+ characters');
			if (!checks.lower) missing.push('1 lowercase');
			if (!checks.upper) missing.push('1 uppercase');
			if (!checks.number) missing.push('1 number');
			if (!checks.symbol) missing.push('1 symbol');

			if (missing.length === 0) {
				setErrorMessagePassword('');
				return true;
			}

			setErrorMessagePassword(`password needs: ${missing.join(', ')}`);
			return false;
		}

		const handleSubmit = async (e: React.FormEvent) => {
			e.preventDefault();
			//const emailOk = validateEmail(email);
			//check that all error messages are null instead
			const passwordOk = validatePassword(password);
			if (!passwordOk) return;
			setLoading(true);

			try {
				const response = await fetch('http://localhost:8080/api/users/register', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						username,
						email,
						password,
					}),
				});

				// add user with this email exists? validation : register
				//incorrect email format
				//password validation
				//make a var msg that will be displayed in a div after error if isSuccess false (each block or separately?)
				if (response.ok) {
					console.log('success');
					setIsSuccess(true);
				} else {
					console.error('signup failed:', response.statusText);
				}
			} catch (error) {
				console.error('error during signup:', error);
			} finally {
				setLoading(false);
			}
		};

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


					{isSuccess ? (
						<div className="flex flex-col items-center justify-center space-y-6 py-8">
							<h2 className="text-2xl font-ananias font-bold text-brand-brick text-center">
								you have successfully created an account
							</h2>
							<Button text="back to log in" onClick={() => navigate('/login')} />
						</div>
					) : (
						<>
							<h2 className="text-3xl font-ananias font-bold text-brand-brick text-center mb-3">sign up</h2>
							<h3 className="text-l font-ananias text-brand-brick text-center mb-4">sign up to continue</h3>

							<form onSubmit={handleSubmit} className="block px-8 space-y-4 font-roboto">
								<div>
									<label className="block text-sm text-brand-brick mb-2">
										email
									</label>
									<input
										type="email"
										value={email}
										onChange={(e) => {
											const val = e.target.value;
											setEmail(val);
											//validateEmail(val);
										}}
										className="w-full px-4 py-3 bg-brand-green placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-brick"
										placeholder="enter your email"
										required
									/>
									{/* {errorMessageEmail === '' ? null :
									<span className='font-bold text-brand-brick'>please enter correct email!</span>} */}
								</div>

								<div>
									<label className="block text-sm text-brand-brick mb-2">
										password
									</label>
									<input
										type="password"
										value={password}
										onChange={(e) => {
											const val = e.target.value;
											setPassword(val);
											validatePassword(val);
										}}
										className="w-full px-4 py-3 bg-brand-green placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-brick"
										placeholder="create your password"
										required
									/>
									{errorMessagePassword === '' ? null :
										<span style={{
											fontWeight: 'bold',
											color: 'brand-brick',
										}}>{errorMessagePassword}</span>}
								</div>

								<div>
									<label className="block text-sm text-brand-brick mb-2">
										confirm password
									</label>
									<input
										type="password"
										value={passwordCopy}
										onChange={(e) => {
											const val = e.target.value;
											setPasswordCopy(val);
											validateCopyPassword(val);
										}}
										className="w-full px-4 py-3 bg-brand-green placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-brick"
										placeholder="repeat your password"
										required
									/>
									{errorMessageCopyPassword === '' ? null :
										<span style={{
											fontWeight: 'bold',
											color: 'brand-brick',
										}}>{errorMessageCopyPassword}</span>}
								</div>

								<div>
									<label className="block text-sm text-brand-brick mb-2">
										username
									</label>
									<input
										type="text"
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										className="w-full px-4 py-3 bg-brand-green placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-brick"
										placeholder="create a username"
										required
									/>
								</div>

								<div className="flex justify-center">
									<Button
										type="submit"
										text="sign up"
										disabled={loading}
										className="px-8 py-3 hover:bg-opacity-90"
									/>
								</div>
							</form>

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
						</>
					)}
				</div>
			</div>
		);
	}

	export default SignupPage;
