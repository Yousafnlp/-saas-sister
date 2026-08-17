'use client';

import { ChevronDown } from 'lucide-react';

interface FormSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  className?: string;
}

export default function FormSelect({ label, value, onChange, options, required, className }: FormSelectProps) {
  return (
    <div>
      {label && <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>}
      <div className="relative">
        <select
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`h-9 w-full appearance-none rounded-lg border-2 border-input bg-transparent px-3 pr-9 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30 ${className || ''}`}
        >
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}
