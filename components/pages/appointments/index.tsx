'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/page-header';
import DataTable from '@/components/data-table';
import { Plus, Search } from 'lucide-react';
import { useAppointments } from '@/lib/appointments-context';
import { getAppointmentColumns } from './column';

export default function Appointments() {
  const router = useRouter();
  const { appointments, isLoading, removeAppointment, updateAppointmentStatus } = useAppointments();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAppointments = appointments
    .filter(
      (appointment) =>
        appointment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.number.includes(searchQuery),
    )
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

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
    <div className="min-h-screen space-y-6 bg-background p-4 md:p-8">
      <PageHeader
        title="Appointments"
        description="Track and manage booked appointments"
        actions={
          <>
            <div className="relative flex-1 sm:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => router.push('/appointments/new')} className="gap-2 whitespace-nowrap">
              <Plus className="size-4" /> New Appointment
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={filteredAppointments}
        emptyMessage={isLoading ? 'Loading appointments...' : 'No appointments booked yet'}
      />
    </div>
  );
}
