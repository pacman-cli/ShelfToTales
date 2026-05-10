"use client";

import { createContext, ReactNode, useCallback, useEffect, useState } from "react";
import { User, AuthState } from "@/lib/types";
import {
  getStoredAuth,
  storeAuth,
  clearAuth,
  mockLogin,
  mockRegister,
} from "@/lib/auth";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => false,
  register: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredAuth();
    if (stored) {
      setUser(stored.user);
      setToken(stored.token);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    const result = mockLogin(email, password);
    if (!result) return false;
    setUser(result.user);
    setToken(result.token);
    storeAuth(result.user, result.token);
    return true;
  }, []);

  const register = useCallback(
    (name: string, email: string, password: string): boolean => {
      const result = mockRegister(name, email, password);
      if (!result) return false;
      setUser(result.user);
      setToken(result.token);
      storeAuth(result.user, result.token);
      return true;
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!user, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
