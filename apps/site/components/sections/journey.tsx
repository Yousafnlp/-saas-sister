import type { ReactNode } from 'react';
import { CalendarPlus, CircleCheck, MessageCircle, Receipt, UserRoundCheck } from 'lucide-react';
import { Badge, SectionHeading } from '@/components/section';

interface Step {
  icon: typeof MessageCircle;
  label: string;
  title: string;
  body: string;
  preview: ReactNode;
}

// Each step ends with a miniature of what the app shows at that point.
const STEPS: Step[] = [
  {
    icon: MessageCircle,
    label: 'Lead',
    title: 'A message comes in',
    body: 'Add the enquiry to CRM Leads with where it came from, their city and a category.',
    preview: (
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">Ayesha Khan</p>
          <p className="truncate text-xs text-muted-foreground">WhatsApp · Lahore</p>
        </div>
        <Badge tone="info">Interested</Badge>
      </div>
    ),
  },
  {
    icon: CalendarPlus,
    label: 'Booking',
    title: 'They book a time',
    body: 'Book from the lead in one click, or let them book themselves from your booking link.',
    preview: (
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">Dental check-up</p>
          <p className="truncate text-xs text-muted-foreground">Sat · 4:30 PM</p>
        </div>
        <Badge tone="neutral">Online</Badge>
      </div>
    ),
  },
  {
    icon: UserRoundCheck,
    label: 'Visit',
    title: 'They come in',
    body: 'Mark the appointment Completed. Their patient record is created for you.',
    preview: (
      <div className="flex items-center gap-2.5">
        <CircleCheck className="size-5 shrink-0 text-success" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">Patient record created</p>
      </div>
    ),
  },
  {
    icon: Receipt,
    label: 'Invoice',
    title: 'They pay',
    body: 'Bill from your price list, take full or part payment, and print the receipt.',
    preview: (
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-xs text-muted-foreground">INV-2026-00142</p>
          <p className="text-sm font-semibold tabular-nums text-foreground">Rs 6,500</p>
        </div>
        <Badge tone="success">Paid</Badge>
      </div>
    ),
  },
];

export function Journey() {
  return (
    <section id="how-it-works" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="How it works"
          title="One journey, from enquiry to receipt"
          intro="The phone number ties it all together. Leads, appointments, patient records and bills stay linked, so you always know who someone is and what they owe."
        />

        <ol className="relative mt-16 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <span
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px bg-linear-to-r from-transparent via-primary/40 to-transparent lg:block"
          />
          {STEPS.map(({ icon: Icon, label, title, body, preview }, index) => (
            <li key={label} className="relative flex flex-col">
              <div className="flex items-center gap-3 lg:flex-col lg:text-center">
                <span className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-primary">
                  <Icon className="size-6" aria-hidden="true" />
                  <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                </span>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:mt-3">{label}</p>
              </div>
              <div className="mt-4 flex flex-1 flex-col rounded-2xl border border-border bg-card p-5">
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                <div className="mt-5 flex min-h-16 items-center rounded-xl border border-border bg-surface px-3 py-2.5 [&>*]:w-full">{preview}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
