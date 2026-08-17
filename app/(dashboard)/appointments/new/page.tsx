import { Suspense } from 'react';
import CreateAppointment from '@/components/pages/appointments/create';

export default function CreateAppointmentPage() {
  return (
    <Suspense fallback={null}>
      <CreateAppointment />
    </Suspense>
  );
}
