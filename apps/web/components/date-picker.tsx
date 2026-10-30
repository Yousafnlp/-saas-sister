'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function DatePicker({ value, onChange, placeholder = 'Pick a date', required, className }: DatePickerProps) {
  const selected = value ? new Date(`${value}T00:00:00`) : undefined;

  return (
    <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'h-9 w-full justify-start gap-2 border-2 font-normal',
              !selected && 'text-muted-foreground',
              className,
            )}
          >
            <CalendarIcon className="size-4" />
            {selected ? format(selected, 'MMM d, yyyy') : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
          />
        </PopoverContent>
      </Popover>
      {required && (
        <input
          type="date"
          required
          value={value}
          onChange={() => {}}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
        />
      )}
    </div>
  );
}
