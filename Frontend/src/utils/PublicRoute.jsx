import React, { useContext } from "react";
import { AppContent } from "../context/AppContext";
import { Navigate, Outlet } from "react-router-dom";
import { getHomeRoute } from "./getHomeRoute";

export const PublicRoute = () => {
  const { isLoggedIN, loading, user } = useContext(AppContent);

  if (loading) {
    return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {/* Animated Spinner */}
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-gray-200"></div>
        <div className="absolute top-0 h-16 w-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
      
      {/* Loading Text */}
      <h2 className="mt-4 text-xl font-semibold text-gray-700 animate-pulse">
        Loading...
      </h2>
      <p className="text-gray-500 text-sm">Please wait while we fetch your data.</p>
    </div>
  );
  }

  if (!isLoggedIN) {
    return <Outlet />;
  }

  return <Navigate to={getHomeRoute(user?.role)} replace />;
};