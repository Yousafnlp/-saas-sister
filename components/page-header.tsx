import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted-foreground md:text-base">{description}</p>}
      </div>
      {actions && <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">{actions}</div>}
    </div>
  );
}
