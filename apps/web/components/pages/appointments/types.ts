import { APPOINTMENT_SERVICE_OPTIONS, APPOINTMENT_STATUS_OPTIONS } from '@/lib/select-options';

export interface AppointmentBranch {
  id: string;
  name: string;
  slug: string;
}

export interface Appointment {
  id: string;
  leadId: string | null;
  name: string;
  number: string;
  service: string;
  treatment: string;
  date: string;
  time: string;
  status: string;
  notes: string;
  branch: AppointmentBranch | null;
  source: 'Staff' | 'Online';
}

export interface AppointmentFormData
  extends Omit<Appointment, 'id' | 'branch' | 'source'> {
  branch: string | null;
}

export const emptyAppointment: AppointmentFormData = {
  leadId: null,
  name: '',
  number: '',
  service: APPOINTMENT_SERVICE_OPTIONS[0],
  treatment: '',
  date: '',
  time: '',
  status: APPOINTMENT_STATUS_OPTIONS[0],
  notes: '',
  branch: null,
};
