import { StatusBadge } from '@/components/status-badge';
import { DataTableColumn } from '@/components/data-table';

const statusBadge = (status: string) => (
  <StatusBadge label={status} tone={status === 'Processed' ? 'success' : 'warning'} />
);

export const payrollColumns: DataTableColumn[] = [
  { key: 'employeeName', label: 'Employee' },
  { key: 'month', label: 'Month' },
  { key: 'baseSalary', label: 'Base Salary', render: (v: number) => <span className="tabular-nums">Rs {v.toLocaleString()}</span> },
  { key: 'bonus', label: 'Bonus', render: (v: number) => <span className="tabular-nums">Rs {v.toLocaleString()}</span> },
  { key: 'deductions', label: 'Deductions', render: (v: number) => <span className="tabular-nums">Rs {v.toLocaleString()}</span> },
  { key: 'netSalary', label: 'Net Salary', render: (v: number) => <span className="tabular-nums">Rs {v.toLocaleString()}</span> },
  { key: 'status', label: 'Status', render: statusBadge },
];
