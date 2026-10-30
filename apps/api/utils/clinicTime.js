import { WEEKDAY_OPTIONS } from '@daesthetics/shared';

// The server runs in UTC (e.g. on Vercel); "today" and "now" for bookings must be the clinic's local time.
const TIMEZONE = process.env.CLINIC_TIMEZONE || 'Asia/Karachi';

export const DAY_MS = 24 * 60 * 60 * 1000;

export function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function fromMinutes(total) {
  const hours = String(Math.floor(total / 60)).padStart(2, '0');
  const minutes = String(total % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Current date (YYYY-MM-DD) and minutes past midnight at the clinic.
export function clinicNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date())
      .map(({ type, value }) => [type, value])
  );

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

// Appointment dates are stored as UTC midnight of the calendar day.
export function dayRange(date) {
  const start = new Date(`${date}T00:00:00.000Z`);
  return { $gte: start, $lt: new Date(start.getTime() + DAY_MS) };
}

export function weekdayOf(date) {
  return WEEKDAY_OPTIONS[new Date(`${date}T00:00:00.000Z`).getUTCDay()];
}

export function addDays(date, days) {
  return new Date(new Date(`${date}T00:00:00.000Z`).getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

// Start times of every bookable slot in a branch's day, e.g. ['10:00', '10:30', ...].
export function buildSlots({ openingTime, closingTime, slotMinutes }) {
  const slots = [];
  const close = toMinutes(closingTime);
  for (let start = toMinutes(openingTime); start + slotMinutes <= close; start += slotMinutes) {
    slots.push(fromMinutes(start));
  }
  return slots;
}
