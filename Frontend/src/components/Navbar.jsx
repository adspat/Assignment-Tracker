import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIN, user } = useContext(AppContent);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#FEFAE0]/90 backdrop-blur-md border-b border-[#D4A373]/25 px-6 py-3 flex justify-between items-center">
      
      {/* Logo Section */}
      <div 
        onClick={() => navigate("/")} 
        className="flex items-center gap-2 cursor-pointer group"
      >

        <span className="text-xl font-serif text-[#4A443A] tracking-tight">
          AssiTrack
        </span>
      </div>

      {/* Action Section */}
      <div className="flex items-center gap-4">
        {isLoggedIN ? (
          <div 
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 bg-white hover:bg-[#FAEDCD] px-3 py-1.5 rounded-full border border-[#D4A373]/25 cursor-pointer transition active:scale-95"
          >
            {/* User Avatar */}
            <div className="w-8 h-8 bg-[#E9EDC9] rounded-full flex items-center justify-center text-[#4A443A] hover:bg-[#CCD5AE] transition">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-[#CCD5AE] text-[#4A443A] font-medium rounded-full hover:translate-y-[-2px] hover:bg-[#b6bf96] transition"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
