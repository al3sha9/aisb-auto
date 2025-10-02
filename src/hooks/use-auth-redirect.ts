"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function useAuthRedirect() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated && !redirecting) {
      setRedirecting(true);
      setTimeout(() => {
        router.replace('/admin/login');
      }, 100);
    }
  }, [isAuthenticated, loading, redirecting, router]);

  return { redirecting: redirecting || loading || !isAuthenticated };
}

export function useLoginRedirect() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated && !redirecting) {
      setRedirecting(true);
      setTimeout(() => {
        router.replace('/admin/dashboard');
      }, 100);
    }
  }, [isAuthenticated, loading, redirecting, router]);

  return { redirecting: redirecting || loading };
}
