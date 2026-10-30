'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { Briefcase, CalendarClock, ClipboardList, Clock, LayoutDashboard, Receipt, UserRound, Users } from 'lucide-react';

import { api, ApiError } from '@/lib/api';
import { StatCard, type StatTone } from '@/components/stat-card';
import { EmptyState } from '@/components/empty-state';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  AppointmentsPanel,
  BillingPanel,
  BranchesPanel,
  ClientsPanel,
  EmployeesPanel,
  ExpensesPanel,
  LeadsPanel,
  Panel,
  PayrollPanel,
  ServicesPanel,
  TeamPanel,
  rs,
} from './panels';
import type { ChartPoint, DashboardResponse, DashboardSections } from './types';

const SERIES = {
  revenue: { label: 'Revenue', color: 'var(--chart-1)' },
  expenses: { label: 'Expenses', color: 'var(--chart-2)' },
} satisfies ChartConfig;

interface Kpi {
  label: string;
  value: string | number;
  hint?: string;
  icon: typeof Users;
  tone?: StatTone;
}

// The headline numbers, one or two per section the user can see.
function buildKpis(s: DashboardSections): Kpi[] {
  const kpis: Kpi[] = [];
  if (s.appointments) {
    kpis.push({
      label: "Today's appointments",
      value: s.appointments.today,
      hint: `${s.appointments.nextSevenDays} in the next 7 days`,
      icon: CalendarClock,
    });
  }
  if (s.billing) {
    kpis.push(
      {
        label: 'Billed this month',
        value: rs(s.billing.billedThisMonth),
        hint: `${rs(s.billing.collectedThisMonth)} collected`,
        icon: Receipt,
        tone: 'success',
      },
      {
        label: 'Outstanding',
        value: rs(s.billing.outstanding),
        hint: `${s.billing.unpaidCount} unpaid bills`,
        icon: Clock,
        tone: 'warning',
      },
    );
  }
  if (s.leads) {
    kpis.push({ label: 'New leads this week', value: s.leads.newThisWeek, hint: `${s.leads.total} total`, icon: Briefcase, tone: 'info' });
  }
  if (s.clients) {
    kpis.push({ label: 'Clients', value: s.clients.total, hint: `${s.clients.newThisMonth} new this month`, icon: UserRound });
  }
  if (s.expenses) {
    kpis.push({
      label: 'Expenses to approve',
      value: s.expenses.pendingCount,
      hint: rs(s.expenses.pendingAmount),
      icon: ClipboardList,
      tone: 'danger',
    });
  }
  if (s.employees) {
    kpis.push({ label: 'Active employees', value: s.employees.active, hint: `${s.employees.inactive} inactive`, icon: Users });
  }
  return kpis;
}

export default function Dashboard() {
  const [sections, setSections] = useState<DashboardSections | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);

  useEffect(() => {
    let cancelled = false;

    api
      .get<DashboardResponse>('/dashboard')
      .then((res) => {
        if (cancelled) return;
        setSections(res.data.sections);
        setChartData(res.data.chart);
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load dashboard');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!sections) {
    return <div className="p-3 text-sm text-muted-foreground">Loading dashboard...</div>;
  }

  const kpis = buildKpis(sections);
  // The API leaves out revenue or expenses when the role can't see billing or expenses.
  const series = (Object.keys(SERIES) as (keyof typeof SERIES)[]).filter((key) => chartData.some((point) => key in point));
  const chartConfig = Object.fromEntries(series.map((key) => [key, SERIES[key]])) satisfies ChartConfig;

  if (kpis.length === 0 && series.length === 0 && Object.keys(sections).length === 0) {
    return (
      <div className="p-3">
        <EmptyState icon={LayoutDashboard} title="Nothing to show yet" description="Ask an Admin to give your role access to more pages." />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-card">
      {/* Headline numbers */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-2 gap-3 border-b border-border p-3 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
          {kpis.map((kpi) => (
            <StatCard key={kpi.label} icon={kpi.icon} label={kpi.label} value={kpi.value} hint={kpi.hint} tone={kpi.tone} />
          ))}
        </div>
      )}

      {/* Section details */}
      <div className="grid grid-cols-1 items-start gap-3 p-3 lg:grid-cols-2 2xl:grid-cols-3">
        {series.length > 0 && (
          <Panel
            title={series.length === 2 ? 'Revenue vs Expenses' : SERIES[series[0]].label}
            className="lg:col-span-2 2xl:col-span-2"
          >
            <div className="p-3">
              <p className="mb-2 text-xs text-muted-foreground">Monthly totals over the last {chartData.length} months</p>
              <ChartContainer config={chartConfig} className="aspect-auto h-65 w-full">
                <LineChart data={chartData} margin={{ left: 12, right: 12, top: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip cursor={{ strokeDasharray: '4 4' }} content={<ChartTooltipContent indicator="dot" />} />
                  {series.map((key) => (
                    <Line key={key} dataKey={key} type="monotone" stroke={`var(--color-${key})`} strokeWidth={2.5} dot={false} />
                  ))}
                  <ChartLegend content={<ChartLegendContent />} />
                </LineChart>
              </ChartContainer>
            </div>
          </Panel>
        )}
        {sections.appointments && <AppointmentsPanel data={sections.appointments} />}
        {sections.billing && <BillingPanel data={sections.billing} />}
        {sections.leads && <LeadsPanel data={sections.leads} />}
        {sections.clients && <ClientsPanel data={sections.clients} />}
        {sections.expenses && <ExpensesPanel data={sections.expenses} />}
        {sections.employees && <EmployeesPanel data={sections.employees} />}
        {sections.payroll && <PayrollPanel data={sections.payroll} />}
        {sections.branches && <BranchesPanel data={sections.branches} />}
        {sections.services && <ServicesPanel data={sections.services} />}
        {sections.team && <TeamPanel data={sections.team} />}
      </div>
    </div>
  );
}
