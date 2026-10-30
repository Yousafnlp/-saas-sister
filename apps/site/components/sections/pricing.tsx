'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { plans, YEARLY_MONTHS_CHARGED, type Plan } from '@/lib/site';
import { cn, formatRs } from '@/lib/utils';
import { ButtonLink } from '@/components/button';
import { SectionHeading } from '@/components/section';

type Billing = 'monthly' | 'yearly';

function PlanPrice({ plan, billing }: { plan: Plan; billing: Billing }) {
  if (plan.monthly === null || plan.yearly === null) {
    return (
      <>
        <p className="text-4xl font-bold tracking-tight text-foreground">Let’s talk</p>
        <p className="mt-2 text-xs text-muted-foreground">Pricing for your group of branches</p>
      </>
    );
  }
  const perMonth = billing === 'yearly' ? Math.round(plan.yearly / 12) : plan.monthly;
  return (
    <>
      <p className="flex items-baseline gap-1.5">
        <span className="text-4xl font-bold tabular-nums tracking-tight text-foreground">{formatRs(perMonth)}</span>
        <span className="text-sm text-muted-foreground">/ month</span>
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        {billing === 'yearly' ? `${formatRs(plan.yearly)} billed once a year` : 'Billed monthly'}
      </p>
    </>
  );
}

export function Pricing() {
  const [billing, setBilling] = useState<Billing>('monthly');
  const freeMonths = 12 - YEARLY_MONTHS_CHARGED;

  return (
    <section id="pricing" className="border-t border-border py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple pricing, in rupees"
          intro="Every plan includes every feature. Pick the one that fits the size of your clinic."
        />

        <div className="mt-10 flex justify-center">
          <div role="group" aria-label="Billing period" className="inline-flex rounded-xl border border-border bg-muted p-1">
            {(['monthly', 'yearly'] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={billing === option}
                onClick={() => setBilling(option)}
                className={cn(
                  'inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors',
                  billing === option ? 'bg-card text-foreground ring-1 ring-border' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {option === 'monthly' ? 'Monthly' : 'Yearly'}
                {option === 'yearly' && (
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs text-primary">{freeMonths} months free</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-12 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <li
              key={plan.id}
              className={cn(
                'relative flex h-full flex-col rounded-3xl border bg-card p-7',
                plan.highlighted ? 'border-primary ring-1 ring-primary' : 'border-border',
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <div className="mt-6">
                <PlanPrice plan={plan} billing={billing} />
              </div>
              <ButtonLink
                href={`/demo?plan=${plan.id}`}
                variant={plan.highlighted ? 'primary' : 'secondary'}
                className="mt-7"
              >
                {plan.monthly === null ? 'Talk to us' : 'Book a demo'}
              </ButtonLink>
              <ul className="mt-7 space-y-3 border-t border-border pt-6 text-sm">
                {plan.limits.map((item) => (
                  <li key={item} className="flex gap-3 font-semibold text-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
                {plan.features.map((item) => (
                  <li key={item} className="flex gap-3 text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Not sure which plan fits?{' '}
          <Link href="/demo" className="font-semibold text-primary underline-offset-4 hover:underline">
            Book a demo
          </Link>{' '}
          and we’ll help you choose.
        </p>
      </div>
    </section>
  );
}
