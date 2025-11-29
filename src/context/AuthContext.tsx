import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getCurrentUser, saveUser as saveUserStorage, clearSession } from '../services/storage';

interface AuthContextType {
  user: User | null;
  login: (name: string, email: string) => void;
  googleLogin: () => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loaded = getCurrentUser();
    if (loaded) setUser(loaded);
  }, []);

  const login = (name: string, email: string) => {
    const newUser: User = { id: crypto.randomUUID(), name, email, isPro: false };
    saveUserStorage(newUser);
    setUser(newUser);
  };

  const googleLogin = async () => {
    // Simulação de Login com Google
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const newUser: User = { 
          id: crypto.randomUUID(), 
          name: 'Usuário Google', 
          email: 'usuario@gmail.com', 
          isPro: false,
          // avatar: '...' 
        };
        saveUserStorage(newUser);
        setUser(newUser);
        resolve();
      }, 1500);
    });
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  const updateUser = (updated: User) => {
    saveUserStorage(updated);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, login, googleLogin, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};