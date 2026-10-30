import Link from 'next/link';
import { site } from '@/lib/site';
import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn('size-8 shrink-0', className)}>
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <rect x="13" y="7" width="6" height="18" rx="3" className="fill-primary-foreground" />
      <rect x="7" y="13" width="18" height="6" rx="3" className="fill-primary-foreground" />
      <circle cx="25" cy="7" r="2.5" className="fill-warm" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2.5 rounded-lg', className)}>
      <LogoMark />
      <span className="text-lg font-bold tracking-tight text-foreground">{site.name}</span>
    </Link>
  );
}
