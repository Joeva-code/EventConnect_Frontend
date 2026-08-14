"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getAuthUser, saveAuthUser, getAuthToken, getCurrentUser, login as apiLogin, signup as apiSignup, logout as apiLogout, refreshToken as apiRefreshToken, type User, type ApiResult } from "@/lib/api";

export type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<ApiResult<{ success: boolean; data?: User }>>;
  signup: (data: { firstName: string; lastName: string; email: string; password: string; accountType: "planner" | "vendor"; termsAccepted: boolean }) => Promise<ApiResult<{ success: boolean; data?: User }>>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
  hasRole: (role: string) => boolean;
  isPlanner: boolean;
  isVendor: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getAuthUser());
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncUser = useCallback(async () => {
    const me = await getCurrentUser();
    if (me.data) {
      const refreshedUser = me.data;
      const mergedUser = { ...(getAuthUser() ?? {}), ...refreshedUser };
      saveAuthUser(mergedUser);
      setUser(mergedUser);
      return mergedUser;
    }
    return null;
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      const stored = getAuthUser();
      if (!stored) {
        if (isMounted) setIsLoading(false);
        return;
      }
      setUser(stored);
      await syncUser();
      if (isMounted) setIsLoading(false);
    }
    init();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const result = await apiLogin(email, password);
    if (result.error) {
      setError(result.error);
      return result;
    }
    if (result.data?.data) {
      setUser(result.data.data);
      setToken(getAuthToken());
    }
    return result;
  }, []);

  const signup = useCallback(async (data: { firstName: string; lastName: string; email: string; password: string; accountType: "planner" | "vendor"; termsAccepted: boolean }) => {
    setError(null);
    const result = await apiSignup(data);
    if (result.error) {
      setError(result.error);
      return result;
    }
    if (result.data?.data) {
      setUser(result.data.data);
      setToken(getAuthToken());
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    const refreshed = await apiRefreshToken();
    if (refreshed) {
      setToken(getAuthToken());
      const me = await getCurrentUser();
      if (me.data) {
        const mergedUser = { ...(getAuthUser() ?? {}), ...me.data };
        saveAuthUser(mergedUser);
        setUser(mergedUser);
      }
      return true;
    }
    setUser(null);
    setToken(null);
    return false;
  }, []);

  const hasRole = useCallback((role: string) => {
    const currentRole = (user?.role ?? "").toUpperCase();
    if (role.toUpperCase() === "ADMIN") return currentRole === "ADMIN";
    if (role.toUpperCase() === "PLANNER") return currentRole === "PLANNER" || currentRole === "ADMIN";
    if (role.toUpperCase() === "VENDOR") return currentRole === "VENDOR";
    return false;
  }, [user?.role]);

  const isPlanner = hasRole("PLANNER");
  const isVendor = hasRole("VENDOR");
  const isAdmin = hasRole("ADMIN");

  return (
    <AuthContext.Provider value={{ user, token, isLoading, error, login, signup, logout, refresh, hasRole, isPlanner, isVendor, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
