import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api/axios";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialEmail = location.state?.email || "";

  const [formData, setFormData] = useState({
    email: initialEmail,
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const otpRegex = /^[0-9]{6}$/;

    if (!otpRegex.test(formData.otp)) {
      toast.error("Enter valid 6-digit OTP");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await API.post("/auth/reset-password", {
        email: formData.email,
        resetOtp: formData.otp,
        newPassword: formData.newPassword,
      });

      if (data.success) {
        toast.success("Password reset successfully!");
        setTimeout(() => navigate("/", { replace: true }), 1000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans antialiased text-slate-800">
      
      {/* Left Section: Context / Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative p-16 flex-col justify-between overflow-hidden">
        {/* Subtle decorative background mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)]"></div>
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        {/* Top Branding Logo Placeholder */}
        <div className="relative z-10 flex items-center space-x-2 text-white font-semibold text-lg tracking-tight">
          <div className="h-6 w-6 bg-indigo-600 rounded-md flex items-center justify-center text-xs font-bold shadow-sm shadow-indigo-500/50">
            A
          </div>
          <span>Enterprise Portal</span>
        </div>

        {/* Content */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <h1 className="text-4xl font-semibold tracking-tight text-white leading-tight">
            Secure verification safeguards your profile.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Verify your identity with the system-issued authorization passkey. Once processed, your account infrastructure updates instantly with newly deployed cryptographic credentials.
          </p>
          <div className="pt-4 flex items-center gap-6">
            <div className="flex -space-x-2">
              <span className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 bg-slate-700"></span>
              <span className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 bg-slate-600"></span>
              <span className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 bg-slate-500"></span>
            </div>
            <p className="text-xs text-slate-400">Protected by dual-layer cryptographic tokens.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Enterprise Inc. All rights reserved.
        </div>
      </div>

      {/* Right Section: Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-md space-y-8 bg-white lg:bg-transparent p-8 lg:p-0 rounded-2xl shadow-sm lg:shadow-none border border-slate-100 lg:border-transparent">
          
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Set New Password
            </h2>
            <p className="text-sm text-slate-500">
              Provide your received OTP authorization token to save your modifications.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Account Identity Email (Read-Only) */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 tracking-wide">
                Account Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="w-full bg-slate-100/80 border border-slate-200/60 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed select-none outline-none focus:outline-none"
              />
            </div>

            {/* OTP Entry */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 tracking-wide">
                Verification Code (6-Digit OTP)
              </label>
              <input
                type="text"
                name="otp"
                placeholder="000000"
                maxLength="6"
                required
                value={formData.otp}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 font-mono tracking-[0.25em] text-center focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition shadow-sm"
              />
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 tracking-wide">
                New Secure Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  required
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-medium text-slate-400 hover:text-slate-600 transition"
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 tracking-wide">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-medium text-slate-400 hover:text-slate-600 transition"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
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
                "Save Modifications"
              )}
            </button>
          </form>

          {/* Footer Backlink */}
          <p className="text-center text-sm text-slate-500">
            Remember your credentials?{" "}
            <button
              onClick={() => navigate("/")}
              className="text-indigo-600 hover:text-indigo-700 font-medium transition"
            >
              Sign In
            </button>
          </p>
          
        </div>
      </div>

    </div>
  );
};

export default ResetPassword;