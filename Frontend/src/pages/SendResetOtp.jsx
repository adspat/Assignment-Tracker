import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const SendResetOtp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!email) {
      toast.error("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("Enter a valid email");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await axios.post(
        "http://localhost:3000/auth/send-reset-otp",
        { email },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Reset OTP sent to your email!");

        setTimeout(() => {
          navigate("/reset-password", { state: { email } });
        }, 1000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else if (error.request) {
        toast.error("Network error");
      } else {
        toast.error("Something went wrong");
      }
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
        
    

        {/* Content */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <h2 className="text-4xl font-semibold tracking-tight text-white leading-tight">
            Secure access. <br />
            <span className="text-indigo-400">Minimal friction.</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            We prioritize industry-standard security and user accessibility. Your reset authorization code transfers instantly over an encrypted layer, letting you restore account credentials immediately.
          </p>
          
          {/* <div className="border-t border-slate-800 pt-6">
            <div className="flex justify-between text-sm text-slate-400">
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Encryption</p>
                <p className="font-mono text-sm mt-1">256-bit AES</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Delivery</p>
                <p className="font-mono text-sm mt-1">&lt; 2s Average</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Network Status</p>
                <p className="font-mono text-sm mt-1 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  Optimal
                </p>
              </div>
            </div>
          </div> */}
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
              Reset Password
            </h1>
            <p className="text-sm text-slate-500">
              Enter your corporate email address to request a secure authentication passkey.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition shadow-sm"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white text-sm font-medium py-3 rounded-xl hover:bg-indigo-700 transition flex justify-center items-center disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-indigo-600/10 mt-2"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Send Reset Code"
              )}
            </button>
          </form>

          {/* Footer Backlink */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition inline-flex items-center gap-2"
            >
              <span>&larr;</span> Return to authentication portal
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default SendResetOtp;