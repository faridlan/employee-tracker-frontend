import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoFull from "../assets/logo-full-two-color.png";
import AdminIllustration from "../assets/admin-illustration.png"; // Add your image here

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === "admin" && password === "admin123") {
      localStorage.setItem("auth", "true");
      navigate("/");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Section */}
      <div className="hidden md:flex w-1/2 flex-col justify-between bg-white p-10">
        {/* Small logo top-left */}
        <img src={LogoFull} alt="Logo" className="w-32" />

        {/* Illustration Center */}
        <div className="flex flex-1 items-center justify-center">
          <img
            src={AdminIllustration}
            alt="Admin Illustration"
            className="max-w-md"
          />
        </div>
      </div>

      {/* Right Section */}
      <div
        className="w-full md:w-1/2 flex flex-col justify-center px-10 text-white"
        style={{ backgroundColor: "#005BAA" }}
      >
        <div className="max-w-sm w-full mx-auto">
          {/* Heading */}
          <h1 className="text-3xl font-bold mb-2">Welcome Back, Admin</h1>
          <p className="text-sm opacity-90 mb-8">
            Let’s login to your account
          </p>

          {/* Form */}
          <form onSubmit={handleLogin}>
            {error && (
              <p className="text-red-300 text-sm mb-3 text-center">{error}</p>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                className="w-full px-3 py-2 rounded-lg bg-white text-gray-700 border border-gray-200 focus:ring-2 focus:ring-orange-300 focus:outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-3 py-2 rounded-lg bg-white text-gray-700 border border-gray-200 focus:ring-2 focus:ring-orange-300 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg text-white font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: "#FF8A00" }} // Orange CTA
            >
              Login
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
