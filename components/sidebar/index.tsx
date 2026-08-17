'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, LogOut, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { menuItems } from './constants';

export { menuItems } from './constants';
export type { MenuItem } from './constants';

interface SidebarProps {
  userRole?: string | null;
  userEmail?: string;
  onLogout?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

function getInitials(email?: string) {
  if (!email) return 'U';
  const name = email.split('@')[0];
  return name.slice(0, 2).toUpperCase();
}

export default function Sidebar({ userRole, userEmail, onLogout, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-screen w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 md:static md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
              <Sparkles className="size-4.5 text-sidebar-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">D.Aesthetics</p>
              <p className="truncate text-[11px] text-sidebar-foreground/70">HR &amp; Operations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white md:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 scrollbar-thin">
          <p className="px-3 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            Menu
          </p>
          {menuItems
            .filter((item) => userRole && item.roles.includes(userRole as 'Admin' | 'Manager' | 'Staff'))
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )}
                >
                  <Icon className={cn('size-[18px] shrink-0', isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground')} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          {userEmail && userRole && (
            <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-white">
                {getInitials(userEmail)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{userEmail}</p>
                <p className="truncate text-xs text-sidebar-foreground/60">{userRole}</p>
              </div>
            </div>
          )}
          {onLogout && (
            <button
              onClick={onLogout}
              className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-white"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
