import type { ReactNode } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toDateOnly } from '@/lib/date-utils';
import { StatusBadge, type StatusTone } from '@/components/status-badge';
import { ROLE_TONE } from '@/components/pages/team/types';
import type {
  AppointmentsSummary,
  BillingSummary,
  BranchesSummary,
  ClientsSummary,
  CountRow,
  EmployeesSummary,
  ExpensesSummary,
  LeadsSummary,
  PayrollSummary,
  ServicesSummary,
  TeamSummary,
} from './types';

const APPOINTMENT_TONE: Record<string, StatusTone> = {
  Scheduled: 'info',
  Confirmed: 'success',
  Completed: 'neutral',
  Cancelled: 'danger',
};

const PAYMENT_TONE: Record<string, StatusTone> = {
  Paid: 'success',
  Pending: 'danger',
};

export const rs = (amount: number) => `Rs ${amount.toLocaleString()}`;
const formatDay = (value: string) => format(new Date(`${toDateOnly(value)}T00:00:00`), 'MMM d');
const formatTime = (time: string) => format(new Date(`2000-01-01T${time}`), 'h:mm a');
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

// ---------- Building blocks

export function Panel({
  title,
  href,
  children,
  className,
}: {
  title: string;
  href?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('flex flex-col overflow-hidden rounded-xl border border-border bg-card', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2.5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {href && (
          <Link href={href} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            View all <ArrowUpRight className="size-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

const METRIC_COLS: Record<number, string> = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' };

function Metrics({ items }: { items: { label: string; value: ReactNode; hint?: string }[] }) {
  return (
    <div className={cn('grid divide-x divide-border border-b border-border', METRIC_COLS[items.length])}>
      {items.map((item) => (
        <div key={item.label} className="min-w-0 p-3">
          <p className="truncate text-xs text-muted-foreground">{item.label}</p>
          <p className="mt-0.5 truncate text-lg font-semibold tabular-nums text-foreground">{item.value}</p>
          {item.hint && <p className="truncate text-xs text-muted-foreground">{item.hint}</p>}
        </div>
      ))}
    </div>
  );
}

function Rows({ empty, children }: { empty: string; children: ReactNode[] }) {
  if (children.length === 0) return <p className="p-3 text-sm text-muted-foreground">{empty}</p>;
  return <ul className="divide-y divide-border">{children}</ul>;
}

function Row({ primary, secondary, aside }: { primary: ReactNode; secondary?: ReactNode; aside?: ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-3 px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{primary}</p>
        {secondary && <p className="truncate text-xs text-muted-foreground">{secondary}</p>}
      </div>
      {aside && <div className="flex shrink-0 items-center gap-2 text-right">{aside}</div>}
    </li>
  );
}

function Breakdown({ rows, empty }: { rows: CountRow[]; empty: string }) {
  const max = Math.max(...rows.map((row) => row.count), 1);
  if (rows.length === 0) return <p className="p-3 text-sm text-muted-foreground">{empty}</p>;
  return (
    <ul className="space-y-2.5 p-3">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="truncate text-foreground">{row.label}</span>
            <span className="tabular-nums text-muted-foreground">{row.count}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(row.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

// ---------- Sections

export function AppointmentsPanel({ data }: { data: AppointmentsSummary }) {
  return (
    <Panel title="Appointments" href="/appointments">
      <Metrics
        items={[
          { label: 'Today', value: data.today },
          { label: 'Next 7 days', value: data.nextSevenDays },
        ]}
      />
      {data.todayByStatus.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-b border-border p-3">
          {data.todayByStatus.map((row) => (
            <StatusBadge key={row.label} label={`${row.label} · ${row.count}`} tone={APPOINTMENT_TONE[row.label] ?? 'neutral'} />
          ))}
        </div>
      )}
      <Rows empty="No upcoming appointments.">
        {data.upcoming.map((a) => (
          <Row
            key={a.id}
            primary={a.name}
            secondary={[a.treatment || a.service, a.branch?.name].filter(Boolean).join(' · ')}
            aside={
              <div>
                <p className="text-xs font-medium tabular-nums text-foreground">{formatTime(a.time)}</p>
                <p className="text-xs text-muted-foreground">{formatDay(a.date)}</p>
              </div>
            }
          />
        ))}
      </Rows>
    </Panel>
  );
}

export function LeadsPanel({ data }: { data: LeadsSummary }) {
  return (
    <Panel title="CRM Leads" href="/crm-leads">
      <Metrics
        items={[
          { label: 'Total leads', value: data.total },
          { label: 'New this week', value: data.newThisWeek },
        ]}
      />
      <div className="border-b border-border">
        <Breakdown rows={data.byCategory} empty="No leads yet." />
      </div>
      <Rows empty="No leads yet.">
        {data.recent.map((lead) => (
          <Row
            key={lead.id}
            primary={lead.name}
            secondary={`${lead.source} · ${formatDay(lead.createdAt)}`}
            aside={<StatusBadge label={lead.category} tone="info" />}
          />
        ))}
      </Rows>
    </Panel>
  );
}

export function ClientsPanel({ data }: { data: ClientsSummary }) {
  return (
    <Panel title="Clients" href="/clients">
      <Metrics
        items={[
          { label: 'Total clients', value: data.total },
          { label: 'New this month', value: data.newThisMonth },
        ]}
      />
      <p className="px-3 pt-3 text-xs font-medium text-muted-foreground">Upcoming visits</p>
      <Rows empty="No upcoming visits.">
        {data.upcomingVisits.map((client) => (
          <Row
            key={client.id}
            primary={<Link href={`/clients/${client.id}`} className="hover:underline">{client.name}</Link>}
            secondary={client.concern || '—'}
            aside={<span className="text-xs font-medium tabular-nums text-foreground">{formatDay(client.nextVisit)}</span>}
          />
        ))}
      </Rows>
    </Panel>
  );
}

export function BillingPanel({ data }: { data: BillingSummary }) {
  return (
    <Panel title="Billing" href="/billing">
      <Metrics
        items={[
          { label: 'Billed this month', value: rs(data.billedThisMonth), hint: plural(data.billsThisMonth, 'bill') },
          { label: 'Collected', value: rs(data.collectedThisMonth) },
          { label: 'Outstanding', value: rs(data.outstanding), hint: `${data.unpaidCount} unpaid` },
        ]}
      />
      <Rows empty="No bills yet.">
        {data.recent.map((bill) => (
          <Row
            key={bill.id}
            primary={bill.clientName}
            secondary={`${bill.invoiceNumber} · ${formatDay(bill.date)}`}
            aside={
              <>
                <span className="text-sm font-medium tabular-nums text-foreground">{rs(bill.total)}</span>
                <StatusBadge label={bill.paymentStatus} tone={PAYMENT_TONE[bill.paymentStatus] ?? 'neutral'} />
              </>
            }
          />
        ))}
      </Rows>
    </Panel>
  );
}

export function ExpensesPanel({ data }: { data: ExpensesSummary }) {
  return (
    <Panel title="Expenses" href="/expenses">
      <Metrics
        items={[
          { label: 'Approved this month', value: rs(data.approvedThisMonth) },
          { label: 'Awaiting approval', value: rs(data.pendingAmount), hint: plural(data.pendingCount, 'claim') },
        ]}
      />
      <Rows empty="Nothing waiting for approval.">
        {data.pending.map((expense) => (
          <Row
            key={expense.id}
            primary={expense.description || expense.category}
            secondary={[expense.category, expense.submittedBy, formatDay(expense.date)].filter(Boolean).join(' · ')}
            aside={<span className="text-sm font-medium tabular-nums text-foreground">{rs(expense.amount)}</span>}
          />
        ))}
      </Rows>
    </Panel>
  );
}

export function PayrollPanel({ data }: { data: PayrollSummary }) {
  return (
    <Panel title="Payroll" href="/payroll">
      <Metrics
        items={[
          {
            label: data.latestMonth ? `${data.latestMonth} payroll` : 'Latest payroll',
            value: rs(data.latestMonthTotal),
            hint: data.latestMonth ? plural(data.latestMonthCount, 'employee') : 'Not run yet',
          },
          { label: 'Waiting to be paid', value: rs(data.pendingAmount), hint: plural(data.pendingCount, 'record') },
        ]}
      />
    </Panel>
  );
}

export function EmployeesPanel({ data }: { data: EmployeesSummary }) {
  return (
    <Panel title="Employees" href="/employees">
      <Metrics
        items={[
          { label: 'Active', value: data.active },
          { label: 'Inactive', value: data.inactive },
          { label: 'Monthly salaries', value: rs(data.monthlySalaries) },
        ]}
      />
      <Breakdown rows={data.byDepartment} empty="No active employees." />
    </Panel>
  );
}

export function ServicesPanel({ data }: { data: ServicesSummary }) {
  return (
    <Panel title="Services & Prices" href="/services">
      <Metrics
        items={[
          { label: 'Active services', value: data.active, hint: `of ${data.total}` },
          { label: 'On booking page', value: data.online },
          { label: 'Categories', value: data.categories },
        ]}
      />
    </Panel>
  );
}

export function BranchesPanel({ data }: { data: BranchesSummary }) {
  return (
    <Panel title="Branches" href="/branches">
      <Metrics
        items={[
          { label: 'Branches', value: data.total },
          { label: 'Taking bookings', value: data.takingBookings },
        ]}
      />
      <Rows empty="No branches yet.">
        {data.list.map((branch) => (
          <Row
            key={branch.id}
            primary={branch.name}
            secondary={`${plural(branch.appointmentsToday, 'appointment')} today${branch.city ? ` · ${branch.city}` : ''}`}
            aside={
              <StatusBadge
                label={!branch.isActive ? 'Closed' : branch.bookingEnabled ? 'Taking bookings' : 'Paused'}
                tone={!branch.isActive ? 'neutral' : branch.bookingEnabled ? 'success' : 'warning'}
              />
            }
          />
        ))}
      </Rows>
    </Panel>
  );
}

export function TeamPanel({ data }: { data: TeamSummary }) {
  return (
    <Panel title="Team" href="/team">
      <Metrics
        items={[
          { label: 'Members', value: data.members },
          { label: 'Active', value: data.active },
          { label: 'Pending invites', value: data.pendingInvites },
        ]}
      />
      {data.byRole.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-3">
          {data.byRole.map((row) => (
            <StatusBadge key={row.label} label={`${row.label} · ${row.count}`} tone={ROLE_TONE[row.label] ?? 'neutral'} />
          ))}
        </div>
      )}
    </Panel>
  );
}
