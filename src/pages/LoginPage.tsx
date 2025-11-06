import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoFull from "../assets/logo-full.png";

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
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Branding Panel */}
      <div
        className="hidden md:flex w-1/2 items-center justify-center text-white p-10"
        style={{ backgroundColor: "#744C96" }}
      >
        <div className="max-w-md animate-fadeIn">
          <h1 className="text-3xl font-bold mb-3">Bank Galuh</h1>
          <p className="text-lg opacity-90 mb-6">Perumda BPR Galuh Ciamis</p>
          <p className="text-sm opacity-90 leading-relaxed">
            Selamat datang, Admin. Mari kelola sistem dengan lebih efisien.
          </p>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-6 animate-fadeIn">
        <form
          onSubmit={handleLogin}
          className="bg-white shadow-lg rounded-xl p-8 w-full max-w-sm"
        >
          <img
            src={LogoFull}
            alt="Bank Galuh Logo"
            className="w-40 mx-auto mb-6"
          />

          {error && (
            <p className="text-red-600 text-sm mb-3 text-center">{error}</p>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              placeholder="Username"
              className="border border-gray-300 w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-300 focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              placeholder="Password"
              className="border border-gray-300 w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-300 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg text-white font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: "#8D5FB3" }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
