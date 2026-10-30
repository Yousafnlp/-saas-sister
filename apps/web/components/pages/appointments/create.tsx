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
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormSelect from '@/components/form-select';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppointments } from '@/lib/appointments-context';
import { useBranches } from '@/lib/branches';
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
  const branches = useBranches();
  const leadId = searchParams.get('leadId');
  const initialDate = searchParams.get('date');

  const [formData, setFormData] = useState<AppointmentFormData>({
    ...emptyAppointment,
    leadId: leadId || null,
    name: searchParams.get('name') || '',
    number: searchParams.get('number') || '',
    date: initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate) ? initialDate : '',
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
      router.push(initialDate ? '/appointments?view=calendar' : '/appointments');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-card">
      <div className="flex items-center gap-3 border-b border-border p-3">
        <Link
          href="/appointments"
          className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Back to Appointments"
          title="Back to Appointments"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-foreground">Create Appointment</h1>
          <p className="truncate text-sm text-muted-foreground">
            {leadId ? 'Schedule an appointment for this lead' : 'Schedule a new appointment'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-3 p-3">
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
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Treatment <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Input
            type="text"
            value={formData.treatment}
            onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
            placeholder="e.g. HydraFacial Glow"
          />
        </div>
        {branches.length > 0 && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Branch</label>
            <Select
              value={formData.branch ?? 'none'}
              onValueChange={(value) => setFormData({ ...formData, branch: value === 'none' ? null : value })}
            >
              <SelectTrigger className="w-full border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No branch</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Date</label>
            <div className="w-full overflow-hidden rounded-md border-2 border-input lg:w-fit">
              <Calendar
                mode="single"
                selected={formData.date ? new Date(`${formData.date}T00:00:00`) : undefined}
                defaultMonth={formData.date ? new Date(`${formData.date}T00:00:00`) : undefined}
                onSelect={(date) => setFormData({ ...formData, date: date ? format(date, 'yyyy-MM-dd') : '' })}
                className="mx-auto"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Time</label>
            <div className="max-h-72 w-full overflow-y-auto rounded-md border-2 border-input p-1 lg:w-40">
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
        <div className="flex justify-end gap-3 border-t border-border pt-3">
          <Button type="button" variant="outline" onClick={() => router.push('/appointments')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Appointment'}
          </Button>
        </div>
      </form>
    </div>
  );
}
