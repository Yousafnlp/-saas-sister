import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const VARIANTS = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  secondary: 'border border-border bg-card text-foreground hover:bg-muted',
  // For use on the deep teal bands.
  light: 'bg-band-foreground text-band hover:bg-white',
  outlineLight: 'border border-band-foreground/30 text-band-foreground hover:bg-band-foreground/10',
};

const SIZES = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

export interface ButtonStyleProps {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  className?: string;
}

export function buttonClasses({ variant = 'primary', size = 'md', className }: ButtonStyleProps = {}) {
  return cn(
    'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & ButtonStyleProps;

/** A link styled as a button. Links to other sites open in a new tab. */
export function ButtonLink({ variant, size, className, href, ...props }: ButtonLinkProps) {
  const opensNewTab = typeof href === 'string' && href.startsWith('http');
  return (
    <Link
      href={href}
      className={buttonClasses({ variant, size, className })}
      {...(opensNewTab && { target: '_blank', rel: 'noopener noreferrer' })}
      {...props}
    />
  );
}
