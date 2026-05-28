import React, { useContext, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const Profile = () => {
  const navigate = useNavigate();
  const { setIsLoggedIN, user, getUserData } = useContext(AppContent);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleSendVerification = async () => {
    try {
      const { data } = await axios.post(
        "http://localhost:3000/auth/send-verify-otp",
        {},
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message);
        setShowOtpInput(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending OTP");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) return toast.error("Please enter 6-digit OTP");

    setIsVerifying(true);
    try {
      const { data } = await axios.post(
        "http://localhost:3000/auth/verify-account",
        { otp: otpCode },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Email Verified Successfully!");
        setShowOtpInput(false);
        getUserData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { data } = await axios.post("http://localhost:3000/auth/logout", {}, { withCredentials: true });
      if (data.success) {
        toast.success("Logout Success");
        setIsLoggedIN(false);
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Server error");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#f0f0f8] px-6 py-20">
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">

        {/* LEFT SIDEBAR */}
        <div className="bg-[#111114] border border-[#252530] rounded-3xl p-6 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-[#1a1a1f] flex items-center justify-center mb-4">
            <span className="text-3xl text-[#e8c97a]">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-serif">{user.name}</h2>
          <p className="text-[#7070a0] text-sm">{user.email}</p>

          <div className="mt-6 w-full space-y-3">
            {!user.isAccountVerified && (
              <button
                onClick={handleSendVerification}
                className="w-full py-2 border border-[#252530] rounded-xl text-[#e8c97a] hover:bg-[#1a1a1f] transition"
              >
                Verify Email
              </button>
            )}

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full py-2 bg-red-600 rounded-xl hover:bg-red-500"
            >
              Logout
            </button>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="md:col-span-2 bg-[#111114] border border-[#252530] rounded-3xl p-8">
          {showOtpInput && !user.isAccountVerified ? (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <h3 className="text-lg text-[#e8c97a]">Enter Verification Code</h3>

              <div className="flex gap-2">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="w-12 h-12 bg-[#0f0f12] border border-[#252530] text-center rounded-xl focus:border-[#e8c97a] outline-none"
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                  />
                ))}
              </div>

              <button
                type="submit"
                className="px-6 py-2 bg-[#e8c97a] text-black rounded-xl"
              >
                Verify
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-serif">Account Overview</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#0f0f12] border border-[#252530] rounded-xl">
                  <p className="text-xs text-[#7070a0]">Email Status</p>
                  <p className="mt-1">
                    {user.isAccountVerified ? (
                      <span className="text-[#e8c97a]">Verified</span>
                    ) : (
                      <span className="text-red-400">Unverified</span>
                    )}
                  </p>
                </div>

                <div className="p-4 bg-[#0f0f12] border border-[#252530] rounded-xl">
                  <p className="text-xs text-[#7070a0]">User Name</p>
                  <p className="mt-1">{user.name}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-[#111114] border border-[#252530] rounded-2xl p-6 w-80">
            <p>Are you sure you want to logout?</p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 border border-[#252530] rounded-lg py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 rounded-lg py-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;