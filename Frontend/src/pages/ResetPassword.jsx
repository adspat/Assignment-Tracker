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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 font-sans antialiased p-4 sm:p-6 md:p-8 relative">
      
      {/* Webpage Title Top-Left */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <span className="text-xl font-bold tracking-tight text-slate-950">
          Assi<span className="text-indigo-600">Track</span>
        </span>
      </div>

      {/* Centralized Card Wrapper */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 md:p-10 shadow-sm mt-16 sm:mt-0">
        
        {/* Header */}
        <div className="space-y-2 mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Set New Password
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Provide your received verification passcode below to authorize your secure credential update.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Account Identity Email (Read-Only) */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 tracking-wide block">
              Account Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed select-none outline-none focus:outline-none"
            />
          </div>

          {/* OTP Entry */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 tracking-wide block">
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
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 font-mono tracking-[0.25em] text-center focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition shadow-sm"
            />
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 tracking-wide block">
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
                className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-14 py-3 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-semibold text-slate-400 hover:text-slate-600 transition focus:outline-none tracking-wider"
              >
                {showNewPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 tracking-wide block">
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
                className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-14 py-3 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-semibold text-slate-400 hover:text-slate-600 transition focus:outline-none tracking-wider"
              >
                {showConfirmPassword ? "HIDE" : "SHOW"}
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

        {/* Backlink Footer */}
        <div className="pt-6 mt-6 border-t border-slate-100 flex justify-center text-sm text-slate-500">
          Remember your credentials?{" "}
          <button
            onClick={() => navigate("/")}
            className="text-indigo-600 hover:text-indigo-700 font-medium transition ml-1"
          >
            Sign In
          </button>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;