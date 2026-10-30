'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { addDays, format } from 'date-fns';
import { AlertCircle, CalendarCheck2, CheckCircle2, ChevronDown, Clock, MapPin, Phone, Search, Sparkles } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Branch } from '@/lib/branches';
import { WEEKDAY_OPTIONS } from '@/lib/select-options';
import { formatServicePrice, groupByCategory } from '@/components/pages/services/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookingShell } from './shell';

type PublicBranch = Omit<Branch, 'slotCapacity' | 'bookingEnabled' | 'isActive'>;

interface PublicService {
  id: string;
  name: string;
  category: string;
  price: number;
  note: string;
}

interface BookingPageData {
  branch: PublicBranch;
  services: PublicService[];
  today: string;
  bookingWindowDays: number;
}

interface Availability {
  date: string;
  open: boolean;
  slots: { time: string; available: boolean }[];
}

interface Confirmation {
  name: string;
  date: string;
  time: string;
  treatment: string;
  branch: PublicBranch;
}

const toDate = (value: string) => new Date(`${value}T00:00:00`);
const formatTime = (time: string) => format(new Date(`2000-01-01T${time}`), 'h:mm a');
const formatLongDate = (value: string) => format(toDate(value), 'EEEE, d MMMM');

function FormError({ message }: { message: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [message]);

  return (
    <div
      ref={ref}
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      {message}
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border pt-5 first:border-t-0 first:pt-0">
      <h2 className="mb-3 flex items-center gap-2.5 text-base font-semibold text-foreground">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
          {number}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<BookingPageData | null>(null);
  const [loadError, setLoadError] = useState('');

  const [service, setService] = useState<PublicService | null>(null);
  const [showServices, setShowServices] = useState(false);
  const [serviceQuery, setServiceQuery] = useState('');
  const [date, setDate] = useState('');
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Shown inline above the button: a toast on a phone would cover the button the client needs to tap next.
  const [formError, setFormError] = useState('');
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  useEffect(() => {
    api
      .get<{ data: BookingPageData }>(`/public/branches/${slug}`)
      .then((res) => setPage(res.data))
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : 'Could not load the booking page.'));
  }, [slug]);

  const loadSlots = (day: string) => {
    setSlotsLoading(true);
    return api
      .get<{ data: Availability }>(`/public/branches/${slug}/availability?date=${day}`)
      .then((res) => {
        setAvailability(res.data);
        return res.data;
      })
      .catch(() => {
        setAvailability(null);
        return null;
      })
      .finally(() => setSlotsLoading(false));
  };

  useEffect(() => {
    setTime('');
    setFormError('');
    setAvailability(null);
    if (date) loadSlots(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const serviceGroups = useMemo(() => {
    const term = serviceQuery.trim().toLowerCase();
    const services = page?.services ?? [];
    return groupByCategory(
      term
        ? services.filter((s) => s.name.toLowerCase().includes(term) || s.category.toLowerCase().includes(term))
        : services,
    );
  }, [page, serviceQuery]);

  const disabledDays = useMemo(() => {
    if (!page) return [];
    const closedDays = WEEKDAY_OPTIONS.flatMap((day, index) => (page.branch.workingDays.includes(day) ? [] : [index]));
    return [
      { before: toDate(page.today) },
      { after: addDays(toDate(page.today), page.bookingWindowDays) },
      { dayOfWeek: closedDays },
    ];
  }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      setFormError('Please pick a day and a time.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);
    try {
      const res = await api.post<{ data: Confirmation }>(`/public/branches/${slug}/bookings`, {
        name,
        number,
        date,
        time,
        notes,
        serviceId: service?.id ?? '',
      });
      setConfirmation(res.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Booking failed. Please check your connection and try again.');
      if (err instanceof ApiError && err.status === 409) {
        // Ask the client for a new time only if theirs was just taken; other refusals keep their choice.
        const fresh = await loadSlots(date);
        if (!fresh?.slots.some((slot) => slot.time === time && slot.available)) setTime('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setFormError('');
    setConfirmation(null);
    setService(null);
    setDate('');
    setTime('');
    setNotes('');
  };

  if (loadError) {
    return (
      <BookingShell>
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <p className="font-medium text-foreground">{loadError}</p>
          <Link href="/book" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
            See all branches
          </Link>
        </div>
      </BookingShell>
    );
  }

  if (!page) {
    return (
      <BookingShell>
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading...</div>
      </BookingShell>
    );
  }

  const { branch } = page;

  if (confirmation) {
    return (
      <BookingShell>
        <div className="rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-foreground">You’re booked, {confirmation.name.split(' ')[0]}!</h1>
          <p className="mt-1 text-sm text-muted-foreground">The clinic will contact you on {number} to confirm.</p>

          <dl className="mt-6 space-y-3 rounded-xl bg-muted/50 p-4 text-left text-sm">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <dd className="font-medium text-foreground">{confirmation.treatment || 'Consultation'}</dd>
            </div>
            <div className="flex items-start gap-3">
              <CalendarCheck2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <dd className="font-medium text-foreground">
                {formatLongDate(confirmation.date)} at {formatTime(confirmation.time)}
              </dd>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <dd className="text-foreground">
                {confirmation.branch.name}
                {confirmation.branch.address && <span className="block text-muted-foreground">{confirmation.branch.address}</span>}
              </dd>
            </div>
          </dl>

          <Button variant="outline" className="mt-6" onClick={resetBooking}>
            Book another appointment
          </Button>
        </div>
      </BookingShell>
    );
  }

  const openTimes = availability?.slots.filter((slot) => slot.available).length ?? 0;

  return (
    <BookingShell>
      <div className="rounded-2xl border border-border bg-card">
        {/* Branch details */}
        <div className="border-b border-border p-5 sm:p-6">
          <h1 className="text-xl font-bold text-foreground">Book at {branch.name}</h1>
          <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {(branch.address || branch.city) && (
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" /> {branch.address || branch.city}
              </p>
            )}
            <p className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0" />
              {formatTime(branch.openingTime)} – {formatTime(branch.closingTime)} · {branch.workingDays.join(', ')}
            </p>
            {branch.phone && (
              <a href={`tel:${branch.phone}`} className="flex w-fit items-start gap-2 hover:text-foreground">
                <Phone className="mt-0.5 size-4 shrink-0" /> {branch.phone}
              </a>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 p-5 sm:p-6">
          <Step number={1} title="What would you like?">
            <button
              type="button"
              onClick={() => setShowServices(true)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border-2 border-input px-4 py-3 text-left transition-colors hover:border-primary/50"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium text-foreground">{service?.name ?? 'Consultation'}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {service ? `${service.category} · ${formatServicePrice(service.price)}` : 'Not sure yet? A consultant will help you choose.'}
                </span>
              </span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            </button>
          </Step>

          <Step number={2} title="Pick a day">
            <div className="flex justify-center overflow-hidden rounded-xl border border-border">
              <Calendar
                mode="single"
                selected={date ? toDate(date) : undefined}
                onSelect={(day) => setDate(day ? format(day, 'yyyy-MM-dd') : '')}
                disabled={disabledDays}
                defaultMonth={toDate(page.today)}
                startMonth={toDate(page.today)}
                endMonth={addDays(toDate(page.today), page.bookingWindowDays)}
                weekStartsOn={1}
                // Day cells shrink to fit narrow phones (100vw minus page, card and calendar padding), up to 40px.
                className="bg-transparent [--cell-size:min(2.5rem,calc((100vw-6.5rem)/7))]"
              />
            </div>
          </Step>

          {date && (
            <Step number={3} title={`Pick a time · ${formatLongDate(date)}`}>
              {slotsLoading ? (
                <p className="text-sm text-muted-foreground">Checking available times...</p>
              ) : !availability || !availability.open || openTimes === 0 ? (
                <p className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
                  No times left on this day. Please pick another day.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {availability.slots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => {
                        setTime(slot.time);
                        setFormError('');
                      }}
                      aria-pressed={time === slot.time}
                      className={cn(
                        'rounded-lg border-2 px-2 py-2.5 text-sm font-medium tabular-nums transition-colors',
                        time === slot.time
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input text-foreground hover:border-primary/50',
                        'disabled:cursor-not-allowed disabled:border-transparent disabled:bg-muted/60 disabled:text-muted-foreground/60 disabled:line-through',
                      )}
                    >
                      {formatTime(slot.time)}
                    </button>
                  ))}
                </div>
              )}
              {/* e.g. the slot was just taken: the details step is hidden until a new time is picked. */}
              {formError && !time && (
                <div className="mt-3">
                  <FormError message={formError} />
                </div>
              )}
            </Step>
          )}

          {time && (
            <Step number={4} title="Your details">
              <div className="space-y-4">
                <div>
                  <label htmlFor="booking-name" className="mb-1.5 block text-sm font-medium text-foreground">
                    Full name
                  </label>
                  <Input
                    id="booking-name"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setFormError('');
                    }}
                    className="h-11"
                  />
                </div>
                <div>
                  <label htmlFor="booking-number" className="mb-1.5 block text-sm font-medium text-foreground">
                    Phone (WhatsApp)
                  </label>
                  <Input
                    id="booking-number"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={number}
                    onChange={(e) => {
                      setNumber(e.target.value);
                      setFormError('');
                    }}
                    placeholder="0300-1234567"
                    className="h-11"
                  />
                </div>
                <div>
                  <label htmlFor="booking-notes" className="mb-1.5 block text-sm font-medium text-foreground">
                    Anything we should know? <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <Textarea
                    id="booking-notes"
                    rows={3}
                    maxLength={500}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="rounded-xl bg-primary/5 p-4 text-sm">
                  <p className="font-medium text-foreground">{service?.name ?? 'Consultation'}</p>
                  <p className="text-muted-foreground">
                    {formatLongDate(date)} at {formatTime(time)} · {branch.name}
                  </p>
                </div>

                {formError && <FormError message={formError} />}

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Booking...' : 'Confirm booking'}
                </Button>
              </div>
            </Step>
          )}
        </form>
      </div>

      <Dialog open={showServices} onOpenChange={setShowServices}>
        <DialogContent className="flex h-[85dvh] max-h-[40rem] flex-col gap-3 p-4 sm:max-w-lg sm:p-6">
          <DialogHeader>
            <DialogTitle>Choose a treatment</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search treatments..."
              value={serviceQuery}
              onChange={(e) => setServiceQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="-mx-2 min-h-0 flex-1 overflow-y-auto overscroll-contain px-2">
            <div className="space-y-4 pb-2">
              {!serviceQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setService(null);
                    setShowServices(false);
                  }}
                  className="w-full rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 text-left"
                >
                  <span className="block text-sm font-medium text-foreground">Consultation</span>
                  <span className="block text-xs text-muted-foreground">Not sure yet? A consultant will help you choose.</span>
                </button>
              )}
              {serviceGroups.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">No treatments match your search.</p>
              )}
              {serviceGroups.map((group) => (
                <div key={group.category}>
                  <h3 className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.category}
                  </h3>
                  <div className="space-y-1">
                    {group.services.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setService(item);
                          setShowServices(false);
                          setServiceQuery('');
                        }}
                        className={cn(
                          'flex w-full items-center justify-between gap-3 rounded-lg border px-2.5 py-2 text-left transition-colors hover:bg-muted/60',
                          service?.id === item.id ? 'border-primary bg-primary/5' : 'border-transparent',
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-foreground">{item.name}</span>
                          {item.note && <span className="block truncate text-xs text-muted-foreground">{item.note}</span>}
                        </span>
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                          {formatServicePrice(item.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </BookingShell>
  );
}
