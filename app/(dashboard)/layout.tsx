'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import Topbar from '@/components/topbar';
import { useAuth } from '@/lib/auth-context';
import { Sparkles } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, userRole, userEmail, logout } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => setShowWelcome(false), 1400);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  if (showWelcome) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div
          className="text-center"
          style={{ animation: 'fadeInUp 0.6s ease-out forwards' }}
        >
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
            <Sparkles className="size-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">D.Aesthetics HRM</h1>
          <p className="mt-2 text-sm text-muted-foreground">Human Resource Management System</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        userRole={userRole}
        userEmail={userEmail}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onMenuClick={() => setIsSidebarOpen(true)}
          userRole={userRole}
          userEmail={userEmail}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
