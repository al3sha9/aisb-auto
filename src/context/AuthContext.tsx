"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Only check auth once on mount
    const checkAuth = () => {
      if (typeof window === 'undefined') return;
      
      try {
        const token = localStorage.getItem('admin_access_token');
        if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    // Small delay to prevent hydration issues
    setTimeout(checkAuth, 100);
  }, []);

  const login = async (token: string) => {
    try {
      localStorage.setItem('admin_access_token', token);
      setIsAuthenticated(true);
      
      // Use setTimeout to prevent render loop
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 100);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
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