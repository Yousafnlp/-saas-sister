import type { ReactNode } from 'react';
import { CalendarDays, Check, Inbox, Link2, Receipt, ShieldCheck } from 'lucide-react';
import { site } from '@/lib/site';
import { shots } from '@/lib/screenshots';
import { cn } from '@/lib/utils';
import { BrowserFrame, CONTENT_AREA, PhoneFrame, Shot } from '@/components/frames';
import { Eyebrow, SectionHeading } from '@/components/section';

const appUrl = (path: string) => `${site.demoClinic}.${site.domain}${path}`;
// Cropped shots render the full image wider than their box (box width / crop width).
const CROPPED_SIZES = '(min-width: 1024px) 680px, 120vw';

function FeatureRow({
  icon,
  eyebrow,
  title,
  body,
  bullets,
  media,
  flip = false,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  media: ReactNode;
  flip?: boolean;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 items-center gap-10 lg:gap-14',
        flip ? 'lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]' : 'lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]',
      )}
    >
      <div className={cn('max-w-xl', flip && 'lg:order-2')}>
        <Eyebrow icon={icon}>{eyebrow}</Eyebrow>
        <h3 className="mt-3 font-display text-3xl leading-[1.1] tracking-tight text-foreground sm:text-4xl">{title}</h3>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{body}</p>
        <ul className="mt-6 space-y-3">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex gap-3 text-[15px] leading-relaxed text-foreground">
              <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={cn(flip && 'lg:order-1')}>{media}</div>
    </div>
  );
}

/** The soft matte that every screenshot sits on. */
function Matte({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('relative isolate overflow-hidden rounded-3xl border border-border bg-surface p-3 sm:p-6', className)}>
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 -z-10 size-72 rounded-full bg-[radial-gradient(closest-side,var(--color-accent),transparent)]"
      />
      {children}
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="border-t border-border py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Features"
          title="Built around a real front desk"
          intro="The screens your team uses all day, made for the way clinics in Pakistan actually work."
        />

        <div className="mt-20 space-y-24 md:space-y-32">
          <FeatureRow
            icon={<Link2 aria-hidden="true" />}
            eyebrow="Online booking"
            title="A booking link patients can use any time"
            body="Share it on WhatsApp, in your Instagram bio or on your Google profile. Patients pick a service, a day and a free time, then confirm with their name and number. No app to download and no account to make."
            bullets={[
              'A link for each branch, with its own opening hours, days and slot length',
              'You decide how many patients each slot takes. Full slots grey out by themselves',
              "Two people can't take the last place at the same moment, or book the same branch twice in a day",
              'Bookings land in your calendar straight away, tagged Online',
            ]}
            media={
              <Matte className="px-6 pb-0 pt-8 sm:px-12 sm:pt-12">
                <div className="mx-auto grid max-w-md grid-cols-2 items-start gap-4 sm:gap-6">
                  <PhoneFrame className="translate-y-6">
                    <Shot shot={shots.booking} alt="Booking page with a dental check-up picked, tomorrow selected and open time slots" sizes="(min-width: 640px) 210px, 42vw" />
                  </PhoneFrame>
                  <PhoneFrame className="-mb-10">
                    <Shot shot={shots.bookingConfirmed} alt="Booking confirmation showing the service, date, time and branch address" sizes="(min-width: 640px) 210px, 42vw" />
                  </PhoneFrame>
                </div>
              </Matte>
            }
          />

          <FeatureRow
            flip
            icon={<CalendarDays aria-hidden="true" />}
            eyebrow="Appointments"
            title="The whole month on one screen"
            body="Every visit, booked by your team or online, in a list or a month calendar. Colours show what's coming, what's done and what still needs updating."
            bullets={[
              'Upcoming, completed and cancelled visits, plus ones that passed without being marked',
              'Open a day to see numbers, services and notes, and change a status right there',
              'Filter by branch, or book straight into any day',
              'Mark a visit Completed and the patient record is created for you',
            ]}
            media={
              <Matte>
                <BrowserFrame url={appUrl('/appointments?view=calendar')}>
                  <Shot shot={shots.calendar} alt="Month calendar of appointments, colour-coded by status, with monthly totals above" sizes={CROPPED_SIZES} crop={CONTENT_AREA} />
                </BrowserFrame>
              </Matte>
            }
          />

          <FeatureRow
            icon={<Inbox aria-hidden="true" />}
            eyebrow="CRM leads"
            title="Every enquiry becomes a lead you can follow up"
            body="Log enquiries from WhatsApp, Instagram and Google with their city and category, so nobody slips through on a busy day."
            bullets={[
              'Search by name or number, and filter by category',
              'Book an appointment from a lead in one click, with name and number filled in',
              'When they come in, the lead is marked as a patient on its own',
            ]}
            media={
              <Matte>
                <BrowserFrame url={appUrl('/crm-leads')}>
                  <Shot shot={shots.leads} alt="CRM leads list with names, phone numbers, sources, cities and categories" sizes={CROPPED_SIZES} crop={CONTENT_AREA} />
                </BrowserFrame>
              </Matte>
            }
          />

          <FeatureRow
            flip
            icon={<Receipt aria-hidden="true" />}
            eyebrow="Billing and receipts"
            title="Bills in seconds, receipts that print"
            body="Build a bill from your price list, change a price, add a discount and record how they paid. Billed, collected and outstanding totals stay up to date."
            bullets={[
              'Cash, card, bank transfer or Easypaisa/JazzCash, including part payments',
              'Invoice numbers count up on their own: INV-2026-00001, 00002 and so on',
              'Print a clean receipt on any 80 mm thermal printer',
              "Every bill shows on the patient's profile",
            ]}
            media={
              <Matte className="pb-14 sm:pb-16">
                <BrowserFrame url={appUrl('/billing')} className="sm:mr-16">
                  <Shot shot={shots.billing} alt="Billing page with totals billed, collected and outstanding, and a list of invoices" sizes={CROPPED_SIZES} crop={CONTENT_AREA} />
                </BrowserFrame>
                <div className="absolute bottom-5 right-5 w-[34%] max-w-[190px] rotate-2 overflow-hidden rounded-md shadow-frame ring-1 ring-black/10 sm:bottom-8 sm:right-8">
                  <Shot shot={shots.receipt} alt="Printed 80 mm receipt with services, discount, amount paid and balance due" sizes="190px" />
                </div>
              </Matte>
            }
          />

          <FeatureRow
            icon={<ShieldCheck aria-hidden="true" />}
            eyebrow="Team and permissions"
            title="Everyone sees exactly what they should"
            body="Give your receptionist the front desk, your doctors their appointments and patients, and keep salaries to yourself."
            bullets={[
              'Start with Admin, Manager and Staff, or make roles like Receptionist or Doctor',
              'Tick which sections each role can open',
              'Invite staff with a link you can send on WhatsApp. It works once and expires after 7 days',
              "Switch off someone's access in one click",
            ]}
            media={
              <Matte>
                <BrowserFrame url={appUrl('/roles')}>
                  <Shot shot={shots.roles} alt="Roles and permissions grid with Admin, Manager, Staff, Receptionist and Doctor" sizes={CROPPED_SIZES} crop={CONTENT_AREA} />
                </BrowserFrame>
              </Matte>
            }
          />
        </div>
      </div>
    </section>
  );
}
