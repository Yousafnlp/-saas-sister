import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatTone = 'primary' | 'success' | 'warning' | 'info' | 'danger';

const TONE_STYLES: Record<StatTone, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
  danger: 'bg-destructive/10 text-destructive',
};

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: StatTone;
  className?: string;
}

export function StatCard({ icon: Icon, label, value, hint, tone = 'primary', className }: StatCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-card p-4 md:p-5 shadow-sm transition-all hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground md:text-sm">{label}</p>
          <p className="mt-1.5 text-xl font-bold tabular-nums text-foreground md:text-2xl">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl md:size-10', TONE_STYLES[tone])}>
          <Icon className="size-4 md:size-5" />
        </div>
      </div>
    </div>
  );
}
