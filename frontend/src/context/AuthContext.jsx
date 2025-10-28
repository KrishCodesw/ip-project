import React, { createContext, useContext, useState, useEffect } from "react";
import { getUser as apiGetUser } from "../api/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchUser() {
      if (!token) {
        setUser(null);
        return;
      }
      setLoading(true);
      try {
        const res = await apiGetUser(token);
        if (mounted) setUser(res.data);
      } catch (err) {
        console.error(
          "Failed to fetch user:",
          err?.response?.data || err.message
        );
        // invalid token -> clear
        setToken(null);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchUser();
    return () => {
      mounted = false;
    };
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
