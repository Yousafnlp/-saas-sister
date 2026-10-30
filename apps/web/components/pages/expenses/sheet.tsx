'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FormSelect from '@/components/form-select';
import { DatePicker } from '@/components/date-picker';
import { X } from 'lucide-react';
import { CITY_OPTIONS, EXPENSE_CATEGORY_OPTIONS } from '@/lib/select-options';

export interface ExpenseFormData {
  date: string;
  category: string;
  city: string;
  amount: number;
  description: string;
  submittedBy: string;
}

export const emptyExpense: ExpenseFormData = {
  date: '',
  category: EXPENSE_CATEGORY_OPTIONS[0],
  city: CITY_OPTIONS[0],
  amount: 0,
  description: '',
  submittedBy: '',
};

interface ExpenseFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ExpenseFormData;
  onFormDataChange: (formData: ExpenseFormData) => void;
  onSubmit: () => void;
}

export function ExpenseFormSheet({ open, onOpenChange, formData, onFormDataChange, onSubmit }: ExpenseFormSheetProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-50 overflow-y-auto">
        <div className="space-y-3 p-3">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg md:text-xl font-bold text-foreground">New Expense</h2>
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
              <label className="block text-sm font-medium text-foreground mb-2">Date</label>
              <DatePicker value={formData.date} onChange={(value) => onFormDataChange({ ...formData, date: value })} />
            </div>

            <FormSelect
              label="Category"
              value={formData.category}
              onChange={(value) => onFormDataChange({ ...formData, category: value })}
              options={EXPENSE_CATEGORY_OPTIONS}
            />

            <FormSelect
              label="City"
              value={formData.city}
              onChange={(value) => onFormDataChange({ ...formData, city: value })}
              options={CITY_OPTIONS}
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Amount</label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => onFormDataChange({ ...formData, amount: Number(e.target.value) })}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
                placeholder="Expense details..."
                rows={4}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Submitted By</label>
              <Input
                value={formData.submittedBy}
                onChange={(e) => onFormDataChange({ ...formData, submittedBy: e.target.value })}
                placeholder="Employee name"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
              onClick={onSubmit}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
