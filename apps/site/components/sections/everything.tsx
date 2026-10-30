import { Banknote, Building2, LayoutDashboard, Moon, Smartphone, Tags, UserRound, Users, Wallet } from 'lucide-react';
import { SectionHeading } from '@/components/section';

const ITEMS = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    body: "Today's appointments, this month's billing, unpaid bills and new leads the moment you sign in.",
  },
  {
    icon: UserRound,
    title: 'Patient records',
    body: 'Concerns, treatment plans, history and next visit, with every bill on the same page.',
  },
  {
    icon: Tags,
    title: 'Services and prices',
    body: 'Your services in categories, with prices, and a choice of which ones patients can book online.',
  },
  {
    icon: Building2,
    title: 'Branches',
    body: 'Opening hours, working days, slot length and capacity for each location.',
  },
  {
    icon: Users,
    title: 'Employees',
    body: 'Departments, salaries, timings, benefits and how each person is paid.',
  },
  {
    icon: Wallet,
    title: 'Expenses',
    body: 'Staff log spending by category and city. Approved and pending totals stay separate.',
  },
  {
    icon: Banknote,
    title: 'Payroll',
    body: 'Monthly salaries with bonuses and deductions. Net pay is worked out for you.',
  },
  {
    icon: Smartphone,
    title: 'Any device',
    body: 'Phones, tablets and computers, in the browser. Nothing to install.',
  },
  {
    icon: Moon,
    title: 'Light and dark mode',
    body: 'Easy on the eyes, from the morning rush to closing time.',
  },
];

export function Everything() {
  return (
    <section className="border-t border-border bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="And the back office"
          title="Everything behind the front desk, too"
          intro="Every plan includes all of it. No add-ons to buy later."
        />
        <ul className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="bg-card p-7">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
