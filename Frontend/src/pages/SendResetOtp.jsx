import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
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
      const { data } = await API.post("/auth/send-reset-otp", { email });

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
            Reset Password
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Enter your email address below to receive a secure authorization passcode.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-medium text-slate-700 tracking-wide block">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition shadow-sm"
            />
          </div>

          {/* Action Button */}
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

        {/* Backlink Divider & Button */}
        <div className="pt-6 mt-6 border-t border-slate-100 flex justify-center">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition inline-flex items-center gap-2 group"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">&larr;</span> 
            Return to sign in
          </button>
        </div>

      </div>
    </div>
  );
};

export default SendResetOtp;