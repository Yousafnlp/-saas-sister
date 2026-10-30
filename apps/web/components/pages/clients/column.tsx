import { Button } from '@/components/ui/button';
import { DataTableColumn } from '@/components/data-table';
import { Trash2, Edit, Eye, Printer } from 'lucide-react';
import type { Client } from './sheet';

interface ClientColumnsProps {
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onViewBills: (client: Client) => void;
}

export function getClientColumns({
  onView,
  onEdit,
  onDelete,
  onViewBills,
}: ClientColumnsProps): DataTableColumn<Client>[] {
  return [
    { key: 'name', label: 'Name', cellClassName: 'font-medium text-foreground' },
    { key: 'number', label: 'Number', hideBelow: 'md' },
    { key: 'date', label: 'Date' },
    { key: 'age', label: 'Age', hideBelow: 'md' },
    { key: 'gender', label: 'Gender', hideBelow: 'md' },
    {
      key: 'concern',
      label: 'Concern',
      cellClassName: 'max-w-xs truncate',
      render: (value: string) => <span title={value}>{value}</span>,
    },
    { key: 'nextVisit', label: 'Next Visit', hideBelow: 'lg' },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_value, client) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onView(client)}
            aria-label={`View ${client.name}`}
            title={`View ${client.name}`}
          >
            <Eye className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onViewBills(client)}
            aria-label={`View bills for ${client.name}`}
            title={`View bills for ${client.name}`}
          >
            <Printer className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(client)}
            aria-label={`Edit ${client.name}`}
            title={`Edit ${client.name}`}
          >
            <Edit className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(client.id)}
            aria-label={`Delete ${client.name}`}
            title={`Delete ${client.name}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];
}
