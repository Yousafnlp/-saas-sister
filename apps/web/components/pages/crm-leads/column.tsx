import { StatusBadge } from '@/components/status-badge';
import { DataTableColumn } from '@/components/data-table';
import { Trash2, Edit, CalendarPlus } from 'lucide-react';
import type { Lead } from './sheet';

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

interface LeadColumnsProps {
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onAddAppointment: (lead: Lead) => void;
}

export function getLeadColumns({ onEdit, onDelete, onAddAppointment }: LeadColumnsProps): DataTableColumn<Lead>[] {
  return [
    { key: 'name', label: 'Name', cellClassName: 'font-medium text-foreground' },
    { key: 'number', label: 'Number' },
    { key: 'source', label: 'Source' },
    { key: 'city', label: 'City', hideBelow: 'md' },
    { key: 'gender', label: 'Gender', hideBelow: 'lg' },
    {
      key: 'category',
      label: 'Category',
      render: (value: string) => <StatusBadge label={value} tone="info" />,
    },
    {
      key: 'createdAt',
      label: 'Added',
      hideBelow: 'lg',
      cellClassName: 'text-xs text-muted-foreground',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value, lead) => (
        <div className="flex gap-2">
          <button
            className="rounded p-1.5 transition-colors hover:bg-muted"
            title={`Add appointment for ${lead.name}`}
            aria-label={`Add appointment for ${lead.name}`}
            onClick={() => onAddAppointment(lead)}
          >
            <CalendarPlus className="size-4 text-primary" />
          </button>
          <button
            className="rounded p-1.5 transition-colors hover:bg-muted"
            title={`Edit ${lead.name}`}
            aria-label={`Edit ${lead.name}`}
            onClick={() => onEdit(lead)}
          >
            <Edit className="size-4 text-primary" />
          </button>
          <button
            className="rounded p-1.5 transition-colors hover:bg-muted"
            title={`Delete ${lead.name}`}
            aria-label={`Delete ${lead.name}`}
            onClick={() => onDelete(lead.id)}
          >
            <Trash2 className="size-4 text-destructive" />
          </button>
        </div>
      ),
    },
  ];
}
