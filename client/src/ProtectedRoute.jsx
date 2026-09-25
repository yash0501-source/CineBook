import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, adminOnly = false }) {
  const location = useLocation();

  const token = localStorage.getItem("cinebookToken");
  const userData = localStorage.getItem("cinebookUser");

  let user = null;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch (error) {
    user = null;
  }

  // User is not logged in
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Admin-only page
  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;