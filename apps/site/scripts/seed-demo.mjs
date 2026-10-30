// Fills an EMPTY, throwaway database with a realistic multi-specialty demo clinic for the marketing screenshots.
// It uses the API's own models, so validation and hooks (invoice numbers, net salary) run exactly as in the app.
//
//   DEMO_MONGO_URI=mongodb://127.0.0.1:27077/clinic-demo node apps/site/scripts/seed-demo.mjs
//
// The connection string is read only from DEMO_MONGO_URI (never from apps/api/.env), and the script refuses to
// run against a database that already has users, so it can't be pointed at a real clinic by mistake.
// Dates are relative to "today" at the clinic, and the random choices are seeded, so reruns on the same day
// give identical data. The last line of output is JSON with the sign-in and the ids capture-screenshots.mjs needs.

import { normalizePermissions } from '@daesthetics/shared';
import { addDays, buildSlots, clinicNow, fromMinutes, toMinutes, weekdayOf } from '../../api/utils/clinicTime.js';
import Appointment from '../../api/models/Appointment.js';
import Bill from '../../api/models/Bill.js';
import Branch from '../../api/models/Branch.js';
import Client from '../../api/models/Client.js';
import Employee from '../../api/models/Employee.js';
import Expense from '../../api/models/Expense.js';
import Invite from '../../api/models/Invite.js';
import Lead from '../../api/models/Lead.js';
import Payroll from '../../api/models/Payroll.js';
import Role from '../../api/models/Role.js';
import Service from '../../api/models/Service.js';
import User from '../../api/models/User.js';

export const DEMO_ADMIN = { name: 'Sana Malik', email: 'sana.malik@example.com', password: 'demo-clinic-2026' };

// ---------- Seeded randomness

function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(20261030);
const int = (min, max) => min + Math.floor(random() * (max - min + 1));
const pick = (list) => list[Math.floor(random() * list.length)];
const chance = (p) => random() < p;
const roundTo = (value, step) => Math.round(value / step) * step;

function weighted(entries) {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let r = random() * total;
  for (const [value, weight] of entries) {
    r -= weight;
    if (r < 0) return value;
  }
  return entries[entries.length - 1][0];
}

// ---------- Clinic time

const { date: TODAY, minutes: NOW } = clinicNow();
const day = (date) => new Date(`${date}T00:00:00.000Z`);
// Pakistan has no daylight saving, so a fixed offset is exact.
const at = (date, minutes) => new Date(`${date}T${fromMinutes(minutes)}:00+05:00`);
const nowDate = at(TODAY, NOW);
// Anything that would be in the future is moved to just before now, a minute apart so lists keep a stable order.
let clamped = 0;
const notAfterNow = (date) => (date > nowDate ? new Date(nowDate.getTime() - (5 + clamped++) * 60 * 1000) : date);
const daysBetween = (from, to) => Math.round((day(to) - day(from)) / 86400000);
const isOpen = (date) => weekdayOf(date) !== 'Sun';

function monthKey(offset) {
  const [y, m] = TODAY.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1 + offset, 1)).toISOString().slice(0, 7);
}

const monthLabel = (key) =>
  new Date(`${key}-01T00:00:00.000Z`).toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

function openDaysOfMonth(key) {
  const days = [];
  for (let d = `${key}-01`; d.startsWith(key) && d <= TODAY; d = addDays(d, 1)) {
    if (isOpen(d)) days.push(d);
  }
  return days;
}

function nextOpenDay(from) {
  let d = addDays(from, 1);
  while (!isOpen(d)) d = addDays(d, 1);
  return d;
}

function previousOpenDay(from) {
  let d = addDays(from, -1);
  while (!isOpen(d)) d = addDays(d, -1);
  return d;
}

// ---------- Price list (a multi-specialty clinic)

const PRICE_LIST = [
  ['Consultations', [
    ['GP consultation', 2000, true],
    ['Specialist consultation', 3500, true],
    ['Follow-up visit', 1500, true],
    ['Online consultation', 2000, true, 'Video call on WhatsApp'],
  ]],
  ['Dental', [
    ['Dental check-up', 1500, true],
    ['Scaling & polishing', 5000, true],
    ['Composite filling', 6000, false, 'Per tooth'],
    ['Root canal treatment', 18000, false, 'Per tooth, 2–3 visits'],
    ['Tooth extraction', 4000, false],
    ['Teeth whitening', 25000, true, 'In-clinic, one visit'],
    ['OPG X-ray', 2500, false],
    ['Braces consultation', 2000, true],
  ]],
  ['Physiotherapy', [
    ['Physio assessment', 3000, true],
    ['Physiotherapy session', 2500, true, '45 minutes'],
    ['Dry needling', 3500, false],
    ['Sports injury rehab', 3500, false],
    ['Home visit session', 4500, false, 'Lahore and Islamabad'],
  ]],
  ['Skin & Laser', [
    ['Dermatology consultation', 3000, true],
    ['HydraFacial', 6000, true],
    ['Chemical peel', 6000, false],
    ['Laser hair removal - face', 5000, true, 'Per session'],
    ['Acne scar treatment', 9000, false],
    ['PRP for hair', 8000, false],
  ]],
  ['Lab & Diagnostics', [
    ['CBC', 900, false],
    ['HbA1c', 1800, false],
    ['Lipid profile', 2200, false],
    ['ECG', 1500, false],
    ['Vitamin D', 3000, false],
  ]],
];

const SERVICE = new Map(
  PRICE_LIST.flatMap(([category, services]) =>
    services.map(([name, price, showOnline, note = '']) => [name, { name, category, price, showOnline, note }])
  )
);

function resolveItems(specs) {
  return specs.map((spec) => {
    const [name, quantity] = Array.isArray(spec) ? spec : [spec, 1];
    const s = SERVICE.get(name);
    if (!s) throw new Error(`"${name}" is not on the demo price list`);
    return { name, category: s.category, price: s.price, quantity };
  });
}

const maybe = (p, ...specs) => (chance(p) ? specs : []);
const labs = () => [...maybe(0.3, 'CBC'), ...maybe(0.25, 'HbA1c'), ...maybe(0.2, 'Lipid profile'), ...maybe(0.2, 'Vitamin D'), ...maybe(0.1, 'ECG')];

const BACK_AND_JOINTS = ['Lower back pain', 'Frozen shoulder', 'Neck pain from desk work', 'Knee rehab after ACL surgery'];

// What brings people in. `items` builds the bill when the visit is done; `main` is what the appointment shows.
const VISITS = [
  { main: 'Dental check-up', weight: 8, service: 'Consultation', items: () => ['Dental check-up', ...maybe(0.4, 'OPG X-ray')], concerns: ['Routine dental check-up', 'Tooth sensitivity'] },
  { main: 'Scaling & polishing', weight: 7, service: 'Procedure', items: () => ['Scaling & polishing', ...maybe(0.3, 'Dental check-up')], concerns: ['Bleeding gums', 'Routine dental check-up'] },
  { main: 'Composite filling', weight: 6, service: 'Procedure', items: () => [['Composite filling', int(1, 2)], ...maybe(0.35, 'OPG X-ray')], concerns: ['Tooth sensitivity', 'Toothache'] },
  { main: 'Root canal treatment', weight: 3, service: 'Procedure', items: () => ['Root canal treatment', 'OPG X-ray'], concerns: ['Toothache, lower left molar'] },
  { main: 'Tooth extraction', weight: 2, service: 'Procedure', items: () => ['Tooth extraction', ...maybe(0.5, 'OPG X-ray')], concerns: ['Wisdom tooth pain'] },
  { main: 'Teeth whitening', weight: 1.5, service: 'Procedure', items: () => ['Teeth whitening', ...maybe(0.5, 'Scaling & polishing')], concerns: ['Stained teeth'] },
  { main: 'Braces consultation', weight: 1.5, service: 'Consultation', items: () => ['Braces consultation', 'OPG X-ray'], concerns: ['Braces enquiry'] },
  { main: 'Physio assessment', weight: 5, service: 'Consultation', items: () => ['Physio assessment'], concerns: BACK_AND_JOINTS },
  { main: 'Physiotherapy session', weight: 10, service: 'Follow-up', items: () => [['Physiotherapy session', pick([1, 1, 1, 4, 8])]], concerns: BACK_AND_JOINTS },
  { main: 'Dry needling', weight: 3, service: 'Procedure', items: () => ['Physiotherapy session', 'Dry needling'], concerns: ['Frozen shoulder', 'Neck pain from desk work'] },
  { main: 'Sports injury rehab', weight: 3, service: 'Procedure', items: () => ['Sports injury rehab'], concerns: ['Knee rehab after ACL surgery', 'Sports ankle sprain'] },
  { main: 'Home visit session', weight: 1, service: 'Follow-up', items: () => ['Home visit session'], concerns: ['Mobility after hip surgery'] },
  { main: 'GP consultation', weight: 9, service: 'Consultation', items: () => ['GP consultation', ...labs()], concerns: ['Fever and fatigue', 'Annual health check', 'High blood pressure', 'Vitamin D deficiency'] },
  { main: 'Specialist consultation', weight: 3, service: 'Consultation', items: () => ['Specialist consultation', ...maybe(0.3, 'ECG')], concerns: ['High blood pressure', 'Thyroid follow-up'] },
  { main: 'Follow-up visit', weight: 5, service: 'Follow-up', items: () => ['Follow-up visit', ...maybe(0.4, 'HbA1c')], concerns: ['Diabetes follow-up', 'High blood pressure'] },
  { main: 'Online consultation', weight: 2, service: 'Consultation', items: () => ['Online consultation'], concerns: ['Fever and fatigue', 'Diabetes follow-up'] },
  { main: 'Dermatology consultation', weight: 4, service: 'Consultation', items: () => ['Dermatology consultation'], concerns: ['Eczema flare-up', 'Acne scars', 'Pigmentation', 'Hair fall'] },
  { main: 'HydraFacial', weight: 4, service: 'Procedure', items: () => ['HydraFacial'], concerns: ['Dull skin'] },
  { main: 'Chemical peel', weight: 2, service: 'Procedure', items: () => ['Chemical peel'], concerns: ['Pigmentation'] },
  { main: 'Laser hair removal - face', weight: 3, service: 'Procedure', items: () => ['Laser hair removal - face'], concerns: ['Unwanted facial hair'] },
  { main: 'Acne scar treatment', weight: 2, service: 'Procedure', items: () => ['Acne scar treatment', ...maybe(0.3, 'Dermatology consultation')], concerns: ['Acne scars'] },
  { main: 'PRP for hair', weight: 1.5, service: 'Procedure', items: () => ['PRP for hair'], concerns: ['Hair fall'] },
];
const ONLINE_VISITS = VISITS.filter((v) => SERVICE.get(v.main).showOnline);
const pickVisit = (online = false) => weighted((online ? ONLINE_VISITS : VISITS).map((v) => [v, v.weight]));

// Courses paid up front, which top this month up to its target.
const PACKAGES = [
  [['Physiotherapy session', 8]],
  [['Physiotherapy session', 10], 'Physio assessment'],
  ['Root canal treatment', 'OPG X-ray'],
  ['Teeth whitening', 'Scaling & polishing'],
  [['Acne scar treatment', 3]],
  [['Sports injury rehab', 6]],
  [['PRP for hair', 3]],
];

const PLANS = {
  'Routine dental check-up': 'Check-up and cleaning every 6 months',
  'Tooth sensitivity': 'Desensitising treatment, review in 4 weeks',
  Toothache: 'Filling, then review in 2 weeks',
  'Toothache, lower left molar': 'Root canal over 2 visits, then a crown',
  'Bleeding gums': 'Scaling & polishing every 6 months',
  'Wisdom tooth pain': 'Extraction, review after 1 week',
  'Stained teeth': 'Scaling first, then in-clinic whitening',
  'Braces enquiry': 'OPG X-ray, then braces plan with the orthodontist',
  'Lower back pain': '8 physiotherapy sessions, twice a week',
  'Frozen shoulder': '10 sessions with dry needling',
  'Neck pain from desk work': '6 sessions plus home exercises',
  'Knee rehab after ACL surgery': '12-week rehab plan, 2 sessions a week',
  'Sports ankle sprain': 'Sports rehab, 6 sessions',
  'Mobility after hip surgery': 'Weekly home visits for 6 weeks',
  'Fever and fatigue': 'CBC, review in 1 week',
  'Annual health check': 'CBC, lipid profile and vitamin D every year',
  'High blood pressure': 'Monthly BP review, ECG every year',
  'Vitamin D deficiency': 'Supplements, retest in 3 months',
  'Thyroid follow-up': 'Review every 3 months',
  'Diabetes follow-up': 'HbA1c every 3 months, diet plan',
  'Eczema flare-up': 'Dermatology review in 2 weeks',
  'Acne scars': 'Acne scar treatment, 4 sessions a month apart',
  Pigmentation: 'Chemical peels every 3 weeks',
  'Hair fall': 'PRP for hair, 4 sessions',
  'Dull skin': 'HydraFacial every month',
  'Unwanted facial hair': 'Laser hair removal, 6–8 sessions',
};

// ---------- People

const FEMALE = [
  'Ayesha', 'Fatima', 'Hira', 'Zainab', 'Mahnoor', 'Amna', 'Maryam', 'Areeba', 'Hania', 'Mehwish', 'Sadia', 'Kiran',
  'Sidra', 'Anum', 'Nimra', 'Laiba', 'Alina', 'Eman', 'Zoya', 'Mahrukh', 'Saba', 'Bushra', 'Rida', 'Huma', 'Fiza',
  'Javeria', 'Komal', 'Sehrish', 'Aiman', 'Minahil', 'Momina', 'Dua', 'Mehak', 'Arooj', 'Hafsa', 'Uzma', 'Rimsha',
  'Shiza', 'Anaya', 'Nadia',
];
const MALE = [
  'Ali', 'Ahmed', 'Hassan', 'Usman', 'Fahad', 'Saad', 'Omar', 'Zain', 'Danish', 'Faisal', 'Imran', 'Kashif', 'Shahzaib',
  'Talha', 'Waqas', 'Junaid', 'Adeel', 'Asad', 'Haris', 'Rehan', 'Tariq', 'Nadeem', 'Khalid', 'Arslan', 'Hamid',
  'Yasir', 'Naveed', 'Kamran', 'Sohail', 'Zeeshan',
];
const SURNAMES = [
  'Khan', 'Malik', 'Sheikh', 'Butt', 'Chaudhry', 'Qureshi', 'Siddiqui', 'Raza', 'Ahmed', 'Hussain', 'Iqbal', 'Javed',
  'Akhtar', 'Mirza', 'Abbasi', 'Rana', 'Bhatti', 'Shah', 'Zafar', 'Aslam', 'Haider', 'Nawaz', 'Tariq', 'Rehman',
  'Farooq', 'Saeed', 'Anwar', 'Gillani', 'Hashmi', 'Baig',
];
const PHONE_PREFIXES = [
  '0300', '0301', '0302', '0303', '0305', '0306', '0307', '0308', '0309', '0311', '0312', '0313', '0314', '0315',
  '0321', '0322', '0323', '0324', '0331', '0332', '0333', '0334', '0335', '0336', '0345', '0346', '0347',
];

// Team members, and the name the screenshot script books with, are kept out of the patient pool.
const usedNames = new Set([
  'Sana Malik', 'Hamza Qureshi', 'Iqra Javed', 'Maham Siddiqui', 'Bilal Ahmed', 'Noor Fatima', 'Ayesha Khan', 'Ayesha Noor',
  'Rabia Khan', 'Hira Shah', 'Usman Tariq', 'Sara Haider', 'Hina Aslam', 'Faisal Iqbal',
]);
const usedNumbers = new Set();

function newNumber() {
  let number;
  do number = `${pick(PHONE_PREFIXES)}-${String(int(1000000, 9999999))}`;
  while (usedNumbers.has(number));
  usedNumbers.add(number);
  return number;
}

function newPerson(overrides = {}) {
  const gender = overrides.gender ?? (chance(0.56) ? 'Female' : 'Male');
  let name = overrides.name;
  while (!name || (usedNames.has(name) && !overrides.name)) {
    name = `${pick(gender === 'Female' ? FEMALE : MALE)} ${pick(SURNAMES)}`;
  }
  usedNames.add(name);
  if (overrides.number) usedNumbers.add(overrides.number);
  return {
    name,
    gender,
    number: overrides.number ?? newNumber(),
    city: overrides.city ?? weighted([['Lahore', 55], ['Islamabad', 30], ['Sialkot', 10], ['Karachi', 5]]),
    age: overrides.age ?? int(18, 66),
    visits: [],
    upcoming: [],
  };
}

const seen = []; // patients with at least one paid visit, in order of their first visit

// The featured patient's history is written by hand, so she is kept out of the pool random visits pick from.
let featured = null;

function recordVisit(person, bill) {
  if (person.visits.length === 0 && person !== featured) seen.push(person);
  person.visits.push(bill);
}

// ---------- Bills (planned in memory first, written in date order later)

const PAYMENT_METHODS = [['Cash', 40], ['Card', 20], ['Bank Transfer', 12], ['Easypaisa/JazzCash', 28]];

function planBill({ date, minutes, person = null, specs, visit = null, pendingShare = 0.005 }) {
  const items = resolveItems(specs);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount =
    subtotal >= 5000 && chance(0.14) ? Math.min(subtotal - 1000, pick([500, 1000, 1000, 1500, roundTo(subtotal * 0.1, 500)])) : 0;
  const total = subtotal - discount;
  const pending = total >= 3000 && chance(pendingShare);
  return {
    date,
    createdAt: notAfterNow(at(date, minutes)),
    person,
    visit,
    items,
    discount,
    total,
    paymentMethod: weighted(PAYMENT_METHODS),
    paymentStatus: pending ? 'Pending' : 'Paid',
    amountPaid: pending ? roundTo(total * (0.4 + random() * 0.3), 500) : total,
    notes: pending ? 'Balance at next visit' : chance(0.05) ? pick(['Paid for the full course', 'Referred by Dr. Sara Haider', 'Corporate panel patient']) : '',
  };
}

const bills = [];

// ---------- 1. Earlier months: bills only (appointments start this month)

const MONTHS = [-5, -4, -3, -2, -1, 0].map(monthKey);
// Monthly billing. This month stays under Rs 1,000,000 so the dashboard's "Billed this month" fits on one line.
const REVENUE_TARGETS = [550_000, 620_000, 700_000, 780_000, 860_000, 950_000];
const THIS_MONTH_CAP = 985_000;
const OUTSTANDING_CAP = 95_000;

featured = newPerson({ name: 'Mahnoor Sheikh', gender: 'Female', number: '0322-7814520', city: 'Lahore', age: 29 });
featured.concern = 'Tooth sensitivity and a cracked filling';
featured.plan = 'Fillings and a clean, then a check-up every 6 months';

for (let i = 0; i < 5; i += 1) {
  const days = openDaysOfMonth(MONTHS[i]);
  const planned = [];
  let revenue = 0;
  while (revenue < REVENUE_TARGETS[i]) {
    const visit = pickVisit();
    const bill = planBill({ date: pick(days), minutes: int(11 * 60 + 30, 20 * 60 + 30), specs: visit.items(), visit });
    planned.push(bill);
    revenue += bill.total;
  }
  if (i === 3) planned.push(planBill({ date: days[int(8, 14)], minutes: 16 * 60 + 40, person: featured, specs: ['Dental check-up', 'OPG X-ray'], pendingShare: 0 }));
  if (i === 4) planned.push(planBill({ date: days[int(8, 12)], minutes: 15 * 60 + 10, person: featured, specs: ['Root canal treatment'], pendingShare: 0 }));
  planned.sort((a, b) => a.createdAt - b.createdAt);

  for (const bill of planned) {
    if (!bill.person) bill.person = seen.length > 25 && chance(0.62) ? pick(seen) : newPerson();
    recordVisit(bill.person, bill);
  }
  bills.push(...planned);
}

// ---------- 2. Leads from the last six weeks

const weekday = new Date(`${TODAY}T00:00:00.000Z`).getUTCDay();
const daysSinceMonday = (weekday + 6) % 7;
const LEAD_CATEGORIES = [
  ['Potential', 18], ['Interested', 14], ['Lead', 14], ['Offer & Deals', 9], ['Packages', 8], ['Pending Payment', 7],
  ['New Order', 5], ['Important', 6], ['Wellness', 6], ['Advanced', 4],
];
const leads = [];
for (let i = 0; i < 58; i += 1) {
  const daysAgo = i < 10 ? int(0, daysSinceMonday) : int(daysSinceMonday + 1, 42);
  leads.push({
    person: newPerson(),
    source: weighted([['Instagram', 50], ['WhatsApp', 35], ['Google', 15]]),
    category: weighted(LEAD_CATEGORIES),
    createdAt: notAfterNow(at(addDays(TODAY, -daysAgo), int(10 * 60, 23 * 60))),
  });
}

// ---------- 3. This month's appointments, two weeks ahead, and their bills

const BRANCHES = [
  {
    name: 'Gulberg, Lahore', slug: 'lahore', city: 'Lahore', address: 'Main Boulevard, Gulberg III, Lahore', phone: '0321-8456712',
    openingTime: '11:00', closingTime: '20:00', slotMinutes: 30, slotCapacity: 2, perDay: [2, 4], saturday: [3, 5], online: 0.4,
  },
  {
    name: 'F-7, Islamabad', slug: 'islamabad', city: 'Islamabad', address: 'F-7 Markaz, Islamabad', phone: '0333-5129804',
    openingTime: '12:00', closingTime: '21:00', slotMinutes: 30, slotCapacity: 1, perDay: [1, 3], saturday: [2, 3], online: 0.35,
  },
  {
    name: 'Cantt, Sialkot', slug: 'sialkot', city: 'Sialkot', address: 'Cantt, Sialkot', phone: '0300-6142257',
    openingTime: '11:00', closingTime: '19:00', slotMinutes: 60, slotCapacity: 1, bookingEnabled: false, perDay: [1, 2], saturday: [1, 2], online: 0,
  },
];

const ONLINE_NOTES = ['First visit, please call before', 'Coming with my father', 'Prefer a female doctor', 'Can I pay by JazzCash?'];
const STAFF_NOTES = {
  Consultations: ['Fasting for blood test', 'Diabetic, check sugar first', 'Bring previous reports'],
  Dental: ['Bring previous X-rays', 'Sensitive to cold drinks', 'Nervous patient, go gently'],
  Physiotherapy: ['Session 3 of 8', 'Bring MRI report', 'Post-surgery, go gently'],
  'Skin & Laser': ['Patch test done', 'Wants package pricing', 'Sensitive skin'],
};

// Tomorrow's slots at Gulberg are partly full, so the booking screenshot shows greyed-out times.
const BOOKING_DAY = nextOpenDay(TODAY);
const BOOKING_DAY_TIMES = ['11:00', '12:00', '12:00', '12:30', '12:30', '13:30', '15:00', '16:00', '17:30', '17:30', '18:30'];

function chooseTimes(branch, count) {
  const slots = buildSlots(branch);
  const used = new Map();
  const times = [];
  for (let tries = 0; times.length < count && tries < 200; tries += 1) {
    const time = pick(slots);
    if ((used.get(time) || 0) >= branch.slotCapacity) continue;
    used.set(time, (used.get(time) || 0) + 1);
    times.push(time);
  }
  return times.sort();
}

const appointments = [];
const lastDay = addDays(TODAY, 14);
for (let date = `${MONTHS[5]}-01`; date <= lastDay; date = addDays(date, 1)) {
  if (!isOpen(date)) continue;
  const ahead = daysBetween(TODAY, date);
  for (const branch of BRANCHES) {
    let count = weekdayOf(date) === 'Sat' ? int(...branch.saturday) : int(...branch.perDay);
    if (ahead > 0) count = Math.max(ahead <= 3 ? count : 0, Math.round(count * (ahead <= 7 ? 0.6 : 0.35)));
    const bookingDay = branch.slug === 'lahore' && date === BOOKING_DAY;
    const times = bookingDay ? BOOKING_DAY_TIMES : chooseTimes(branch, count);

    for (const time of times) {
      const minutes = toMinutes(time);
      let status;
      if (bookingDay) status = chance(0.5) ? 'Confirmed' : 'Scheduled';
      else if (date < TODAY) status = chance(0.08) ? 'Cancelled' : 'Completed';
      else if (date === TODAY && minutes + 45 <= NOW) status = chance(0.06) ? 'Cancelled' : 'Completed';
      else status = chance(0.05) ? 'Cancelled' : chance(0.45) ? 'Confirmed' : 'Scheduled';

      const online = chance(branch.online);
      const visit = pickVisit(online);
      appointments.push({
        branch,
        date,
        time,
        status,
        visit,
        source: online ? 'Online' : 'Staff',
        service: online ? 'Consultation' : visit.service,
        treatment: visit.main,
        notes: online ? (chance(0.25) ? pick(ONLINE_NOTES) : '') : chance(0.15) ? pick(STAFF_NOTES[SERVICE.get(visit.main).category]) : '',
        createdAt: notAfterNow(at(addDays(date, -(online ? int(0, 6) : int(0, 10))), int(10 * 60, 22 * 60))),
      });
    }
  }
}

// A few recent visits nobody marked as done, so the calendar shows its "Passed, not marked" state.
appointments
  .filter((a) => a.status === 'Completed' && a.date < TODAY && a.date >= addDays(TODAY, -5))
  .sort(() => random() - 0.5)
  .slice(0, 4)
  .forEach((a, i) => {
    a.status = i % 2 ? 'Confirmed' : 'Scheduled';
  });

// The featured patient: a follow-up earlier this month, today's visit (the receipt), and her next booking.
const thisMonthDays = openDaysOfMonth(MONTHS[5]);
const featuredVisitDay = NOW >= 13 * 60 ? TODAY : previousOpenDay(TODAY);
const featuredVisitTime = NOW >= 13 * 60 ? fromMinutes(Math.min(roundTo(NOW - 90, 30), 18 * 60)) : '17:00';
const featuredAppointments = [
  { date: thisMonthDays[Math.min(6, thisMonthDays.length - 1)], time: '16:00', status: 'Completed', service: 'Follow-up', treatment: 'Follow-up visit', specs: ['Follow-up visit'] },
  {
    date: featuredVisitDay, time: featuredVisitTime, status: 'Completed', service: 'Procedure', treatment: 'Composite filling',
    notes: 'Cleaning and two fillings', receipt: true,
  },
  { date: nextOpenDay(addDays(TODAY, 13)), time: '16:00', status: 'Confirmed', service: 'Consultation', treatment: 'Dental check-up' },
].map((a) => ({
  notes: '',
  ...a,
  branch: BRANCHES[0],
  person: featured,
  source: 'Staff',
  createdAt: notAfterNow(at(addDays(a.date, -7), 13 * 60)),
}));
appointments.push(...featuredAppointments);
appointments.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

// Who each appointment is for: mostly returning patients, some leads, some first-timers.
const busy = new Map(); // date -> names already booked that day
for (const a of appointments) {
  if (!a.person) {
    const bookedToday = busy.get(a.date) ?? new Set();
    const openLeads = leads.filter((l) => !l.booked && l.createdAt <= a.createdAt);
    const returning = a.source === 'Online' ? 0.55 : 0.72;
    for (let tries = 0; tries < 6 && !a.person; tries += 1) {
      const r = random();
      let person;
      let lead = null;
      if (r < returning && seen.length) person = pick(seen);
      else if (r < returning + (a.source === 'Online' ? 0.1 : 0.07) && openLeads.length) {
        lead = pick(openLeads);
        person = lead.person;
      } else person = newPerson();
      if (bookedToday.has(person.name)) continue;
      a.person = person;
      if (lead) {
        lead.booked = true;
        // Staff book leads straight from CRM Leads, which links the two; online bookings aren't linked.
        if (a.source === 'Staff') a.lead = lead;
      }
    }
    if (!a.person) a.person = newPerson();
  }
  busy.set(a.date, (busy.get(a.date) ?? new Set()).add(a.person.name));

  if (a.status === 'Completed') {
    const specs = a.receipt ? ['Scaling & polishing', ['Composite filling', 2], 'OPG X-ray'] : (a.specs ?? a.visit.items());
    const bill = planBill({ date: a.date, minutes: toMinutes(a.time) + int(40, 80), person: a.person, specs, visit: a.visit, pendingShare: 0.04 });
    if (a.receipt) {
      // Rs 19,500 less Rs 1,500 discount, Rs 10,000 paid now.
      Object.assign(bill, {
        discount: 1500,
        total: 18000,
        paymentMethod: 'Easypaisa/JazzCash',
        paymentStatus: 'Pending',
        amountPaid: 10000,
        notes: 'Balance of Rs 8,000 at next visit',
        receipt: true,
      });
    } else if (a.person === featured) {
      Object.assign(bill, { paymentStatus: 'Paid', amountPaid: bill.total, notes: '' });
    }
    recordVisit(a.person, bill);
    bills.push(bill);
  } else if (a.date >= TODAY && a.status !== 'Cancelled') {
    a.person.upcoming.push(a.date);
  }
}

// Courses paid up front bring this month to its revenue target.
const thisMonthBills = () => bills.filter((b) => b.date >= `${MONTHS[5]}-01`);
let monthRevenue = thisMonthBills().reduce((sum, b) => sum + b.total, 0);
while (monthRevenue < REVENUE_TARGETS[5]) {
  const person = pick(seen);
  const bill = planBill({ date: pick(thisMonthDays), minutes: int(12 * 60, 20 * 60), person, specs: pick(PACKAGES), pendingShare: 0.04 });
  recordVisit(person, bill);
  bills.push(bill);
  monthRevenue += bill.total;
}

function retotal(bill) {
  const subtotal = bill.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  bill.discount = Math.max(0, Math.min(bill.discount, subtotal - 1000));
  bill.total = subtotal - bill.discount;
  bill.amountPaid = bill.paymentStatus === 'Paid' ? bill.total : Math.min(bill.amountPaid, bill.total);
}

// A busy month can overshoot: trim extras (second items, multi-session courses) off the biggest bills until it fits.
while (monthRevenue > THIS_MONTH_CAP) {
  const bill = thisMonthBills()
    .filter((b) => !b.receipt && b.person !== featured && (b.items.length > 1 || b.items[0].quantity > 1))
    .sort((a, b) => b.total - a.total)[0];
  if (!bill) break;
  const before = bill.total;
  const last = bill.items[bill.items.length - 1];
  if (last.quantity > 1) last.quantity = 1;
  else bill.items.pop();
  retotal(bill);
  monthRevenue -= before - bill.total;
}

// Keep the top of the Billing list from looking like a wall of unpaid bills: at most 2 pending among the latest 15.
let recentPending = 0;
[...bills]
  .sort((a, b) => b.createdAt - a.createdAt)
  .filter((b) => !b.receipt)
  .slice(0, 15)
  .forEach((b) => {
    if (b.paymentStatus !== 'Pending') return;
    recentPending += 1;
    if (recentPending > 2) Object.assign(b, { paymentStatus: 'Paid', amountPaid: b.total, notes: '' });
  });

// Outstanding (the total of unpaid bills) stays modest: the oldest unpaid bills are settled first.
const outstanding = () => bills.reduce((sum, b) => sum + (b.paymentStatus === 'Pending' ? b.total : 0), 0);
for (const b of bills.filter((b) => b.paymentStatus === 'Pending' && !b.receipt).sort((a, b) => a.createdAt - b.createdAt)) {
  if (outstanding() <= OUTSTANDING_CAP) break;
  Object.assign(b, { paymentStatus: 'Paid', amountPaid: b.total, notes: '' });
}

// Leads who came in are now patients; booked ones are interested.
for (const lead of leads) {
  if (lead.person.visits.length > 0) lead.category = 'Clients';
  else if (lead.booked) lead.category = pick(['Interested', 'Pending Payment', 'Important']);
}

// ---------- 4. Back office

const EMPLOYEES = [
  { name: 'Dr. Maham Siddiqui', email: 'maham.siddiqui@example.com', department: 'Doctor (DR)', salary: 120000, joinDate: '2024-02-01', timings: '11:00 AM - 7:00 PM', benefits: 'Health insurance, fuel allowance', payrollReceiving: 'Bank Transfer - Meezan' },
  { name: 'Dr. Usman Tariq', email: 'usman.tariq@example.com', department: 'Doctor (DR)', salary: 90000, joinDate: '2025-01-15', timings: '12:00 PM - 9:00 PM', benefits: 'Health insurance', payrollReceiving: 'Bank Transfer - HBL' },
  { name: 'Dr. Sara Haider', email: 'sara.haider@example.com', department: 'Doctor (DR)', salary: 110000, joinDate: '2024-06-10', timings: '11:00 AM - 7:00 PM', benefits: 'Health insurance', payrollReceiving: 'Bank Transfer - UBL' },
  { name: 'Dr. Hina Aslam', email: 'hina.aslam@example.com', department: 'Doctor (DR)', salary: 100000, joinDate: '2025-04-01', timings: '2:00 PM - 9:00 PM', benefits: 'Health insurance', payrollReceiving: 'Bank Transfer - Meezan' },
  { name: 'Ayesha Noor', email: 'ayesha.noor@example.com', department: 'Technician', salary: 40000, joinDate: '2024-05-06', timings: '11:00 AM - 8:00 PM', benefits: 'Dental assistant', payrollReceiving: 'Bank Transfer - UBL' },
  { name: 'Rabia Khan', email: 'rabia.khan@example.com', department: 'Technician', salary: 38000, joinDate: '2025-03-10', timings: '12:00 PM - 9:00 PM', benefits: 'Physio assistant', payrollReceiving: 'Easypaisa' },
  { name: 'Faisal Iqbal', email: 'faisal.iqbal@example.com', department: 'Technician', salary: 42000, joinDate: '2024-11-18', timings: '9:00 AM - 5:00 PM', benefits: 'Lab technician', payrollReceiving: 'Bank Transfer - MCB' },
  { name: 'Hira Shah', email: 'hira.shah@example.com', department: 'Technician', salary: 35000, joinDate: '2024-09-02', status: 'Inactive', timings: '11:00 AM - 7:00 PM', payrollReceiving: 'Cash' },
  { name: 'Hamza Qureshi', email: 'hamza.qureshi@example.com', department: 'Management', salary: 80000, joinDate: '2024-01-08', timings: '10:00 AM - 7:00 PM', benefits: 'Fuel allowance', payrollReceiving: 'Bank Transfer - Meezan' },
  { name: 'Iqra Javed', email: 'iqra.javed@example.com', department: 'Management', salary: 38000, joinDate: '2025-02-17', timings: '11:00 AM - 8:00 PM', benefits: 'Front desk, Gulberg', payrollReceiving: 'JazzCash' },
  { name: 'Bilal Ahmed', email: 'bilal.ahmed@example.com', department: 'Management', salary: 35000, joinDate: '2025-06-02', timings: '12:00 PM - 9:00 PM', benefits: 'Front desk, F-7', payrollReceiving: 'Bank Transfer - MCB' },
];

const EXPENSES = [
  ['Equipment', 'Dental composite kits', 12000, 28000],
  ['Equipment', 'Physio tapes & electrodes', 6000, 15000],
  ['Equipment', 'Lab reagents (CBC, HbA1c)', 18000, 42000],
  ['Equipment', 'Autoclave pouches & gloves', 5000, 12000],
  ['Equipment', 'Dental chair servicing', 25000, 60000],
  ['Equipment', 'HydraFacial tips & serums', 12000, 30000],
  ['Office Supplies', '80mm receipt rolls (box of 50)', 3500, 6000],
  ['Office Supplies', 'Printer toner & stationery', 4000, 9000],
  ['Software', 'Website & domain renewal', 4000, 9000],
  ['Other', 'Instagram ads', 30000, 90000],
  ['Other', 'Electricity bill', 50000, 110000],
  ['Other', 'Generator diesel', 12000, 30000],
  ['Other', 'Internet bill', 6000, 12000],
  ['Travel', 'Fuel for physio home visits', 4000, 9000],
  ['Travel', 'Careem to the Islamabad branch', 2500, 6000],
  ['Meals', 'Staff lunch, Saturday rush', 4000, 9000],
  ['Meals', 'Tea & refreshments for patients', 3000, 7000],
];
const SUBMITTERS = ['Hamza Qureshi', 'Iqra Javed', 'Bilal Ahmed', 'Ayesha Noor', 'Faisal Iqbal', 'Sana Malik'];

function planExpenses() {
  const expenses = [];
  MONTHS.forEach((key, i) => {
    const days = openDaysOfMonth(key);
    const target = REVENUE_TARGETS[i] * (0.22 + random() * 0.06);
    let approved = 0;
    while (approved < target) {
      const [category, description, min, max] = pick(EXPENSES);
      const amount = roundTo(int(min, max), 100);
      expenses.push({ date: pick(days), category, description, amount, status: 'Approved' });
      approved += amount;
    }
  });
  // This month: claims waiting for approval, and one that was turned down.
  const recent = thisMonthDays.slice(-5);
  [
    ['Equipment', 'Lab reagents restock', 18500],
    ['Other', 'Instagram ads, free dental check-up camp', 25000],
    ['Travel', 'Fuel for physio home visits', 4200],
    ['Meals', 'Staff lunch, Saturday rush', 6800],
  ].forEach(([category, description, amount], i) => expenses.push({ date: recent[i % recent.length], category, description, amount, status: 'Pending' }));
  expenses.push({ date: recent[1 % recent.length], category: 'Other', description: 'Team dinner', amount: 18500, status: 'Rejected' });

  return expenses.map((e) => ({
    ...e,
    city: weighted([['Lahore', 55], ['Islamabad', 35], ['Sialkot', 10]]),
    submittedBy: pick(SUBMITTERS),
    createdAt: notAfterNow(at(e.date, int(12 * 60, 21 * 60))),
  }));
}

// ---------- Writing it all

const shortDate = (date) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const itemLabel = (item) => (item.quantity > 1 ? `${item.name} ×${item.quantity}` : item.name);

function clientFields(person) {
  const first = person.visits[0];
  const concern = person.concern ?? pick(first.visit?.concerns ?? ['Annual health check']);
  const history = person.visits
    .slice(-3)
    .map((v) => `${shortDate(v.date)}: ${v.items.map(itemLabel).join(', ')}`)
    .join(' · ');
  const last = person.visits[person.visits.length - 1].date;
  let nextVisit = person.upcoming.sort()[0];
  if (!nextVisit && last >= addDays(TODAY, -60) && chance(0.55)) nextVisit = nextOpenDay(addDays(TODAY, int(0, 27)));
  return {
    name: person.name,
    number: person.number,
    date: day(first.date),
    age: person.age,
    gender: person.gender,
    concern,
    treatmentPlan: person.plan ?? PLANS[concern] ?? 'Review in 4–6 weeks',
    treatmentHistory: history,
    nextVisit: nextVisit ? day(nextVisit) : undefined,
    createdAt: first.createdAt,
  };
}

async function run() {
  const uri = process.env.DEMO_MONGO_URI;
  if (!uri) throw new Error('Set DEMO_MONGO_URI to an empty, throwaway database.');

  // The models register on this Mongoose instance, so connect through it.
  const mongoose = User.base;
  await mongoose.connect(uri);
  if ((await User.countDocuments()) > 0) {
    throw new Error('Refusing to seed: this database already has users. Point DEMO_MONGO_URI at an empty database.');
  }

  const branches = new Map();
  for (const b of BRANCHES) {
    const { perDay, saturday, online, ...fields } = b;
    const doc = await Branch.create({ ...fields, workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], createdAt: new Date('2026-01-05T09:00:00Z') });
    branches.set(b.slug, doc);
  }
  await Service.create(
    [...SERVICE.values()].map(({ name, category, price, showOnline, note }) => ({ name, category, price, showOnline, note }))
  );

  await Role.create([
    { name: 'Receptionist', permissions: normalizePermissions(['leads', 'appointments', 'clients', 'billing']) },
    { name: 'Doctor', permissions: normalizePermissions(['appointments', 'clients']) },
  ]);
  const admin = await User.create({ ...DEMO_ADMIN, role: 'Admin', createdAt: new Date('2026-01-10T06:00:00Z') });
  const team = [
    { name: 'Hamza Qureshi', email: 'hamza.qureshi@example.com', role: 'Manager', createdAt: '2026-02-03' },
    { name: 'Iqra Javed', email: 'iqra.javed@example.com', role: 'Receptionist', createdAt: '2026-03-12' },
    { name: 'Dr. Maham Siddiqui', email: 'maham.siddiqui@example.com', role: 'Doctor', createdAt: '2026-04-20' },
    { name: 'Bilal Ahmed', email: 'bilal.ahmed@example.com', role: 'Staff', createdAt: '2026-06-08' },
  ];
  for (const member of team) {
    await User.create({ ...member, password: `${member.email}-demo`, createdAt: new Date(`${member.createdAt}T07:00:00Z`) });
  }
  const invite = new Invite({ email: 'noor.fatima@example.com', name: 'Noor Fatima', role: 'Staff', invitedBy: admin._id, createdAt: at(addDays(TODAY, -1), 18 * 60) });
  invite.issueToken();
  await invite.save();

  const employees = [];
  for (const e of EMPLOYEES) employees.push(await Employee.create({ status: 'Active', ...e, createdAt: new Date(`${e.joinDate}T07:00:00Z`) }));
  const active = employees.filter((e) => e.status === 'Active');
  for (const [offset, status] of [[-1, 'Processed'], [0, 'Pending']]) {
    const month = monthLabel(monthKey(offset));
    const createdAt = offset === 0 ? notAfterNow(at(TODAY, 11 * 60)) : at(`${MONTHS[5]}-01`, 11 * 60);
    for (const e of active) {
      const bonus = e.department === 'Doctor (DR)' ? roundTo(int(8000, 15000), 1000) : e.department === 'Technician' ? roundTo(int(2000, 5000), 500) : pick([0, 3000]);
      await Payroll.create({
        employee: e._id, employeeName: e.name, employeeEmail: e.email, month,
        baseSalary: e.salary, bonus, deductions: pick([0, 0, 1500, 3000]), status, createdAt,
      });
    }
  }

  const leadDocs = new Map();
  for (const lead of leads) {
    const doc = await Lead.create({
      name: lead.person.name, number: lead.person.number, source: lead.source, city: lead.person.city,
      gender: lead.person.gender, category: lead.category, createdAt: lead.createdAt,
    });
    leadDocs.set(lead, doc);
  }

  const featuredClient = await Client.create(clientFields(featured));
  for (const person of seen) await Client.create(clientFields(person));

  for (const a of appointments) {
    await Appointment.create({
      name: a.person.name, number: a.person.number, service: a.service, treatment: a.treatment,
      date: day(a.date), time: a.time, status: a.status, notes: a.notes, source: a.source,
      branch: branches.get(a.branch.slug)._id, lead: a.lead ? leadDocs.get(a.lead)._id : null, createdAt: a.createdAt,
    });
  }

  // In date order, so invoice numbers run in order through the year.
  bills.sort((a, b) => a.createdAt - b.createdAt);
  let receiptBill = null;
  for (const b of bills) {
    const doc = await Bill.create({
      clientName: b.person.name, clientNumber: b.person.number, date: day(b.date), items: b.items, discount: b.discount,
      paymentMethod: b.paymentMethod, paymentStatus: b.paymentStatus, amountPaid: b.amountPaid, notes: b.notes, createdAt: b.createdAt,
    });
    if (b.receipt) receiptBill = doc;
  }

  for (const e of planExpenses()) await Expense.create(e);

  console.log(`Seeded demo clinic for ${TODAY}:`, {
    services: SERVICE.size,
    leads: leads.length,
    clients: seen.length + 1,
    appointments: appointments.length,
    bills: bills.length,
    expenses: await Expense.countDocuments(),
  });
  console.log(
    JSON.stringify({
      today: TODAY,
      bookingDay: BOOKING_DAY,
      admin: { email: DEMO_ADMIN.email, password: DEMO_ADMIN.password },
      featuredClientId: featuredClient.id,
      featuredClientName: featured.name,
      receiptBillId: receiptBill?.id ?? null,
    })
  );
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error(err.message);
  await User.base.disconnect().catch(() => {});
  process.exit(1);
});
