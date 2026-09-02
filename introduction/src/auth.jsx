import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("civic_user") || "null"); }
    catch { return null; }
  });

  useEffect(() => {
    if (user) localStorage.setItem("civic_user", JSON.stringify(user));
    else localStorage.removeItem("civic_user");
  }, [user]);

  const login = (payload) => {
    localStorage.setItem("civic_token", payload.token);
    setUser(payload.user);
  };

  const logout = () => {
    localStorage.removeItem("civic_token");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}