import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import bgLogin from "../img/bg_login.png";
import { Button } from "../components/Button";
import { OAuthLogin } from "../components/OAuthLogin";

const LoginPage: React.FC = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fromLocation = location.state?.from?.pathname || "/";
  useEffect(() => {
    if (isAuthenticated) {
      navigate(fromLocation, { replace: true });
    }
  }, [isAuthenticated, fromLocation, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const success = await login("credentials", { email, password });

    setLoading(false);

    if (success) {
      navigate("/home");
    } else {
      setError("incorrect credentials, try again");
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
        <h2 className="text-3xl font-ananias font-bold text-brand-brick text-center mb-3">
          login
        </h2>
        <h3 className="text-l font-ananias text-brand-brick text-center mb-4">
          sign in to continue
        </h3>

        <form
          onSubmit={handleLogin}
          className="block px-8 space-y-4 font-roboto"
        >
          <div>
            <label className="block text-sm text-brand-brick mb-2">email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 bg-brand-green placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-brick ${
                error ? "border-2 border-red-600" : ""
              }`}
              placeholder="enter your email"
            />
          </div>

          <div>
            <label className="block text-sm text-brand-brick mb-2">
              password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 bg-brand-green placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-brick ${
                error ? "border-2 border-red-600" : ""
              }`}
              placeholder="enter your password"
            />
          </div>

          <div className="text-sm">
            <a href="#!" className="text-brand-brick hover:text-brand-green">
              forgot password?
            </a>
          </div>

          {error && (
            <div className="text-red-600 text-xl font-roboto">{error}</div>
          )}

          <div className="flex justify-center">
            <Button
              type="submit"
              text="login"
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
            don't have an account?{" "}
            <a href="/signup" className="font-bold hover:underline">
              sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
