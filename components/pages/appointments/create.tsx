'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import FormSelect from '@/components/form-select';
import { PageHeader } from '@/components/page-header';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppointments } from '@/lib/appointments-context';
import { APPOINTMENT_SERVICE_OPTIONS, APPOINTMENT_STATUS_OPTIONS } from '@/lib/select-options';
import { emptyAppointment, type AppointmentFormData } from './types';

const TIME_SLOTS = Array.from({ length: 96 }, (_, i) => {
  const hours = Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  const value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  const label = format(new Date(2000, 0, 1, hours, minutes), 'h:mm a');
  return { value, label };
});

export default function CreateAppointment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addAppointment } = useAppointments();
  const leadId = searchParams.get('leadId');

  const [formData, setFormData] = useState<AppointmentFormData>({
    ...emptyAppointment,
    leadId: leadId || null,
    name: searchParams.get('name') || '',
    number: searchParams.get('number') || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.time) {
      toast.error('Please pick a date and time for the appointment.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addAppointment(formData);
      toast.success(`Appointment created for ${formData.name}`);
      router.push('/appointments');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen space-y-6 bg-background p-4 md:p-8">
      <Link
        href="/appointments"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to Appointments
      </Link>

      <PageHeader
        title="Create Appointment"
        description={leadId ? 'Schedule an appointment for this lead' : 'Schedule a new appointment'}
      />

      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Number</label>
              <Input
                type="tel"
                required
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="0300-1234567"
              />
            </div>
            <FormSelect
              label="Service"
              value={formData.service}
              onChange={(value) => setFormData({ ...formData, service: value })}
              options={APPOINTMENT_SERVICE_OPTIONS}
            />
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Date</label>
                <div className="w-full overflow-hidden rounded-lg border-2 border-input lg:w-fit">
                  <Calendar
                    mode="single"
                    selected={formData.date ? new Date(`${formData.date}T00:00:00`) : undefined}
                    onSelect={(date) => setFormData({ ...formData, date: date ? format(date, 'yyyy-MM-dd') : '' })}
                    className="mx-auto"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Time</label>
                <div className="max-h-72 w-full overflow-y-auto rounded-lg border-2 border-input p-1 lg:w-40">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, time: slot.value })}
                      className={cn(
                        'w-full rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                        formData.time === slot.value && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                      )}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <FormSelect
              label="Status"
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value })}
              options={APPOINTMENT_STATUS_OPTIONS}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.push('/appointments')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Appointment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
