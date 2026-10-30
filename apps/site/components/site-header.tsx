'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { site } from '@/lib/site';
import { Logo } from './logo';
import { ThemeToggle } from './theme';
import { ButtonLink } from './button';

const NAV = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Logo className="mr-2 md:mr-4" />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {/* On phones the toggle lives in the menu, leaving room for the demo button. */}
          <ThemeToggle className="hidden sm:inline-flex" />
          {site.appUrl && (
            <a
              href={site.appUrl}
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
            >
              Sign in
            </a>
          )}
          <ButtonLink href="/demo" size="sm" className="max-[359px]:hidden">
            Book a demo
          </ButtonLink>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted md:hidden"
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Main" className="border-t border-border bg-background md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-3 sm:px-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
            {site.appUrl && (
              <a href={site.appUrl} className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted">
                Sign in
              </a>
            )}
            <div className="flex items-center justify-between rounded-lg px-3 py-1 text-base font-medium text-foreground sm:hidden">
              Dark mode
              <ThemeToggle />
            </div>
            <ButtonLink href="/demo" className="mt-2" onClick={() => setOpen(false)}>
              Book a free demo
            </ButtonLink>
          </div>
        </nav>
      )}
    </header>
  );
}
