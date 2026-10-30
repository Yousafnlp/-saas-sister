import { ArrowRight, Check, Stethoscope } from 'lucide-react';
import { site } from '@/lib/site';
import { shots } from '@/lib/screenshots';
import { ButtonLink } from '@/components/button';
import { BrowserFrame, PhoneFrame, Shot } from '@/components/frames';

const POINTS = ['Works on phone, tablet and desktop', 'Online booking included', 'Priced in rupees'];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pb-20 md:pb-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-14rem] h-[40rem] w-[70rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--color-accent),transparent)]" />
        <div className="absolute right-[-12rem] top-[4rem] h-[30rem] w-[30rem] rounded-full bg-warm/45 blur-3xl" />
        <div className="absolute left-[-14rem] top-[22rem] h-[26rem] w-[26rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[56px_56px] opacity-50 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-14 text-center sm:px-6 md:pt-24">
        <p className="animate-rise inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur sm:text-sm">
          <Stethoscope className="size-3.5 text-primary" aria-hidden="true" />
          For dental, physio, skin and medical clinics
        </p>

        <h1 className="animate-rise mx-auto mt-6 max-w-4xl font-display text-[2.9rem] leading-[1.02] tracking-tight text-foreground [animation-delay:60ms] sm:text-6xl md:text-7xl lg:text-[5.25rem]">
          Every patient, from first message to <em className="text-primary">final invoice.</em>
        </h1>

        <p className="animate-rise mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground [animation-delay:120ms] md:text-xl">
          {site.name} puts your WhatsApp and Instagram enquiries, online bookings, patient records, billing and back
          office in one simple app, for one clinic or every branch.
        </p>

        <div className="animate-rise mt-9 flex flex-col items-stretch justify-center gap-3 [animation-delay:180ms] sm:flex-row sm:items-center">
          <ButtonLink href="/demo" size="lg">
            Book a free demo <ArrowRight aria-hidden="true" />
          </ButtonLink>
          <ButtonLink href="#how-it-works" variant="secondary" size="lg">
            See how it works
          </ButtonLink>
        </div>

        <ul className="animate-rise mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground [animation-delay:240ms]">
          {POINTS.map((point) => (
            <li key={point} className="flex items-center gap-2">
              <Check className="size-4 text-primary" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div className="animate-rise relative mx-auto mt-14 max-w-6xl px-4 [animation-delay:320ms] sm:px-6 md:mt-20">
        {/* Small screens get the app's own phone layout: a desktop screenshot would be unreadable. */}
        <div className="mx-auto grid max-w-sm grid-cols-2 items-start gap-4 md:hidden">
          <PhoneFrame>
            <Shot shot={shots.dashboardMobile} alt="The clinic dashboard on a phone" sizes="45vw" />
          </PhoneFrame>
          <PhoneFrame className="mt-12">
            <Shot shot={shots.booking} alt="The online booking page on a phone, with a service, day and time picked" sizes="45vw" />
          </PhoneFrame>
        </div>

        <div className="relative hidden md:block">
          <BrowserFrame url={`${site.demoClinic}.${site.domain}/dashboard`}>
            <Shot
              shot={shots.dashboard}
              alt="The clinic dashboard: today's appointments, billing for the month, outstanding payments, new leads and a revenue versus expenses chart"
              sizes="(min-width: 1152px) 1104px, calc(100vw - 32px)"
              preload
              className="dark:hidden"
            />
            <Shot
              shot={shots.dashboardDark}
              alt="The clinic dashboard in dark mode"
              sizes="(min-width: 1152px) 1104px, calc(100vw - 32px)"
              eager
              className="hidden dark:block"
            />
          </BrowserFrame>
          <div className="absolute -bottom-12 right-2 w-[21%] max-w-[232px] lg:-right-8">
            <PhoneFrame>
              <Shot
                shot={shots.booking}
                alt="The online booking page on a phone, with a service, day and time picked"
                sizes="232px"
                eager
              />
            </PhoneFrame>
          </div>
        </div>
      </div>
    </section>
  );
}
