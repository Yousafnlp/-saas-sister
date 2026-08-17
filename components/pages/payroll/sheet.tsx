'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

export interface ProcessPayrollData {
  email: string;
  month: string;
  salary: number;
  bonus: number;
  deductions: number;
}

export const emptyProcessPayrollData: ProcessPayrollData = {
  email: '',
  month: '',
  salary: 0,
  bonus: 0,
  deductions: 0,
};

interface ProcessPayrollSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ProcessPayrollData;
  onFormDataChange: (formData: ProcessPayrollData) => void;
  onSubmit: () => void;
}

export function ProcessPayrollSheet({ open, onOpenChange, formData, onFormDataChange, onSubmit }: ProcessPayrollSheetProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-50 overflow-y-auto shadow-lg">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg md:text-xl font-bold text-foreground">Process Payroll</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
                placeholder="employee@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Payroll Month</label>
              <select
                value={formData.month}
                onChange={(e) => onFormDataChange({ ...formData, month: e.target.value })}
                className="w-full rounded-lg border border-input bg-transparent h-9 px-3 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <option value="">Select Month</option>
                <option value="January 2024">January 2024</option>
                <option value="February 2024">February 2024</option>
                <option value="March 2024">March 2024</option>
                <option value="April 2024">April 2024</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Base Salary</label>
              <Input
                type="number"
                value={formData.salary || ''}
                onChange={(e) => onFormDataChange({ ...formData, salary: Number(e.target.value) })}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Bonus Amount</label>
              <Input
                type="number"
                value={formData.bonus || ''}
                onChange={(e) => onFormDataChange({ ...formData, bonus: Number(e.target.value) })}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Deductions</label>
              <Input
                type="number"
                value={formData.deductions || ''}
                onChange={(e) => onFormDataChange({ ...formData, deductions: Number(e.target.value) })}
                placeholder="0.00"
              />
            </div>

            {/* Calculation */}
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Base Salary:</span>
                  <span className="tabular-nums">${(formData.salary || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Bonus:</span>
                  <span className="tabular-nums">${(formData.bonus || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Deductions:</span>
                  <span className="tabular-nums">-${(formData.deductions || 0).toLocaleString()}</span>
                </div>
                <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold text-foreground">
                  <span>Net Salary:</span>
                  <span className="tabular-nums">${((formData.salary || 0) + (formData.bonus || 0) - (formData.deductions || 0)).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="flex-1 border-border"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
              onClick={onSubmit}
            >
              Process
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
