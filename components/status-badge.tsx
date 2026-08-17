import { cn } from '@/lib/utils';

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONE_STYLES: Record<StatusTone, string> = {
  success: 'bg-success/10 text-success ring-success/20',
  warning: 'bg-warning/10 text-warning ring-warning/20',
  danger: 'bg-destructive/10 text-destructive ring-destructive/20',
  info: 'bg-info/10 text-info ring-info/20',
  neutral: 'bg-muted text-muted-foreground ring-border',
};

interface StatusBadgeProps {
  label: string;
  tone: StatusTone;
  className?: string;
}

export function StatusBadge({ label, tone, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap',
        TONE_STYLES[tone],
        className,
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current" />
      {label}
    </span>
  );
}
