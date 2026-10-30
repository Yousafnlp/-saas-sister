import type { Metadata } from 'next';
import BookingBranchList from '@/components/pages/booking/branch-list';

export const metadata: Metadata = {
  title: 'Book an appointment · d.Aesthetics',
  description: 'Book your d.Aesthetics appointment online.',
};

export default function BookPage() {
  return <BookingBranchList />;
}
