import { Ban, CalendarCheck2, Clock, KeyRound, LockKeyhole, UserX } from 'lucide-react';
import { site } from '@/lib/site';

const SAFEGUARDS = [
  { icon: LockKeyhole, title: 'Private by role', body: 'Staff only open the sections their role allows. Salaries stay with the people you choose.' },
  { icon: KeyRound, title: 'Safe invites', body: 'New staff join through a single-use link that expires after 7 days.' },
  { icon: Ban, title: 'Sign-in protection', body: 'After repeated wrong passwords, further attempts are paused for 15 minutes.' },
  { icon: CalendarCheck2, title: 'No overbooking', body: 'Slot limits are enforced by the database, even when two patients confirm at once.' },
  { icon: UserX, title: 'No lock-outs', body: "Admins can't remove or demote themselves, so the clinic is never left without one." },
  { icon: Clock, title: 'Your clinic’s clock', body: '“Today” and “now” follow your clinic’s time zone, wherever the server runs.' },
];

export function Trust() {
  return (
    <section aria-labelledby="trust-title" className="bg-band py-24 text-band-foreground md:py-32">
      <div className="mx-auto grid grid-cols-1 max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
        <div>
          <p className="text-sm font-semibold text-band-muted">Safe by design</p>
          <h2 id="trust-title" className="mt-3 font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl">
            Built inside a working clinic
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-band-muted">
            {site.name} started as the in-house system of a busy clinic in Pakistan. Every screen was shaped at a real
            front desk: WhatsApp enquiries, walk-ins, Saturday rushes and month-end payroll.
          </p>
        </div>
        <ul className="grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2">
          {SAFEGUARDS.map(({ icon: Icon, title, body }) => (
            <li key={title}>
              <span className="flex size-10 items-center justify-center rounded-xl bg-band-foreground/10 text-band-foreground">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-band-muted">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
