import { StatusBadge } from '@/components/status-badge';
import { DataTableColumn } from '@/components/data-table';
import { Edit, Trash2 } from 'lucide-react';
import type { Employee } from './sheet';

interface EmployeeColumnsProps {
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
}

export function getEmployeeColumns({ onEdit, onDelete }: EmployeeColumnsProps): DataTableColumn<Employee>[] {
  return [
    { key: 'name', label: 'Name', cellClassName: 'font-medium text-foreground' },
    { key: 'email', label: 'Email', hideBelow: 'sm', cellClassName: 'text-muted-foreground' },
    { key: 'department', label: 'Department', hideBelow: 'md' },
    {
      key: 'salary',
      label: 'Salary',
      hideBelow: 'lg',
      render: (value: number) => `Rs ${value.toLocaleString()}`,
    },
    { key: 'joinDate', label: 'Join Date', hideBelow: 'lg' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => <StatusBadge label={value} tone={value === 'Active' ? 'success' : 'danger'} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_value, emp) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onEdit(emp)}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Edit ${emp.name}`}
            title={`Edit ${emp.name}`}
          >
            <Edit className="size-4" />
          </button>
          <button
            onClick={() => onDelete(emp.id)}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${emp.name}`}
            title={`Delete ${emp.name}`}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ),
    },
  ];
}
