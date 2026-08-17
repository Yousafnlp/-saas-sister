'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import {
  Briefcase,
  Calendar,
  ClipboardList,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
} from 'lucide-react';

import { api, ApiError } from '@/lib/api';
import { toDateOnly } from '@/lib/date-utils';
import type { Client } from '@/components/pages/clients/sheet';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'var(--chart-1)',
  },
  expenses: {
    label: 'Expenses',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  onLeave: number;
  totalRevenue: number;
  totalExpenses: number;
  averageAttendance: number;
  pendingApprovals: number;
}

interface ChartPoint {
  month: string;
  revenue: number;
  expenses: number;
}

interface DashboardResponse {
  success: boolean;
  data: { stats: DashboardStats; chart: ChartPoint[] };
}

interface ClientListResponse {
  success: boolean;
  total: number;
  data: Client[];
}

const emptyStats: DashboardStats = {
  totalEmployees: 0,
  presentToday: 0,
  onLeave: 0,
  totalRevenue: 0,
  totalExpenses: 0,
  averageAttendance: 0,
  pendingApprovals: 0,
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [totalClients, setTotalClients] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      api.get<DashboardResponse>('/dashboard'),
      api.get<ClientListResponse>('/clients?limit=5&sort=-createdAt'),
    ])
      .then(([dashboardRes, clientsRes]) => {
        if (cancelled) return;
        setStats(dashboardRes.data.stats);
        setChartData(dashboardRes.data.chart);
        setRecentClients(clientsRes.data.map((c) => ({ ...c, nextVisit: toDateOnly(c.nextVisit) })));
        setTotalClients(clientsRes.total);
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load dashboard');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6 bg-background p-4 md:space-y-8 md:p-8">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's your HR performance overview."
      />

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Employees"
          value={stats.totalEmployees}
          tone="primary"
        />
        <StatCard
          icon={Clock}
          label="Present Today"
          value={stats.presentToday}
          hint={`${stats.averageAttendance}% avg. attendance`}
          tone="success"
        />
        <StatCard
          icon={Calendar}
          label="On Leave"
          value={stats.onLeave}
          tone="warning"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          tone="success"
        />
        <StatCard
          icon={DollarSign}
          label="Total Expenses"
          value={`$${stats.totalExpenses.toLocaleString()}`}
          tone="danger"
        />
        <StatCard
          icon={ClipboardList}
          label="Pending Approvals"
          value={stats.pendingApprovals}
          tone="info"
        />
        <StatCard
          icon={Briefcase}
          label="Total Clients"
          value={totalClients}
          tone="primary"
        />
      </div>

      {/* Trend chart + recent clients */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
            <CardDescription>Monthly trend over the last {chartData.length} months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
              <LineChart data={chartData} margin={{ left: 12, right: 12, top: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={{ strokeDasharray: '4 4' }} content={<ChartTooltipContent indicator="dot" />} />
                <Line
                  dataKey="revenue"
                  type="monotone"
                  stroke="var(--color-revenue)"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  dataKey="expenses"
                  type="monotone"
                  stroke="var(--color-expenses)"
                  strokeWidth={2.5}
                  dot={false}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <div>
              <CardTitle>Recent Clients</CardTitle>
              <CardDescription>Latest visits &amp; upcoming appointments</CardDescription>
            </div>
            <Link href="/clients" className="shrink-0 text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {recentClients.map((client) => (
              <div
                key={client.id}
                className="-mx-3 flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{client.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{client.concern}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-muted-foreground">Next visit</p>
                  <p className="text-xs font-medium tabular-nums text-foreground">{client.nextVisit}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
