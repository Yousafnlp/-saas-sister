'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { canOpen, menuItems } from './constants';

export { menuItems, canOpen, menuItemFor } from './constants';
export type { MenuItem } from './constants';

const COLLAPSED_KEY = 'sidebar-collapsed';

interface SidebarProps {
  userRole?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ userRole, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { can } = useAuth();
  // Desktop only: the mobile drawer always shows labels.
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSED_KEY) === '1');
    } catch {
      // Storage unavailable (private mode); keep the sidebar expanded.
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, prev ? '0' : '1');
      } catch {
        // Ignore: the choice just won't be remembered.
      }
      return !prev;
    });
  };

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
          'fixed inset-y-0 left-0 z-40 flex h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[transform,width] duration-300 md:static md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed && 'md:w-16',
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex h-14 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border px-3',
            collapsed && 'md:justify-center',
          )}
        >
          <div className={cn('flex min-w-0 items-center gap-2.5', collapsed && 'md:hidden')}>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary">
              <Sparkles className="size-4.5 text-sidebar-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">D.Aesthetics</p>
              <p className="truncate text-[11px] text-sidebar-foreground/70">HR &amp; Operations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:hidden"
          >
            <X className="size-5" />
          </button>
          <button
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden shrink-0 rounded-md p-1.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:block"
          >
            {collapsed ? <PanelLeftOpen className="size-[18px]" /> : <PanelLeftClose className="size-[18px]" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className={cn('flex-1 space-y-1 overflow-y-auto px-3 py-2 scrollbar-thin', collapsed && 'md:px-2')}>
          <p
            className={cn(
              'px-3 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40',
              collapsed && 'md:hidden',
            )}
          >
            Menu
          </p>
          {menuItems
            .filter((item) => canOpen(item, userRole, can))
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'group relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    collapsed && 'md:justify-center md:px-0',
                    isActive
                      ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )}
                >
                  <Icon className={cn('size-[18px] shrink-0', isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground')} />
                  <span className={cn('truncate', collapsed && 'md:sr-only')}>{item.label}</span>
                </Link>
              );
            })}
        </nav>
      </aside>
    </>
  );
}
