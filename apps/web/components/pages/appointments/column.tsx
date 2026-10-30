import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DataTableColumn } from '@/components/data-table';
import { type StatusTone } from '@/components/status-badge';
import { StatusSelect } from '@/components/status-select';
import { APPOINTMENT_STATUS_OPTIONS } from '@/lib/select-options';
import { Globe, Trash2 } from 'lucide-react';
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
  onStatusChange: (id: string, status: string) => void;
}

export function getAppointmentColumns({ onDelete, onStatusChange }: AppointmentColumnsProps): DataTableColumn<Appointment>[] {
  return [
    {
      key: 'name',
      label: 'Name',
      cellClassName: 'font-medium text-foreground',
      render: (value: string, appointment) => (
        <div className="flex flex-col gap-1">
          <span>{value}</span>
          {appointment.source === 'Online' && (
            <span className="inline-flex w-fit items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              <Globe className="size-3" /> Online
            </span>
          )}
        </div>
      ),
    },
    { key: 'number', label: 'Number', hideBelow: 'md' },
    {
      key: 'service',
      label: 'Service',
      render: (value: string, appointment) => (
        <div className="flex flex-col">
          <span>{value}</span>
          {appointment.treatment && <span className="text-xs text-muted-foreground">{appointment.treatment}</span>}
        </div>
      ),
    },
    {
      key: 'branch',
      label: 'Branch',
      hideBelow: 'lg',
      render: (value: Appointment['branch']) => value?.name ?? '—',
    },
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
      render: (value: string, appointment) => (
        <StatusSelect
          value={value}
          options={APPOINTMENT_STATUS_OPTIONS}
          toneMap={STATUS_TONE}
          onChange={(status) => onStatusChange(appointment.id, status)}
          aria-label={`Update status for ${appointment.name}`}
        />
      ),
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
