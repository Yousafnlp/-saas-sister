import { ChevronDown } from 'lucide-react';
import { site } from '@/lib/site';
import { SectionHeading } from '@/components/section';

const FAQS = [
  {
    q: 'Is it only for one kind of clinic?',
    a: 'No. It works for dental, physiotherapy, family medicine, skin and specialist clinics, and anywhere else patients book, visit and pay. Your services, prices, branches and roles are your own.',
  },
  {
    q: 'Do patients need to download an app?',
    a: 'No. Patients book from a normal web page: a link you share on WhatsApp, in your Instagram bio or on your Google profile. They don’t need an account either, just their name and phone number.',
  },
  {
    q: 'Can my staff use it on their phones?',
    a: 'Yes. It runs in the browser on phones, tablets and computers. On a phone the menu slides out from the side and tables show the most important columns first.',
  },
  {
    q: 'We have more than one branch. Does that work?',
    a: 'Yes. Each branch gets its own booking link, opening hours, working days, slot length and number of patients per slot, and you can pause online booking for one branch without affecting the others. Appointments are labelled by branch, and patients, bills and staff are shared across all of them.',
  },
  {
    q: 'Can I control what each staff member sees?',
    a: 'Yes. Start with Admin, Manager and Staff, or create your own roles, such as Receptionist or Doctor, and tick exactly which sections each one can open. Salaries and payroll stay hidden unless you allow them.',
  },
  {
    q: 'Which payment methods can we record?',
    a: `Cash, card, bank transfer and Easypaisa/JazzCash, including part payments, with the balance due shown on the bill and the receipt. ${site.name} records how a patient paid; it doesn’t take card payments itself.`,
  },
  {
    q: 'Do we have to type in all our services?',
    a: 'You add your services once, in categories and with prices, and choose which ones patients can book online. Prices can change any time without affecting bills already made. Skin and aesthetics clinics can start from a ready-made list of 126 treatments.',
  },
  {
    q: 'Can we print receipts?',
    a: 'Yes. Every bill prints as a receipt sized for 80 mm thermal printers, with services, discount, amount paid, balance due and payment method.',
  },
  {
    q: 'How do we get started?',
    a: 'Book a demo. We’ll walk you through the app with your own way of working in mind, then help you add your branches, price list and team so you can start taking bookings.',
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-border bg-surface py-24 md:py-32">
      <div className="mx-auto grid grid-cols-1 max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <SectionHeading
          align="left"
          eyebrow="FAQ"
          title="Questions clinics ask us"
          intro="Something else on your mind? Ask us during the demo."
        />
        <div className="divide-y divide-border rounded-3xl border border-border bg-card">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group px-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-base font-semibold text-foreground">
                {q}
                <ChevronDown
                  className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="-mt-1 pb-5 text-[15px] leading-relaxed text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
