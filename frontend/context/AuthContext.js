"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { clearStoredAuth, getStoredAuth, setStoredAuth } from "@/lib/storage/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedAuth = getStoredAuth();

    if (storedAuth) {
      setToken(storedAuth.token || null);
      setUser(storedAuth.user || null);
    }

    setIsHydrated(true);
  }, []);

  const login = (authData) => {
    const nextToken = authData?.token || null;
    const nextUser = authData?.user || null;

    setToken(nextToken);
    setUser(nextUser);
    setStoredAuth({
      token: nextToken,
      user: nextUser,
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    clearStoredAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isHydrated,
        isAuthenticated: Boolean(token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
