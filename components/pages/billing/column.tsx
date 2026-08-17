import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatusBadge, type StatusTone } from '@/components/status-badge';
import { DataTableColumn } from '@/components/data-table';
import { Trash2, Edit, Printer } from 'lucide-react';
import type { Bill } from './types';

const STATUS_TONE: Record<string, StatusTone> = {
  Paid: 'success',
  Partial: 'warning',
  Pending: 'danger',
};

interface BillColumnsProps {
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
}

export function getBillColumns({ onEdit, onDelete }: BillColumnsProps): DataTableColumn<Bill>[] {
  return [
    { key: 'invoiceNumber', label: 'Invoice #', cellClassName: 'font-medium text-foreground whitespace-nowrap' },
    { key: 'clientName', label: 'Client', cellClassName: 'font-medium text-foreground' },
    { key: 'clientNumber', label: 'Number', hideBelow: 'md' },
    { key: 'date', label: 'Date', hideBelow: 'sm' },
    {
      key: 'total',
      label: 'Total',
      align: 'right',
      render: (value: number) => <span className="tabular-nums">Rs {value.toLocaleString()}</span>,
    },
    {
      key: 'paymentStatus',
      label: 'Status',
      hideBelow: 'md',
      render: (value: string) => <StatusBadge label={value} tone={STATUS_TONE[value] ?? 'neutral'} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_value, bill) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            asChild
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Link href={`/billing/${bill.id}/print`} target="_blank" aria-label={`Print bill for ${bill.clientName}`} title={`Print bill for ${bill.clientName}`}>
              <Printer className="size-4" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(bill)}
            aria-label={`Edit bill for ${bill.clientName}`}
            title={`Edit bill for ${bill.clientName}`}
          >
            <Edit className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(bill.id)}
            aria-label={`Delete bill for ${bill.clientName}`}
            title={`Delete bill for ${bill.clientName}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];
}
