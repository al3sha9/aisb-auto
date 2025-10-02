"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
// import Cookies from 'js-cookie'; // Removed

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('admin_access_token');
        console.log('AuthContext: Checking auth on mount. Token:', token);
        if (token && token !== 'null' && token !== 'undefined') {
          console.log('AuthContext: Token found, setting authenticated to true');
          setIsAuthenticated(true);
        } else {
          console.log('AuthContext: No valid token found, setting authenticated to false');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
        console.log('AuthContext: Loading complete');
      }
    };

    checkAuth();
  }, []);

  const login = (token: string) => {
    try {
      localStorage.setItem('admin_access_token', token);
      setIsAuthenticated(true);
      console.log('AuthContext: Login successful, token stored:', token);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('admin_access_token');
      setIsAuthenticated(false);
      router.push('/admin/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};