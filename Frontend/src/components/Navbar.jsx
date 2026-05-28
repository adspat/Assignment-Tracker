import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIN, user } = useContext(AppContent);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-[#252530] px-6 py-3 flex justify-between items-center">
      
      {/* Logo Section */}
      <div 
        onClick={() => navigate("/")} 
        className="flex items-center gap-2 cursor-pointer group"
      >

        <span className="text-xl font-serif text-[#f0f0f8] tracking-tight">
          PrepToPlace
        </span>
      </div>

      {/* Action Section */}
      <div className="flex items-center gap-4">
        {isLoggedIN ? (
          <div 
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 bg-[#111114] hover:bg-[#1a1a1f] px-3 py-1.5 rounded-full border border-[#252530] cursor-pointer transition active:scale-95"
          >
            {/* User Avatar */}
            <div className="w-8 h-8 bg-[#252530] rounded-full flex items-center justify-center text-[#7070a0] hover:bg-[#e8c97a] hover:text-black transition">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-[#e8c97a] text-black font-medium rounded-full hover:translate-y-[-2px] hover:shadow-[0_0_20px_rgba(232,201,122,0.3)] transition"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
