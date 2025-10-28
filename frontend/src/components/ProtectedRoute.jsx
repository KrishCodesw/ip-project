import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="loader">Loading...</div>;
  return token ? children : <Navigate to="/login" replace />;
}
