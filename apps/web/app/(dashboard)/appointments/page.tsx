import { Suspense } from 'react';
import Appointments from '@/components/pages/appointments';

export default function AppointmentsPage() {
  return (
    <Suspense fallback={null}>
      <Appointments />
    </Suspense>
  );
}
