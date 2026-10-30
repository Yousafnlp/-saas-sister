import type { Metadata } from 'next';
import { CalendarCheck2, MessageCircle, Tags } from 'lucide-react';
import { site } from '@/lib/site';
import { DemoForm } from '@/components/demo-form';

export const metadata: Metadata = {
  title: 'Book a free demo',
  description: `See ${site.name} with your own clinic in mind: patient enquiries, online booking, billing and the back office.`,
};

const EXPECT = [
  {
    icon: MessageCircle,
    title: 'A 20-minute walkthrough',
    body: 'On a video call or WhatsApp, whichever suits you.',
  },
  {
    icon: CalendarCheck2,
    title: 'A day at your clinic',
    body: 'From the first WhatsApp message to the booking, the visit and the printed receipt.',
  },
  {
    icon: Tags,
    title: 'Your services and branches',
    body: 'Tell us what you offer and where, and we’ll show how it fits.',
  },
];

export default function DemoPage() {
  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(closest-side,var(--color-accent),transparent)]" />
        <div className="absolute right-[-12rem] top-[10rem] h-[28rem] w-[28rem] rounded-full bg-warm/30 blur-3xl" />
      </div>
      <div className="mx-auto grid grid-cols-1 max-w-6xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <p className="text-sm font-semibold text-primary">Free demo</p>
          <h1 className="mt-3 font-display text-5xl leading-[1.04] tracking-tight text-foreground sm:text-6xl">
            See {site.name} at work
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Tell us a little about your clinic and we’ll get in touch to set up a time. No commitment, no pushy sales.
          </p>
          <ul className="mt-10 space-y-7">
            {EXPECT.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-foreground">{title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <DemoForm />
      </div>
    </section>
  );
}
