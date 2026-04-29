'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { auth, type User } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount and refresh profile data
  useEffect(() => {
    const initSession = async () => {
      const session = auth.getSession();
      if (session) {
        // Refresh session to get latest profile data (is_super_admin, etc.)
        const refreshed = await auth.refreshSession();
        setUser(refreshed);
      }
      setIsLoading(false);
    };
    initSession();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    // Use real Supabase auth only - no mock fallback
    const user = await auth.login(username, password);
    if (!user) {
      return false;
    }
    setUser(user);
    return true;
  }, []);

  const logout = useCallback(() => {
    auth.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const refreshed = await auth.refreshSession();
    if (refreshed) {
      setUser(refreshed);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    isSuperAdmin: user?.is_super_admin ?? false,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
