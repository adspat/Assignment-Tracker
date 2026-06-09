import React, { useState, useRef, useEffect } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const otpCode = otp.join("");

    if (otpCode.length < 6) {
      return toast.error("Please enter 6-digit OTP");
    }

    setIsVerifying(true);

    try {
      const { data } = await API.post("/auth/verify-account", { otp: otpCode });

      if (data.success) {
        toast.success("Email Verified Successfully ✅");
        setTimeout(() => navigate("/"), 1000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);

    try {
      const { data } = await API.post("/auth/send-verify-otp", {});

      if (data.success) {
        toast.success("OTP resent successfully 📩");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
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
          <h2 className="text-4xl font-semibold tracking-tight text-white leading-tight">
            One step closer. <br />
            <span className="text-indigo-400">Secure verification.</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            We’ve issued a unique, one-time security code directly to your registered inbox. Validate your terminal session to authorize and secure infrastructure parameters.
          </p>
          
          <div className="border-t border-slate-800 pt-6">
            <div className="flex justify-between text-sm text-slate-400">
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Token Length</p>
                <p className="font-mono text-sm mt-1">6-Digit String</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Expiration</p>
                <p className="font-mono text-sm mt-1">10 Minutes</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Security Tier</p>
                <p className="font-mono text-sm mt-1 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-400 inline-block animate-pulse"></span>
                  High Isolation
                </p>
              </div>
            </div>
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
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Verify Email
            </h1>
            <p className="text-sm text-slate-500">
              Please enter the 6-digit confirmation key to authenticate your account profile.
            </p>
          </div>

          {/* OTP Form */}
          <form onSubmit={handleVerifyOtp} className="space-y-6">

            {/* OTP Inputs */}
            <div className="flex justify-between gap-2 sm:gap-3">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-14 text-center text-xl font-mono font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition shadow-sm text-slate-900"
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-indigo-600 text-white text-sm font-medium py-3 rounded-xl hover:bg-indigo-700 transition flex justify-center items-center disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-indigo-600/10"
            >
              {isVerifying ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Verify Email"
              )}
            </button>
          </form>

          {/* Resend Link Section */}
          <div className="pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 mb-2">
              Didn't receive the verification token?
            </p>
            <button
              onClick={handleResendOtp}
              disabled={isResending}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? "Reissuing Token..." : "Resend OTP Link"}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default VerifyEmail;