import { Building2, HeartPulse, PersonStanding, Smile, Sparkles, Stethoscope } from 'lucide-react';
import { SectionHeading } from '@/components/section';

const SPECIALTIES = [
  {
    icon: Smile,
    title: 'Dental',
    body: 'Check-ups, cleanings and treatment plans that take several visits, with every bill on the patient’s file.',
  },
  {
    icon: PersonStanding,
    title: 'Physiotherapy',
    body: 'Assessments and regular sessions booked in seconds, with each patient’s plan and next visit at hand.',
  },
  {
    icon: Stethoscope,
    title: 'Family medicine',
    body: 'Consultations, walk-ins and follow-ups, with next-visit dates and a clear billing record.',
  },
  {
    icon: Sparkles,
    title: 'Skin and aesthetics',
    body: 'Treatments booked from your Instagram bio, starting from a ready-made list of 126 treatments.',
  },
  {
    icon: HeartPulse,
    title: 'Specialist clinics',
    body: 'Eye, ENT, gynae, paediatrics and more: consultations, procedures and follow-ups in one calendar.',
  },
  {
    icon: Building2,
    title: 'Multi-specialty',
    body: 'Several departments under one roof or across branches, with one price list and one patient list.',
  },
];

export function Specialties() {
  return (
    <section aria-labelledby="specialties-title" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Who it’s for"
          title="Made for your kind of clinic"
          titleId="specialties-title"
          intro="If patients book, visit and pay at your clinic, it fits. Your services, prices, branches and team are set up your way."
        />
        <ul className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SPECIALTIES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
