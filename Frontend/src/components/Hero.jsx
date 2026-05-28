import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";

const Hero = () => {
  const navigate = useNavigate();
  const { user, isLoggedIN, loading } = useContext(AppContent);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-slate-50 overflow-hidden pt-16 text-slate-800 font-sans antialiased">
      
      {/* Structural Background Accents */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
      <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-slate-200/40 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="relative z-10 text-center max-w-3xl px-6">
        
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 tracking-wide uppercase mb-6 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 inline-block"></span>
          Enterprise Edition v2.1
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold mb-6 tracking-tight leading-[1.1]">
          {loading ? (
            <span className="inline-block w-64 h-12 bg-slate-200 animate-pulse rounded-xl"></span>
          ) : (
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-700">
              {user ? `Welcome back, ${user.name}` : "The modern standard for internal tooling"}
              <span className="inline-block ml-3 text-3xl sm:text-4xl md:text-5xl">👋</span>
            </span>
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl mb-10 text-slate-500 max-w-xl mx-auto leading-relaxed">
          Manage system infrastructure, isolate telemetry vectors, and monitor system resources in real time — built specifically for teams that command <span className="text-indigo-600 font-semibold">operational excellence</span>.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5">
          {!isLoggedIN ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition shadow-sm shadow-indigo-600/10 focus:outline-none focus:ring-4 focus:ring-indigo-600/10"
              >
                Access Dashboard
              </button>
              <button
                onClick={() => navigate("/register")}
                className="w-full sm:w-auto px-7 py-3.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 hover:text-slate-900 transition shadow-sm focus:outline-none focus:ring-4 focus:ring-slate-100"
              >
                Create Account
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/profile")}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition shadow-sm shadow-indigo-600/10 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 inline-flex items-center justify-center gap-2"
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