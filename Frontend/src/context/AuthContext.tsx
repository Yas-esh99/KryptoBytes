import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { apiLogin, apiSignup, getProfile } from '@/services/api';

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password:string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

interface SignupData {
  name: string;
  email: string;
  collegeId: string;
  password: string;
  role: 'student' | 'faculty';
  department?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserFromToken = async () => {
    const token = localStorage.getItem('idToken');
    if (token) {
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        localStorage.removeItem('idToken');
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadUserFromToken();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { idToken } = await apiLogin(email, password);
      localStorage.setItem('idToken', idToken);
      await loadUserFromToken();
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    setIsLoading(true);
    try {
      await apiSignup(data);
      // After successful signup, log the user in
      return await login(data.email, data.password);
    } catch (error) {
      console.error("Signup failed:", error);
      setIsLoading(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('idToken');
  };

  const updateUser = (updates: Partial<User>) => {
    // TODO: Implement backend update for user profile
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
    }
  };

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      await loadUserFromToken();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}