'use client';

import { usePathname } from 'next/navigation';
import { Bell, ChevronDown, LogOut, Menu, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ThemeToggle from '@/components/theme-toggle';
import { menuItems } from '@/components/sidebar';

interface TopbarProps {
  onMenuClick: () => void;
  userRole?: string | null;
  userEmail?: string;
  onLogout?: () => void;
}

function getInitials(email?: string) {
  if (!email) return 'U';
  const name = email.split('@')[0];
  return name.slice(0, 2).toUpperCase();
}

export default function Topbar({ onMenuClick, userRole, userEmail, onLogout }: TopbarProps) {
  const pathname = usePathname();
  const currentPage = menuItems.find((item) => pathname?.startsWith(item.href));

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation"
        onClick={onMenuClick}
      >
        <Menu className="size-5" />
      </Button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground md:text-base">
          {currentPage?.label ?? 'Overview'}
        </p>
      </div>

      <div className="flex items-center gap-1.5 md:gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="size-[18px]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-muted">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {getInitials(userEmail)}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-2">
                <UserRound className="size-4 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{userEmail}</p>
                  <p className="text-xs text-muted-foreground">{userRole}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onLogout}>
              <LogOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
