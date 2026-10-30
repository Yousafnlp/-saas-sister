'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { ChevronDown, CircleCheck, Mail, MessageCircle } from 'lucide-react';
import { plans, site } from '@/lib/site';
import { cn, emailLink, whatsappLink } from '@/lib/utils';
import { buttonClasses } from './button';

const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Sialkot', 'Gujranwala', 'Peshawar', 'Other'];
const BRANCHES = ['1 branch', '2–3 branches', '4 or more branches'];
const CLINIC_TYPES = ['Dental', 'Physiotherapy', 'Family medicine / GP', 'Skin and aesthetics', 'Specialist clinic', 'Multi-specialty', 'Other'];

interface Fields {
  name: string;
  clinic: string;
  type: string;
  city: string;
  phone: string;
  branches: string;
  message: string;
}

type Errors = Partial<Record<keyof Fields, string>>;
type Channel = 'whatsapp' | 'email';

const EMPTY: Fields = { name: '', clinic: '', type: '', city: '', phone: '', branches: BRANCHES[0], message: '' };

// Listed in form order, so the first error is the first field on screen.
function validate(fields: Fields): Errors {
  const errors: Errors = {};
  if (!fields.name.trim()) errors.name = 'Please enter your name.';
  if (!fields.clinic.trim()) errors.clinic = 'Please enter your clinic’s name.';
  if (!fields.city) errors.city = 'Please choose your city.';
  const digits = fields.phone.replace(/\D/g, '').length;
  if (!fields.phone.trim()) errors.phone = 'Please enter a number we can reach you on.';
  else if (digits < 7 || digits > 15) errors.phone = 'Phone numbers have 7 to 15 digits, for example 0300 1234567.';
  return errors;
}

function composeMessage(fields: Fields, plan: string) {
  const details = [
    `Name: ${fields.name.trim()}`,
    `Clinic: ${fields.clinic.trim()}`,
    ...(fields.type ? [`Type: ${fields.type}`] : []),
    `City: ${fields.city}`,
    `Branches: ${fields.branches}`,
    ...(plan ? [`Plan: ${plan}`] : []),
    `Phone: ${fields.phone.trim()}`,
  ];
  const note = fields.message.trim();
  return [`Hi ${site.name}, I'd like a demo.`, details.join('\n'), ...(note ? [note] : [])].join('\n\n');
}

const inputClasses =
  'block h-11 w-full rounded-xl border bg-background px-3.5 text-base text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 sm:text-[15px]';

function Field({
  id,
  label,
  error,
  hint,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium text-foreground">
        {label}
        {optional && <span className="text-xs font-normal text-muted-foreground">Optional</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function DemoForm() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [triedToSend, setTriedToSend] = useState(false);
  const [sent, setSent] = useState<{ via: Channel; link: string } | null>(null);
  const [plan, setPlan] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  // Pricing buttons link here with ?plan=<id>.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('plan');
    setPlan(plans.find((p) => p.id === id)?.name ?? '');
  }, []);

  const canWhatsApp = Boolean(site.contact.whatsapp);
  const canEmail = Boolean(site.contact.email);
  const primary: Channel | null = canWhatsApp ? 'whatsapp' : canEmail ? 'email' : null;

  const update = (key: keyof Fields) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next = { ...fields, [key]: event.target.value };
    setFields(next);
    if (triedToSend) setErrors(validate(next));
  };

  const send = (via: Channel) => {
    const found = validate(fields);
    setErrors(found);
    setTriedToSend(true);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    const text = composeMessage(fields, plan);
    const link = via === 'whatsapp' ? whatsappLink(text) : emailLink(`Demo request: ${fields.clinic.trim()}`, text);
    if (!link) return;
    if (via === 'whatsapp') window.open(link, '_blank', 'noopener,noreferrer');
    else window.location.href = link;
    setSent({ via, link });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (primary) send(primary);
  };

  const describedBy = (key: keyof Fields, hasHint = false) =>
    errors[key] ? `${key}-error` : hasHint ? `${key}-hint` : undefined;

  if (sent) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center sm:p-10" role="status">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CircleCheck className="size-7" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-2xl font-semibold text-foreground">Almost done, {fields.name.trim().split(' ')[0]}</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {sent.via === 'whatsapp'
            ? 'We’ve written the message for you in WhatsApp. Press send and we’ll reply to find a time that suits you.'
            : 'Your email app should open with the message ready. Send it and we’ll reply to find a time that suits you.'}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={sent.link}
            {...(sent.via === 'whatsapp' && { target: '_blank', rel: 'noopener noreferrer' })}
            className={buttonClasses()}
          >
            {sent.via === 'whatsapp' ? 'Open WhatsApp again' : 'Open email again'}
          </a>
          <button type="button" onClick={() => setSent(null)} className={buttonClasses({ variant: 'secondary' })}>
            Edit details
          </button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-foreground">Tell us about your clinic</h2>
      {plan && (
        <p className="mt-1 text-sm text-muted-foreground">
          You’re interested in the <span className="font-semibold text-foreground">{plan}</span> plan.
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field id="name" label="Your name" error={errors.name}>
          <input
            id="name"
            name="name"
            autoComplete="name"
            value={fields.name}
            onChange={update('name')}
            aria-required="true"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy('name')}
            className={cn(inputClasses, errors.name ? 'border-danger' : 'border-border')}
          />
        </Field>
        <Field id="clinic" label="Clinic name" error={errors.clinic}>
          <input
            id="clinic"
            name="clinic"
            autoComplete="organization"
            value={fields.clinic}
            onChange={update('clinic')}
            aria-required="true"
            aria-invalid={Boolean(errors.clinic)}
            aria-describedby={describedBy('clinic')}
            className={cn(inputClasses, errors.clinic ? 'border-danger' : 'border-border')}
          />
        </Field>
        <Field id="type" label="Type of clinic" optional>
          <div className="relative">
            <select
              id="type"
              name="type"
              value={fields.type}
              onChange={update('type')}
              className={cn(inputClasses, 'cursor-pointer appearance-none border-border pr-10', !fields.type && 'text-muted-foreground')}
            >
              <option value="">Choose one</option>
              {CLINIC_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          </div>
        </Field>
        <Field id="city" label="City" error={errors.city}>
          <div className="relative">
            <select
              id="city"
              name="city"
              value={fields.city}
              onChange={update('city')}
              aria-required="true"
              aria-invalid={Boolean(errors.city)}
              aria-describedby={describedBy('city')}
              className={cn(inputClasses, 'cursor-pointer appearance-none pr-10', errors.city ? 'border-danger' : 'border-border', !fields.city && 'text-muted-foreground')}
            >
              <option value="" disabled>
                Choose a city
              </option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          </div>
        </Field>
        <Field id="phone" label="WhatsApp number" error={errors.phone} hint="We’ll only use it to arrange your demo.">
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0300 1234567"
            value={fields.phone}
            onChange={update('phone')}
            aria-required="true"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy('phone', true)}
            className={cn(inputClasses, errors.phone ? 'border-danger' : 'border-border')}
          />
        </Field>
        <Field id="branches" label="Branches">
          <div className="relative">
            <select
              id="branches"
              name="branches"
              value={fields.branches}
              onChange={update('branches')}
              className={cn(inputClasses, 'cursor-pointer appearance-none border-border pr-10')}
            >
              {BRANCHES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          </div>
        </Field>
        <div className="sm:col-span-2">
          <Field id="message" label="Anything we should know?" optional>
            <textarea
              id="message"
              name="message"
              rows={3}
              placeholder="For example: we take bookings on WhatsApp and want online booking for our Lahore branch."
              value={fields.message}
              onChange={update('message')}
              className={cn(inputClasses, 'h-auto resize-y border-border py-2.5')}
            />
          </Field>
        </div>
      </div>

      {primary ? (
        <>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button type="submit" className={buttonClasses({ size: 'lg', className: 'sm:flex-1' })}>
              {primary === 'whatsapp' ? <MessageCircle aria-hidden="true" /> : <Mail aria-hidden="true" />}
              {primary === 'whatsapp' ? 'Continue on WhatsApp' : 'Send by email'}
            </button>
            {primary === 'whatsapp' && canEmail && (
              <button type="button" onClick={() => send('email')} className={buttonClasses({ size: 'lg', variant: 'secondary' })}>
                <Mail aria-hidden="true" /> Email instead
              </button>
            )}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            This opens {primary === 'whatsapp' ? 'WhatsApp' : 'your email app'} with your details written out, ready to
            send.
          </p>
        </>
      ) : (
        <p role="alert" className="mt-7 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-foreground">
          {process.env.NODE_ENV === 'development'
            ? 'Demo requests need somewhere to go: set NEXT_PUBLIC_WHATSAPP_NUMBER and/or NEXT_PUBLIC_CONTACT_EMAIL (see apps/site/.env.example).'
            : 'Online demo requests aren’t available right now. Please try again later.'}
        </p>
      )}
    </form>
  );
}
