"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getAuthToken, getAuthEmail, clearAuth } from "@/lib/auth";
import { sendCode as apiSendCode, verifyCode as apiVerifyCode } from "@/lib/api";

interface AuthContextType {
  email: string;
  token: string;
  isAuthenticated: boolean;
  sendCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  email: "",
  token: "",
  isAuthenticated: false,
  sendCode: async () => {},
  verifyCode: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    setEmail(getAuthEmail());
    setToken(getAuthToken());
  }, []);

  const sendCode = useCallback(async (inputEmail: string) => {
    await apiSendCode(inputEmail);
  }, []);

  const verifyCode = useCallback(async (inputEmail: string, code: string) => {
    const data = await apiVerifyCode(inputEmail, code);
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
        sendCode,
        verifyCode,
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
