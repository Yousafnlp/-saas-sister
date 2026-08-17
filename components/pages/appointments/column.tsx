import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DataTableColumn } from '@/components/data-table';
import { StatusBadge, type StatusTone } from '@/components/status-badge';
import { Trash2 } from 'lucide-react';
import type { Appointment } from './types';

const STATUS_TONE: Record<string, StatusTone> = {
  Scheduled: 'info',
  Confirmed: 'success',
  Completed: 'neutral',
  Cancelled: 'danger',
};

const formatDate = (date: string) => format(new Date(`${date}T00:00:00`), 'MMM d, yyyy');

const formatTime = (time: string) => format(new Date(`2000-01-01T${time}`), 'h:mm a');

interface AppointmentColumnsProps {
  onDelete: (id: string) => void;
}

export function getAppointmentColumns({ onDelete }: AppointmentColumnsProps): DataTableColumn<Appointment>[] {
  return [
    { key: 'name', label: 'Name', cellClassName: 'font-medium text-foreground' },
    { key: 'number', label: 'Number', hideBelow: 'md' },
    { key: 'service', label: 'Service' },
    {
      key: 'date',
      label: 'Date',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'time',
      label: 'Time',
      hideBelow: 'md',
      render: (value: string) => formatTime(value),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => <StatusBadge label={value} tone={STATUS_TONE[value] || 'neutral'} />,
    },
    {
      key: 'notes',
      label: 'Notes',
      hideBelow: 'lg',
      cellClassName: 'max-w-xs truncate',
      render: (value: string) => (value ? <span title={value}>{value}</span> : '—'),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_value, appointment) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(appointment.id)}
            aria-label={`Delete appointment for ${appointment.name}`}
            title={`Delete appointment for ${appointment.name}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];
}
