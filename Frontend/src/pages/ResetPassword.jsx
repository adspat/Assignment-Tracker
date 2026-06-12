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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FEFAE0] font-sans antialiased p-4 sm:p-6 md:p-8 relative">
      
      {/* Webpage Title Top-Left */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <span className="text-xl font-bold tracking-tight text-[#4A443A]">
          Assi<span className="text-[#D4A373]">Track</span>
        </span>
      </div>

      {/* Centralized Card Wrapper */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#D4A373]/25 p-6 sm:p-8 md:p-10 shadow-sm mt-16 sm:mt-0">
        
        {/* Header */}
        <div className="space-y-2 mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#4A443A]">
            Set New Password
          </h1>
          <p className="text-sm text-[#6E675F] leading-relaxed">
            Provide your received verification passcode below to authorize your secure credential update.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Account Identity Email (Read-Only) */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#918A82] tracking-wide block">
              Account Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              className="w-full bg-[#FAEDCD]/50 border border-[#D4A373]/20 rounded-xl px-4 py-3 text-sm text-[#918A82] cursor-not-allowed select-none outline-none focus:outline-none"
            />
          </div>

          {/* OTP Entry */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#6E675F] tracking-wide block">
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
              className="w-full bg-white border border-[#D4A373]/25 rounded-xl px-4 py-3 text-sm text-[#4A443A] placeholder:text-[#918A82] font-mono tracking-[0.25em] text-center focus:outline-none focus:ring-2 focus:ring-[#CCD5AE]/40 focus:border-[#CCD5AE] transition shadow-sm"
            />
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#6E675F] tracking-wide block">
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
                className="w-full bg-white border border-[#D4A373]/25 rounded-xl pl-4 pr-14 py-3 text-sm text-[#4A443A] placeholder:text-[#918A82] focus:outline-none focus:ring-2 focus:ring-[#CCD5AE]/40 focus:border-[#CCD5AE] transition shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-semibold text-[#918A82] hover:text-[#6E675F] transition focus:outline-none tracking-wider"
              >
                {showNewPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#6E675F] tracking-wide block">
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
                className="w-full bg-white border border-[#D4A373]/25 rounded-xl pl-4 pr-14 py-3 text-sm text-[#4A443A] placeholder:text-[#918A82] focus:outline-none focus:ring-2 focus:ring-[#CCD5AE]/40 focus:border-[#CCD5AE] transition shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-semibold text-[#918A82] hover:text-[#6E675F] transition focus:outline-none tracking-wider"
              >
                {showConfirmPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#CCD5AE] text-[#4A443A] text-sm font-semibold py-3 rounded-xl hover:bg-[#b6bf96] transition flex justify-center items-center disabled:opacity-60 disabled:cursor-not-allowed shadow-sm mt-2"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Save Modifications"
            )}
          </button>
        </form>

        {/* Backlink Footer */}
        <div className="pt-6 mt-6 border-t border-[#D4A373]/15 flex justify-center text-sm text-[#6E675F]">
          Remember your credentials?{" "}
          <button
            onClick={() => navigate("/")}
            className="text-[#4A443A] hover:text-[#D4A373] font-medium transition ml-1"
          >
            Sign In
          </button>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;
