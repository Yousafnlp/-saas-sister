import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Eyebrow({ icon, children, className }: { icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <p className={cn('inline-flex items-center gap-2 text-sm font-semibold text-primary [&_svg]:size-4', className)}>
      {icon}
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  titleId,
  intro,
  align = 'center',
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  /** Lets the section point aria-labelledby at its heading. */
  titleId?: string;
  intro?: ReactNode;
  align?: 'center' | 'left';
  className?: string;
}) {
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 id={titleId} className="mt-3 font-display text-4xl leading-[1.08] tracking-tight text-foreground sm:text-5xl">
        {title}
      </h2>
      {intro && <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{intro}</p>}
    </div>
  );
}

/** A small status pill in the same style as the app's badges. */
export function Badge({ tone, children }: { tone: 'success' | 'info' | 'warning' | 'neutral'; children: ReactNode }) {
  const tones = {
    success: 'bg-success/10 text-success ring-success/25',
    info: 'bg-info/10 text-info ring-info/25',
    warning: 'bg-warning/10 text-warning ring-warning/25',
    neutral: 'bg-muted text-muted-foreground ring-border',
  };
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset', tones[tone])}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}
