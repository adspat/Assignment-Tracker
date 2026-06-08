import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

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
      const { data } = await axios.post(
        "http://localhost:3000/auth/login",
        formData,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Welcome back!");
        await getUserData();
        setIsLoggedIN(true);
        navigate("/dashboard");
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
    <div className="min-h-screen flex font-sans antialiased bg-[#FFFDF2] text-[#000000]">
      
      {/* Left Section: Brutalist Minimalist Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative p-16 flex-col justify-between bg-[#000000] text-[#FFFDF2]">
        {/* Subtle abstract geometric frame to add high-end texture */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#FFFDF2_1px,transparent_1px),linear-gradient(to_bottom,#FFFDF2_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        <div className="relative z-10 flex items-center space-x-3">
          <div className="h-6 w-6 bg-[#FFFDF2] flex items-center justify-center font-bold text-black text-xs tracking-tighter">
            ■
          </div>
          <span className="text-xs uppercase tracking-[0.3em] font-semibold">Studio.Core</span>
        </div>

        <div className="relative z-10 my-auto max-w-md space-y-6">
          <h1 className="text-6xl font-light tracking-tight leading-[1.1] text-[#FFFDF2]">
            Simplicity <br />
            <span className="font-serif italic font-normal text-gray-400">is the ultimate</span> <br />
            sophistication.
          </h1>
          <p className="text-gray-400 text-sm font-light leading-relaxed max-w-xs">
            Welcome to a streamlined, secure environment engineered for focused productivity.
          </p>
        </div>

        <div className="relative z-10 text-xs tracking-widest text-gray-500 uppercase">
          &copy; {new Date().getFullYear()} INDEX.STUDIO
        </div>
      </div>

      {/* Right Section: Clean, Editorial Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-sm space-y-10">
          
          {/* Header */}
          <div className="space-y-3">
            <h2 className="text-3xl font-medium tracking-tight uppercase">
              Sign In
            </h2>
            <p className="text-sm text-gray-600 font-light">
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
                "Authenticate"
              )}
            </button>
          </form>

          {/* Registration Link */}
          <p className="text-center text-xs text-gray-500 tracking-wide">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-bold text-black hover:underline uppercase ml-1 focus:outline-none"
            >
              Register
            </button>
          </p>
          
        </div>
      </div>

    </div>
  );
};

export default Login;