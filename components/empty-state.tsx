import type { LucideIcon } from 'lucide-react';
import { SearchX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  bordered?: boolean;
  className?: string;
}

export function EmptyState({ icon: Icon = SearchX, title, description, bordered = true, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 py-12 text-center',
        bordered && 'rounded-2xl border border-border bg-card shadow-sm',
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <p className="font-medium text-foreground">{title}</p>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
