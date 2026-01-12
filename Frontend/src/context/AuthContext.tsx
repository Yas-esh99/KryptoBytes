import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

import { User } from '@/types';
import { apiLogin, apiSignup, getProfile } from '@/services/api';
import { generateKeys } from '@/lib/wallet';

interface SignupData {
  name: string;
  email: string;
  collegeId: string;
  password: string;
  role: 'student' | 'faculty';
  department?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;
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
      } catch (err) {
        console.error('Profile fetch failed', err);
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
      return true;
    } catch (err) {
      console.error('Login failed', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { publicKey, privateKey } = generateKeys();
      await apiSignup({ ...data, publicKey });
      localStorage.setItem('privateKey', privateKey);
      return await login(data.email, data.password);
    } catch (err) {
      console.error('Signup failed', err);
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
    if (user) setUser({ ...user, ...updates });
  };

  const refreshUser = async () => {
    setIsLoading(true);
    await loadUserFromToken();
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
