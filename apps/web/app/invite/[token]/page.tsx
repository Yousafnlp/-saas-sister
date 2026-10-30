import type { Metadata } from 'next';
import AcceptInvite from '@/components/pages/invite';

export const metadata: Metadata = {
  title: 'Join d.Aesthetics',
};

export default function InvitePage() {
  return <AcceptInvite />;
}
