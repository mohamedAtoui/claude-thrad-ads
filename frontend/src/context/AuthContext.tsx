"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getAuthToken, getAuthEmail, clearAuth } from "@/lib/auth";
import { login as apiLogin } from "@/lib/api";

interface AuthContextType {
  email: string;
  token: string;
  isAuthenticated: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  email: "",
  token: "",
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    setEmail(getAuthEmail());
    setToken(getAuthToken());
  }, []);

  const login = useCallback(async (inputEmail: string) => {
    const data = await apiLogin(inputEmail);
    setEmail(data.email);
    setToken(data.token);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setEmail("");
    setToken("");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        email,
        token,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
