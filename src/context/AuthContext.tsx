import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  role: Role;
  token: string | null;
  isLoading: boolean;
  login: (email: string, role?: Role) => Promise<void>;
  switchRole: (role: Role) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from storage or default to Admin demo
  useEffect(() => {
    const savedToken = localStorage.getItem('campuscore_token');
    const savedUser = localStorage.getItem('campuscore_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setIsLoading(false);
        return;
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }

    // Default auto-login as Admin for instant testability
    switchRole('admin').finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, requestedRole?: Role) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, requestedRole);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('campuscore_token', res.token);
      localStorage.setItem('campuscore_user', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (targetRole: Role) => {
    setIsLoading(true);
    try {
      const res = await api.switchDemoRole(targetRole);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('campuscore_token', res.token);
      localStorage.setItem('campuscore_user', JSON.stringify(res.user));
    } catch (err) {
      console.error('Error switching demo role:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('campuscore_token');
    localStorage.removeItem('campuscore_user');
  };

  const role: Role = user?.role || 'admin';
  const isAdmin = role === 'admin';
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isLoading,
        login,
        switchRole,
        logout,
        isAdmin,
        isTeacher,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
