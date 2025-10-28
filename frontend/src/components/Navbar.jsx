import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="container">
      <nav className="navbar">
        <div className="brand">
          <div className="logo">R</div>
          <div>
          <Link to="/" className="">Reminders </Link>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              smart, reliable reminders
            </div>
          </div>
        </div>

        <div className="navbar-actions">
          {!user && (
            <>
              <Link to="/login" className="btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </>
          )}

          {user && (
            <>
              <Link to="/dashboard" className="btn-ghost">
                Dashboard
              </Link>
              <Link to="/failed" className="btn-ghost">
                Failed
              </Link>
              <div className="navbar-user">{user.username || user.email}</div>
              <button className="btn-primary" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
