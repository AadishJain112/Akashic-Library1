import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, UserProfile, UserRole, LoginPayload, RegisterPayload } from '../api/auth';
import { NormalizedError } from '../api/http';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | 'GUEST';
  isLoading: boolean;
  isMod: boolean;
  isStoreStaff: boolean;
  isAdmin: boolean;
  login: (payload: LoginPayload) => Promise<UserProfile>;
  register: (payload: RegisterPayload) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refresh: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refresh = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const profile = await authApi.getMe();
      setUser(profile);
      return profile;
    } catch (err: any) {
      // 403 or 401 simply means unauthenticated guest
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (payload: LoginPayload): Promise<UserProfile> => {
    const res = await authApi.login(payload);
    setUser(res.user);
    return res.user;
  };

  const register = async (payload: RegisterPayload): Promise<UserProfile> => {
    const res = await authApi.register(payload);
    setUser(res.user);
    return res.user;
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (err) {
      // Ignore logout errors
    } finally {
      setUser(null);
    }
  };

  const role: UserRole | 'GUEST' = user ? user.role : 'GUEST';
  const isMod = role === 'MODERATOR' || role === 'ADMIN';
  const isStoreStaff = role === 'STORE_MANAGER' || role === 'ADMIN';
  const isAdmin = role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        isMod,
        isStoreStaff,
        isAdmin,
        login,
        register,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
