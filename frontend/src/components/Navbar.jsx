import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-title">Reminders App</div>
      <div className="navbar-actions">
        {user && (
          <div className="navbar-user">{user.username || user.email}</div>
        )}
        <button className="btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
