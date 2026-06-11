import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import API from "../api/axios";
import { toast } from "react-toastify";
import { getHomeRoute } from "../utils/getHomeRoute";

const Login = () => {
  const navigate = useNavigate();
  const { setIsLoggedIN, getUserData } = useContext(AppContent);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const sanitizedEmail = email.trim();
    
    if (!sanitizedEmail || !password) {
      toast.error("All fields are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = { email: sanitizedEmail, password };
      const { data } = await API.post("/auth/login", formData);

      if (data.success) {
        toast.success(data.role === "admin" ? "Welcome, Admin!" : "Welcome back!");
        await getUserData();
        setIsLoggedIN(true);
        navigate(getHomeRoute(data.role));
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
      setPassword(""); 
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 font-sans antialiased p-4 sm:p-6 md:p-8 relative">
      
      {/* Webpage Title Top-Left */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <span className="text-xl font-bold tracking-tight text-slate-950">
          Assi<span className="text-indigo-600">Track</span>
        </span>
      </div>

      {/* Centralized Card Wrapper */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 md:p-10 shadow-sm mt-12 sm:mt-0">
        
        {/* Header */}
        <div className="space-y-2 mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Sign In
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Enter your credentials below to access your account dashboard.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-medium text-slate-700 tracking-wide block">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition shadow-sm"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-medium text-slate-700 tracking-wide block">
                Password
              </label>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs font-medium text-slate-500 hover:text-indigo-600 transition focus:outline-none"
              >
                Forgot password?
              </button>
            </div>
            
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-14 py-3 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-semibold text-slate-400 hover:text-slate-600 transition focus:outline-none tracking-wider"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white text-sm font-medium py-3 rounded-xl hover:bg-indigo-700 transition flex justify-center items-center disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-indigo-600/10 mt-2"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        
      </div>
    </div>
  );
};

export default Login;