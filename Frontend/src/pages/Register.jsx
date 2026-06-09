import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { toast } from "react-toastify";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      toast.error("All fields are required");
      return;
    }
    if(formData.password.length < 6){
      toast.error("Password should be atleat of 6 character");
      return ;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Password does not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await API.post("/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (data.success) {
        toast.success("Registered Successfully");
        setFormData({ username: "", email: "", password: "", confirmPassword: "" });
        navigate("/verify-email");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Server error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased bg-[#FFFDF2] text-[#000000]">
      
      {/* Header with Logo and Assitrack */}
      <div className="flex items-center justify-between px-8 sm:px-12 md:px-16 py-6 border-b border-black/10 flex-shrink-0">
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

      {/* Register Form Section - Full width */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 md:p-16 overflow-y-auto">
        <div className="w-full max-w-sm border-2 p-4 space-y-6 rounded-2xl">
          
          {/* Header */}
          <div className="space-y-3">
            <h2 className="text-3xl text-center font-medium tracking-tight uppercase">
              Create Account
            </h2>
            <p className="text-sm text-gray-600 text-center font-light">
              Register now to get started.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-6">
            
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-xs uppercase tracking-widest font-semibold block text-gray-700">
                Full Name
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full bg-[#FFFDF2] border-b-2 border-black/20 px-0 py-3 text-sm rounded-none focus:outline-none focus:border-black transition-colors duration-300 placeholder:text-gray-400 text-[#000000]"
                placeholder="John Doe"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs uppercase tracking-widest font-semibold block text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full bg-[#FFFDF2] border-b-2 border-black/20 px-0 py-3 text-sm rounded-none focus:outline-none focus:border-black transition-colors duration-300 placeholder:text-gray-400 text-[#000000]"
                placeholder="name@domain.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs uppercase tracking-widest font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-[#FFFDF2] border-b-2 border-black/20 px-0 py-3 text-sm rounded-none focus:outline-none focus:border-black transition-colors duration-300 placeholder:text-gray-400 text-[#000000]"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-xs uppercase tracking-widest font-semibold text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="w-full bg-[#FFFDF2] border-b-2 border-black/20 px-0 py-3 text-sm rounded-none focus:outline-none focus:border-black transition-colors duration-300 placeholder:text-gray-400 text-[#000000]"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-1 flex items-center text-xs font-bold tracking-wider text-gray-400 hover:text-black transition focus:outline-none"
                >
                  {showConfirmPassword ? "HIDE" : "SHOW"}
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
                "Sign Up"
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-xs text-gray-500 tracking-wide">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="font-bold text-black hover:underline uppercase ml-1 focus:outline-none"
            >
              Login
            </button>
          </p>
          
        </div>
      </div>

    </div>
  );
};

export default Register;