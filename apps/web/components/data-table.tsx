'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const HIDE_BELOW_CLASS: Record<string, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
};

const ALIGN_CLASS: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export interface DataTableColumn<T = any> {
  key: string;
  label: string;
  /** Hide this column below the given breakpoint (e.g. 'md' hides on mobile, shows md and up). */
  hideBelow?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center' | 'right';
  headerClassName?: string;
  cellClassName?: string;
  /** Receives the raw cell value plus the full row, so actions columns can access the whole record. */
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T = any> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey?: (row: T, index: number) => React.Key;
  emptyMessage?: string;
  /** Search / filters / actions row rendered above the table, separated by a divider. */
  toolbar?: React.ReactNode;
  /** Row rendered below the table (e.g. result count), separated by a divider. */
  footer?: React.ReactNode;
  /** Full-bleed variant for list pages: no outer border or rounded corners. */
  flush?: boolean;
}

export default function DataTable<T = any>({
  columns,
  data,
  getRowKey = (row: any, index: number) => row?.id ?? index,
  emptyMessage = 'No records found.',
  toolbar,
  footer,
  flush = false,
}: DataTableProps<T>) {
  return (
    <div className={cn('bg-card', !flush && 'overflow-hidden rounded-xl border border-border')}>
      {toolbar && <div className="border-b border-border p-3">{toolbar}</div>}
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  'h-10 px-3 text-xs font-medium text-muted-foreground',
                  ALIGN_CLASS[column.align ?? 'left'],
                  column.hideBelow && HIDE_BELOW_CLASS[column.hideBelow],
                  column.headerClassName
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((row, idx) => (
              <TableRow key={getRowKey(row, idx)} className="hover:bg-muted/40">
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn(
                      'whitespace-normal px-3 py-2.5 text-foreground/80',
                      ALIGN_CLASS[column.align ?? 'left'],
                      column.hideBelow && HIDE_BELOW_CLASS[column.hideBelow],
                      column.cellClassName
                    )}
                  >
                    {column.render
                      ? column.render((row as any)[column.key], row)
                      : (row as any)[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="px-3 py-12 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {footer && <div className="border-t border-border p-3 text-sm text-muted-foreground">{footer}</div>}
    </div>
  );
}
