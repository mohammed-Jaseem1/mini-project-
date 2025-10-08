import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // Example: check for a token or role in localStorage
  const isAuthenticated = !!localStorage.getItem("role"); // or use a token

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}