'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { AlertTriangle, CalendarCheck, CalendarClock, ChevronLeft, ChevronRight, Globe, Phone, Plus, XCircle } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { fromApi, useAppointments, type AppointmentListResponse } from '@/lib/appointments-context';
import { useBranches } from '@/lib/branches';
import { APPOINTMENT_STATUS_OPTIONS } from '@/lib/select-options';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatCard } from '@/components/stat-card';
import { StatusSelect } from '@/components/status-select';
import { StatusBadge, TONE_STYLES, type StatusTone } from '@/components/status-badge';
import type { Appointment } from './types';

const WEEK_OPTIONS = { weekStartsOn: 1 as const };
const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_CHIPS = 3;

const STATUS_TONE: Record<string, StatusTone> = {
  Scheduled: 'info',
  Confirmed: 'success',
  Completed: 'neutral',
  Cancelled: 'danger',
};

type VisitState = 'upcoming' | 'completed' | 'needs-update' | 'cancelled';

const VISIT_STATE: Record<VisitState, { label: string; tone: StatusTone }> = {
  upcoming: { label: 'Upcoming', tone: 'info' },
  completed: { label: 'Completed', tone: 'success' },
  'needs-update': { label: 'Passed, not marked', tone: 'warning' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

const toDateKey = (date: Date) => format(date, 'yyyy-MM-dd');
const formatTime = (time: string) => format(new Date(`2000-01-01T${time}`), 'h:mm a');

function visitState(appointment: Appointment, now: string): VisitState {
  if (appointment.status === 'Completed') return 'completed';
  if (appointment.status === 'Cancelled') return 'cancelled';
  return `${appointment.date}T${appointment.time}` < now ? 'needs-update' : 'upcoming';
}

export default function AppointmentsCalendar() {
  const { updateAppointmentStatus } = useAppointments();
  const branches = useBranches();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [branchFilter, setBranchFilter] = useState('all');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const now = format(new Date(), "yyyy-MM-dd'T'HH:mm");
  const today = now.slice(0, 10);

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(month), WEEK_OPTIONS),
        end: endOfWeek(endOfMonth(month), WEEK_OPTIONS),
      }),
    [month],
  );

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    const from = toDateKey(days[0]);
    const to = toDateKey(days[days.length - 1]);
    api
      .get<AppointmentListResponse>(`/appointments/calendar?from=${from}&to=${to}`)
      .then((res) => {
        if (!cancelled) setAppointments(res.data.map(fromApi));
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load calendar');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [days]);

  const visible = useMemo(
    () =>
      appointments.filter((appointment) => {
        if (branchFilter === 'all') return true;
        if (branchFilter === 'none') return !appointment.branch;
        return appointment.branch?.id === branchFilter;
      }),
    [appointments, branchFilter],
  );

  const byDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const appointment of visible) {
      const list = map.get(appointment.date) ?? [];
      list.push(appointment);
      map.set(appointment.date, list);
    }
    map.forEach((list) => list.sort((a, b) => a.time.localeCompare(b.time)));
    return map;
  }, [visible]);

  const monthTotals = useMemo(() => {
    const totals: Record<VisitState, number> = { upcoming: 0, completed: 0, 'needs-update': 0, cancelled: 0 };
    for (const appointment of visible) {
      if (isSameMonth(new Date(`${appointment.date}T00:00:00`), month)) {
        totals[visitState(appointment, now)] += 1;
      }
    }
    return totals;
  }, [visible, month, now]);

  const selectedAppointments = byDate.get(selectedDate) ?? [];

  const goToMonth = (next: Date) => {
    setMonth(startOfMonth(next));
    setSelectedDate(isSameMonth(next, new Date()) ? today : toDateKey(startOfMonth(next)));
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const updated = await updateAppointmentStatus(id, status);
      setAppointments((prev) => prev.map((appointment) => (appointment.id === id ? updated : appointment)));
      toast.success(
        status === 'Completed' ? 'Appointment completed — client added to Clients' : `Status updated to ${status}`,
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update status');
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={CalendarClock} label="Upcoming" value={monthTotals.upcoming} tone="info" />
        <StatCard icon={CalendarCheck} label="Completed" value={monthTotals.completed} tone="success" />
        <StatCard
          icon={AlertTriangle}
          label="Passed, not marked"
          value={monthTotals['needs-update']}
          hint="Mark these Completed or Cancelled"
          tone="warning"
        />
        <StatCard icon={XCircle} label="Cancelled" value={monthTotals.cancelled} tone="danger" />
      </div>

      <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Month grid */}
        <div className="rounded-2xl border border-border bg-card p-3 md:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => goToMonth(addMonths(month, -1))} aria-label="Previous month">
                <ChevronLeft className="size-4" />
              </Button>
              <h2 className="min-w-36 text-center text-lg font-semibold text-foreground" aria-live="polite">
                {format(month, 'MMMM yyyy')}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => goToMonth(addMonths(month, 1))} aria-label="Next month">
                <ChevronRight className="size-4" />
              </Button>
              <Button variant="outline" size="sm" className="ml-1" onClick={() => goToMonth(new Date())}>
                Today
              </Button>
            </div>

            {branches.length > 0 && (
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-full sm:w-52" aria-label="Filter by branch">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="none">No branch</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-1.5" role="grid" aria-busy={isLoading}>
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} role="columnheader" className="pb-1 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
              </div>
            ))}

            {days.map((day) => {
              const key = toDateKey(day);
              const dayAppointments = byDate.get(key) ?? [];
              const inMonth = isSameMonth(day, month);
              const isToday = key === today;
              const isSelected = key === selectedDate;
              const isPast = key < today;

              return (
                <button
                  key={key}
                  type="button"
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-label={`${format(day, 'EEEE, MMMM d')}: ${dayAppointments.length} appointment${dayAppointments.length === 1 ? '' : 's'}`}
                  onClick={() => setSelectedDate(key)}
                  className={cn(
                    'flex min-h-16 flex-col gap-1 rounded-xl border p-1.5 text-left transition-colors md:min-h-28 md:p-2',
                    'hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isPast ? 'bg-muted/40' : 'bg-card',
                    isSelected ? 'border-primary ring-1 ring-primary' : 'border-border',
                    !inMonth && 'opacity-45',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                      isToday ? 'bg-primary text-primary-foreground' : 'text-foreground',
                    )}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* Phones: coloured dots. Tablets and up: time + name chips. */}
                  {dayAppointments.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 md:hidden">
                      {dayAppointments.slice(0, 4).map((appointment) => (
                        <span
                          key={appointment.id}
                          className={cn(TONE_STYLES[VISIT_STATE[visitState(appointment, now)].tone], 'size-1.5 rounded-full bg-current ring-0')}
                        />
                      ))}
                    </div>
                  )}
                  <div className="hidden min-w-0 flex-col gap-0.5 md:flex">
                    {dayAppointments.slice(0, MAX_CHIPS).map((appointment) => {
                      const state = visitState(appointment, now);
                      return (
                        <span
                          key={appointment.id}
                          className={cn(
                            'truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset',
                            TONE_STYLES[VISIT_STATE[state].tone],
                            state === 'cancelled' && 'line-through',
                          )}
                        >
                          {appointment.time} {appointment.name.split(' ')[0]}
                        </span>
                      );
                    })}
                    {dayAppointments.length > MAX_CHIPS && (
                      <span className="px-1.5 text-[11px] font-medium text-muted-foreground">
                        +{dayAppointments.length - MAX_CHIPS} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            {(Object.keys(VISIT_STATE) as VisitState[]).map((state) => (
              <span key={state} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={cn(TONE_STYLES[VISIT_STATE[state].tone], 'size-2 rounded-full bg-current ring-0')} />
                {VISIT_STATE[state].label}
              </span>
            ))}
          </div>
        </div>

        {/* Selected day */}
        <Card className="xl:sticky xl:top-4">
          <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
            <div>
              <CardTitle>{format(new Date(`${selectedDate}T00:00:00`), 'EEEE, MMM d')}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedAppointments.length === 0
                  ? 'No appointments'
                  : `${selectedAppointments.length} appointment${selectedAppointments.length === 1 ? '' : 's'}`}
              </p>
            </div>
            {selectedDate >= today && (
              <Button asChild size="sm" variant="outline" className="gap-1.5">
                <Link href={`/appointments/new?date=${selectedDate}`}>
                  <Plus className="size-4" /> Book
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedAppointments.map((appointment) => {
              const state = visitState(appointment, now);
              return (
                <div key={appointment.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold tabular-nums text-muted-foreground">{formatTime(appointment.time)}</p>
                      <p className="truncate font-medium text-foreground">{appointment.name}</p>
                    </div>
                    <StatusSelect
                      value={appointment.status}
                      options={APPOINTMENT_STATUS_OPTIONS}
                      toneMap={STATUS_TONE}
                      onChange={(status) => handleStatusChange(appointment.id, status)}
                      aria-label={`Update status for ${appointment.name}`}
                    />
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <a href={`tel:${appointment.number}`} className="flex w-fit items-center gap-1.5 hover:text-foreground">
                      <Phone className="size-3.5" /> {appointment.number}
                    </a>
                    <p>
                      {appointment.service}
                      {appointment.treatment && ` · ${appointment.treatment}`}
                      {appointment.branch && ` · ${appointment.branch.name}`}
                    </p>
                    {appointment.notes && <p className="line-clamp-2 italic">{appointment.notes}</p>}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {state === 'needs-update' && <StatusBadge label="Passed, not marked" tone="warning" />}
                    {appointment.source === 'Online' && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                        <Globe className="size-3" /> Booked online
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
