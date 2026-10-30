import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { type StatusTone } from '@/components/status-badge';
import { StatusSelect } from '@/components/status-select';
import { DataTableColumn } from '@/components/data-table';
import { BILLING_PAYMENT_STATUS_OPTIONS } from '@/lib/select-options';
import { Trash2, Edit, Printer } from 'lucide-react';
import type { Bill } from './types';

const STATUS_TONE: Record<string, StatusTone> = {
  Paid: 'success',
  Pending: 'danger',
};

interface BillColumnsProps {
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onStatusChange: (bill: Bill, status: string) => void;
}

export function getBillColumns({ onEdit, onDelete, onStatusChange }: BillColumnsProps): DataTableColumn<Bill>[] {
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
      render: (value: string, bill) => (
        <StatusSelect
          value={value}
          options={BILLING_PAYMENT_STATUS_OPTIONS}
          toneMap={STATUS_TONE}
          onChange={(status) => onStatusChange(bill, status)}
          aria-label={`Update payment status for ${bill.clientName}`}
        />
      ),
    },
    {
      key: 'amountPaid',
      label: 'Paid / Due',
      align: 'right',
      hideBelow: 'lg',
      render: (_value, bill) => {
        const due = Math.max(bill.total - bill.amountPaid, 0);
        return (
          <div className="text-xs leading-tight">
            <p className="tabular-nums text-success">Paid: Rs {bill.amountPaid.toLocaleString()}</p>
            {due > 0 && <p className="tabular-nums text-destructive">Due: Rs {due.toLocaleString()}</p>}
          </div>
        );
      },
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
