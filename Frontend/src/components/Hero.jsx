import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";

const Hero = () => {
  const navigate = useNavigate();
  const { user, isLoggedIN, loading } = useContext(AppContent);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[#FEFAE0] overflow-hidden pt-16 text-[#4A443A] font-sans antialiased">
      
      {/* Structural Background Accents */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#CCD5AE]/30 to-transparent pointer-events-none"></div>
      <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-[#E9EDC9]/60 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-[#FAEDCD]/70 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="relative z-10 text-center max-w-3xl px-6">
        
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E9EDC9] border border-[#CCD5AE] text-xs font-semibold text-[#4A443A] tracking-wide uppercase mb-6 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D4A373] inline-block"></span>
          Enterprise Edition v2.1
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold mb-6 tracking-tight leading-[1.1]">
          {loading ? (
            <span className="inline-block w-64 h-12 bg-[#FAEDCD] animate-pulse rounded-xl"></span>
          ) : (
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#4A443A] to-[#6E675F]">
              {user ? `Welcome back, ${user.name}` : "The modern standard for internal tooling"}
              <span className="inline-block ml-3 text-3xl sm:text-4xl md:text-5xl">👋</span>
            </span>
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl mb-10 text-[#6E675F] max-w-xl mx-auto leading-relaxed">
          Manage assignments, student submissions, and academic progress in one calm workspace built for <span className="text-[#4A443A] font-semibold">daily faculty workflows</span>.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5">
          {!isLoggedIN ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-7 py-3.5 bg-[#CCD5AE] text-[#4A443A] text-sm font-medium rounded-xl hover:bg-[#b6bf96] transition shadow-sm focus:outline-none focus:ring-4 focus:ring-[#CCD5AE]/30"
              >
                Access Dashboard
              </button>
              <button
                onClick={() => navigate("/register")}
                className="w-full sm:w-auto px-7 py-3.5 bg-white border border-[#D4A373]/25 text-[#6E675F] text-sm font-medium rounded-xl hover:bg-[#FAEDCD] hover:text-[#4A443A] transition shadow-sm focus:outline-none focus:ring-4 focus:ring-[#E9EDC9]"
              >
                Create Account
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/profile")}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#CCD5AE] text-[#4A443A] text-sm font-medium rounded-xl hover:bg-[#b6bf96] transition shadow-sm focus:outline-none focus:ring-4 focus:ring-[#CCD5AE]/30 inline-flex items-center justify-center gap-2"
            >
              <span>Launch Terminal Session</span>
              <span className="text-xs opacity-60 font-mono">&rarr;</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
