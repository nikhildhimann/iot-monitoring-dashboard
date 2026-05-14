"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { clearStoredAuth, getStoredAuth, setStoredAuth } from "@/lib/storage/auth";
import { getMe } from "@/lib/api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const persistAuth = useCallback((nextToken, nextUser) => {
    setStoredAuth({
      token: nextToken,
      user: nextUser,
    });
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    clearStoredAuth();
  }, []);

  useEffect(() => {
    const storedAuth = getStoredAuth();

    if (storedAuth) {
      setToken(storedAuth.token || null);
      setUser(storedAuth.user || null);
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !token) {
      return;
    }

    let isMounted = true;

    getMe(token)
      .then((freshUser) => {
        if (!isMounted || !freshUser) {
          return;
        }

        setUser(freshUser);
        persistAuth(token, freshUser);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        if (error.status === 401 || error.status === 403) {
          logout();
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isHydrated, token, logout, persistAuth]);

  const login = (authData) => {
    const nextToken = authData?.token || null;
    const nextUser = authData?.user || null;

    setToken(nextToken);
    setUser(nextUser);
    persistAuth(nextToken, nextUser);
  };

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);
    persistAuth(token, nextUser);
  }, [persistAuth, token]);

  const refreshUser = useCallback(async () => {
    if (!token) {
      return null;
    }

    const freshUser = await getMe(token);

    if (freshUser) {
      updateUser(freshUser);
    }

    return freshUser;
  }, [token, updateUser]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isHydrated,
        isAuthenticated: Boolean(token),
        login,
        logout,
        refreshUser,
        updateUser,
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
