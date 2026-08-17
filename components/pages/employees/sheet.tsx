'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FormSelect from '@/components/form-select';
import { EMPLOYEE_DEPARTMENT_OPTIONS, EMPLOYEE_STATUS_OPTIONS } from '@/lib/select-options';
import { X } from 'lucide-react';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  salary: number;
  joinDate: string;
  status: string;
  timings: string;
  damages: number;
  benefits: string;
  payrollReceiving: string;
}

export const emptyEmployee: Omit<Employee, 'id'> = {
  name: '',
  email: '',
  department: EMPLOYEE_DEPARTMENT_OPTIONS[0],
  salary: 0,
  joinDate: '',
  status: 'Active',
  timings: '',
  damages: 0,
  benefits: '',
  payrollReceiving: '',
};

interface EmployeeFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  formData: Omit<Employee, 'id'>;
  onFormDataChange: (formData: Omit<Employee, 'id'>) => void;
  onSave: () => void;
}

export function EmployeeFormSheet({ open, onOpenChange, editingId, formData, onFormDataChange, onSave }: EmployeeFormSheetProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-50 flex flex-col shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg md:text-xl font-bold text-foreground">
            {editingId ? 'Edit Employee' : 'Add Employee'}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
            title="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              placeholder="Employee name"
              className="bg-card border-border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <Input
              value={formData.email}
              onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
              placeholder="email@company.com"
              className="bg-card border-border"
            />
          </div>

          <FormSelect
            label="Department"
            value={formData.department}
            onChange={(value) => onFormDataChange({ ...formData, department: value })}
            options={EMPLOYEE_DEPARTMENT_OPTIONS}
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Salary</label>
            <Input
              type="number"
              value={formData.salary || ''}
              onChange={(e) => onFormDataChange({ ...formData, salary: Number(e.target.value) })}
              placeholder="50000"
              className="bg-card border-border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Join Date</label>
            <Input
              type="date"
              value={formData.joinDate}
              onChange={(e) => onFormDataChange({ ...formData, joinDate: e.target.value })}
              className="bg-card border-border"
            />
          </div>

          <FormSelect
            label="Status"
            value={formData.status}
            onChange={(value) => onFormDataChange({ ...formData, status: value })}
            options={EMPLOYEE_STATUS_OPTIONS}
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Timings</label>
            <Input
              value={formData.timings}
              onChange={(e) => onFormDataChange({ ...formData, timings: e.target.value })}
              placeholder="e.g., 9:00 AM - 6:00 PM"
              className="bg-card border-border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Damages</label>
            <Input
              type="number"
              value={formData.damages || ''}
              onChange={(e) => onFormDataChange({ ...formData, damages: Number(e.target.value) })}
              placeholder="0"
              className="bg-card border-border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Benefits</label>
            <Input
              value={formData.benefits}
              onChange={(e) => onFormDataChange({ ...formData, benefits: e.target.value })}
              placeholder="e.g., Health Insurance, Transport"
              className="bg-card border-border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Payroll Receiving</label>
            <Input
              value={formData.payrollReceiving}
              onChange={(e) => onFormDataChange({ ...formData, payrollReceiving: e.target.value })}
              placeholder="e.g., Bank Transfer - HBL"
              className="bg-card border-border"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-border bg-muted/30 px-6 py-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={onSave}
          >
            {editingId ? 'Update' : 'Add'}
          </Button>
        </div>
      </div>
    </>
  );
}
