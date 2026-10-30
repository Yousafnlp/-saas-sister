'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { TONE_STYLES, type StatusTone } from '@/components/status-badge';

interface StatusSelectProps {
  value: string;
  options: string[];
  toneMap: Record<string, StatusTone>;
  onChange: (value: string) => void;
  disabled?: boolean;
  'aria-label'?: string;
}

export function StatusSelect({ value, options, toneMap, onChange, disabled, ...rest }: StatusSelectProps) {
  const tone = toneMap[value] ?? 'neutral';

  return (
    <div onClick={(e) => e.stopPropagation()} className="inline-block">
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          size="sm"
          className={cn(
            'h-auto w-fit gap-1 rounded-md border-0 py-0.5 pl-2 pr-1.5 text-xs font-medium shadow-none ring-1 ring-inset focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60',
            TONE_STYLES[tone],
          )}
          {...rest}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
