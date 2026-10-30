import type { Metadata } from 'next';
import BookingPage from '@/components/pages/booking';

export const metadata: Metadata = {
  title: 'Book an appointment · d.Aesthetics',
  description: 'Pick a treatment, day and time, and book your d.Aesthetics appointment online.',
};

export default function BookBranchPage() {
  return <BookingPage />;
}
