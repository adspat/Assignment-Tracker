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
    <div className="h-screen flex flex-col font-sans antialiased bg-[#FFFDF2] text-[#000000] overflow-hidden">
      
      {/* Header with Logo and Assitrack */}
      <div className="flex items-center justify-between px-8 sm:px-12 md:px-16 py-6 border-b border-black/10">
        {/* Logo and text on left */}
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-[#000000] flex items-center justify-center font-bold text-[#FFFDF2] text-lg rounded-sm">
            A
          </div>
          <span className="text-lg font-bold tracking-tight text-[#000000]">SSITRACK</span>
        </div>
        
        {/* Empty right side - can be used for additional elements if needed */}
        <div></div>
      </div>

      {/* Login Form Section - Full width */}
      <div className="flex-1 flex items-center justify-center  p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-sm border-2 p-4 space-y-6 rounded-2xl">
          
          {/* Header */}
          <div className="space-y-3">
            <h2 className="text-3xl text-center font-medium tracking-tight uppercase">
              Sign In
            </h2>
            <p className="text-sm text-gray-600 text-center font-light">
              Enter your credential profile below to continue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs uppercase tracking-widest font-semibold block text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="w-full bg-[#FFFDF2] border-b-2 border-black/20 px-0 py-3 text-sm rounded-none focus:outline-none focus:border-black transition-colors duration-300 placeholder:text-gray-400 text-[#000000]"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs uppercase tracking-widest font-semibold text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs font-medium text-gray-500 hover:text-black transition hover:underline focus:outline-none"
                >
                  Forgot?
                </button>
              </div>
              
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="w-full bg-[#FFFDF2] border-b-2 border-black/20 px-0 py-3 text-sm rounded-none focus:outline-none focus:border-black transition-colors duration-300 placeholder:text-gray-400 text-[#000000]"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-1 flex items-center text-xs font-bold tracking-wider text-gray-400 hover:text-black transition focus:outline-none"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#000000] hover:bg-gray-900 text-[#FFFDF2] text-xs uppercase tracking-widest font-bold py-4 rounded-none transition duration-300 active:bg-gray-800 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-[#FFFDF2]/30 border-t-[#FFFDF2] rounded-full animate-spin"></div>
              ) : (
                "Sign-In"
              )}
            </button>
          </form>

        
          
        </div>
      </div>

    </div>
  );
};

export default Login;