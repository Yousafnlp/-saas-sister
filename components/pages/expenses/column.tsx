import { StatusBadge } from '@/components/status-badge';
import { DataTableColumn } from '@/components/data-table';

const statusBadge = (status: string) => (
  <StatusBadge
    label={status}
    tone={status === 'Approved' ? 'success' : status === 'Pending' ? 'warning' : 'danger'}
  />
);

export const expenseColumns: DataTableColumn[] = [
  { key: 'date', label: 'Date' },
  { key: 'category', label: 'Category' },
  { key: 'amount', label: 'Amount', render: (v: number) => <span className="tabular-nums">${v.toLocaleString()}</span> },
  { key: 'description', label: 'Description' },
  { key: 'submittedBy', label: 'Submitted By' },
  { key: 'status', label: 'Status', render: statusBadge },
];
