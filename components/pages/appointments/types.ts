import { APPOINTMENT_SERVICE_OPTIONS, APPOINTMENT_STATUS_OPTIONS } from '@/lib/select-options';

export interface Appointment {
  id: string;
  leadId: string | null;
  name: string;
  number: string;
  service: string;
  date: string;
  time: string;
  status: string;
  notes: string;
}

export type AppointmentFormData = Omit<Appointment, 'id'>;

export const emptyAppointment: AppointmentFormData = {
  leadId: null,
  name: '',
  number: '',
  service: APPOINTMENT_SERVICE_OPTIONS[0],
  date: '',
  time: '',
  status: APPOINTMENT_STATUS_OPTIONS[0],
  notes: '',
};
