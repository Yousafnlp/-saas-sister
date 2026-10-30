'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataTable from '@/components/data-table';
import { CalendarDays, List, Plus, Search } from 'lucide-react';
import { useAppointments } from '@/lib/appointments-context';
import { getAppointmentColumns } from './column';
import AppointmentsCalendar from './calendar';

export default function Appointments() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get('view') === 'calendar' ? 'calendar' : 'list';
  const { appointments, isLoading, removeAppointment, updateAppointmentStatus } = useAppointments();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAppointments = appointments
    .filter(
      (appointment) =>
        appointment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.number.includes(searchQuery),
    )
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

  const handleViewChange = (next: string) => {
    router.replace(next === 'calendar' ? '/appointments?view=calendar' : '/appointments', { scroll: false });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      await removeAppointment(id);
      toast.success('Appointment deleted');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete appointment');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateAppointmentStatus(id, status);
      toast.success(
        status === 'Completed' ? 'Appointment completed — client added to Clients' : `Status updated to ${status}`,
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update status');
    }
  };

  const columns = getAppointmentColumns({ onDelete: handleDelete, onStatusChange: handleStatusChange });

  return (
    <Tabs value={view} onValueChange={handleViewChange} className="min-h-full gap-0 bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center">
        <TabsList>
          <TabsTrigger value="list" className="gap-1.5">
            <List className="size-4" /> List
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-1.5">
            <CalendarDays className="size-4" /> Calendar
          </TabsTrigger>
        </TabsList>
        {view === 'list' && (
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
        <Button onClick={() => router.push('/appointments/new')} className="gap-2 whitespace-nowrap sm:ml-auto">
          <Plus className="size-4" /> New Appointment
        </Button>
      </div>

      <TabsContent value="list">
        <DataTable
          flush
          columns={columns}
          data={filteredAppointments}
          emptyMessage={isLoading ? 'Loading appointments...' : 'No appointments booked yet'}
          footer={
            <>
              Showing <span className="font-medium text-foreground">{filteredAppointments.length}</span> of {appointments.length} appointments
            </>
          }
        />
      </TabsContent>

      <TabsContent value="calendar" className="p-3">
        <AppointmentsCalendar />
      </TabsContent>
    </Tabs>
  );
}
