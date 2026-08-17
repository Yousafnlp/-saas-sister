'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Login from '@/components/pages/login';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    router.replace('/dashboard');
  };

  if (isLoading || isAuthenticated) {
    return null;
  }

  return <Login onLogin={handleLogin} />;
}
