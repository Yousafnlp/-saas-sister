import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { CLINIC_INFO } from '@/lib/clinic-info';

/** Clinic-branded frame for the public booking pages. */
export function BookingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-linear-to-br from-primary via-primary to-accent px-4 pb-16 pt-8 text-primary-foreground">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/15 ring-1 ring-primary-foreground/20">
            <Sparkles className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold tracking-tight">{CLINIC_INFO.name}</p>
            <p className="truncate text-xs text-primary-foreground/80">{CLINIC_INFO.tagline}</p>
          </div>
        </div>
      </header>
      <main className="mx-auto -mt-10 max-w-2xl px-4 pb-12">{children}</main>
    </div>
  );
}
