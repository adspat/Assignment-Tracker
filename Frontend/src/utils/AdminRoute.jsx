import React, { useContext } from "react";
import { AppContent } from "../context/AppContext";
import { Navigate, Outlet } from "react-router-dom";

const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div className="relative">
      <div className="h-16 w-16 rounded-full border-4 border-gray-200" />
      <div className="absolute top-0 h-16 w-16 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
    </div>
    <h2 className="mt-4 text-xl font-semibold text-gray-700 animate-pulse">Loading...</h2>
  </div>
);

export const AdminRoute = () => {
  const { isLoggedIN, isAdmin, loading } = useContext(AppContent);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isLoggedIN) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
