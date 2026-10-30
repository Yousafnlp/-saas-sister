import { ADMIN_ROLE } from '@daesthetics/shared';
import asyncHandler from '../utils/asyncHandler.js';
import { addDays, clinicNow, dayRange, fromMinutes } from '../utils/clinicTime.js';
import Appointment from '../models/Appointment.js';
import Bill from '../models/Bill.js';
import Branch from '../models/Branch.js';
import Client from '../models/Client.js';
import Employee from '../models/Employee.js';
import Expense from '../models/Expense.js';
import Invite from '../models/Invite.js';
import Lead from '../models/Lead.js';
import Payroll from '../models/Payroll.js';
import Service from '../models/Service.js';
import User from '../models/User.js';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LIST_SIZE = 5;

const sumOf = async (Model, match, field) => {
  const [row] = await Model.aggregate([{ $match: match }, { $group: { _id: null, total: { $sum: `$${field}` } } }]);
  return row?.total || 0;
};

const countBy = async (Model, field, match = {}) => {
  const rows = await Model.aggregate([{ $match: match }, { $group: { _id: `$${field}`, count: { $sum: 1 } } }]);
  return rows
    .filter((row) => row._id)
    .map((row) => ({ label: row._id, count: row.count }))
    .sort((a, b) => b.count - a.count);
};

// First day of the clinic's current month and of the current week (Monday), as UTC-midnight dates.
function periodStarts(today) {
  const monthStart = new Date(`${today.slice(0, 7)}-01T00:00:00.000Z`);
  const weekday = new Date(`${today}T00:00:00.000Z`).getUTCDay();
  const weekStart = new Date(`${addDays(today, -((weekday + 6) % 7))}T00:00:00.000Z`);
  return { monthStart, weekStart };
}

async function leadsSection({ weekStart }) {
  const [total, newThisWeek, byCategory, recent] = await Promise.all([
    Lead.countDocuments(),
    Lead.countDocuments({ createdAt: { $gte: weekStart } }),
    countBy(Lead, 'category'),
    Lead.find().sort('-createdAt').limit(LIST_SIZE).select('name number source category createdAt'),
  ]);
  return { total, newThisWeek, byCategory, recent };
}

async function appointmentsSection({ today, now }) {
  const upcomingFilter = {
    status: { $ne: 'Cancelled' },
    date: { $gte: new Date(`${today}T00:00:00.000Z`) },
  };
  const [todayCount, todayByStatus, nextWeekCount, upcoming] = await Promise.all([
    Appointment.countDocuments({ date: dayRange(today), status: { $ne: 'Cancelled' } }),
    countBy(Appointment, 'status', { date: dayRange(today) }),
    Appointment.countDocuments({
      status: { $ne: 'Cancelled' },
      date: { $gte: new Date(`${today}T00:00:00.000Z`), $lt: new Date(`${addDays(today, 7)}T00:00:00.000Z`) },
    }),
    // Over-fetch so appointments earlier today that have already started can be dropped.
    Appointment.find(upcomingFilter)
      .sort('date time')
      .limit(LIST_SIZE * 4)
      .populate({ path: 'branch', select: 'name' })
      .select('name service treatment date time status branch'),
  ]);

  const todayStart = new Date(`${today}T00:00:00.000Z`).getTime();
  const next = upcoming
    .filter((a) => a.date.getTime() > todayStart || a.time >= now)
    .slice(0, LIST_SIZE);

  return { today: todayCount, todayByStatus, nextSevenDays: nextWeekCount, upcoming: next };
}

async function clientsSection({ today, monthStart }) {
  const [total, newThisMonth, upcomingVisits] = await Promise.all([
    Client.countDocuments(),
    Client.countDocuments({ createdAt: { $gte: monthStart } }),
    Client.find({ nextVisit: { $gte: new Date(`${today}T00:00:00.000Z`) } })
      .sort('nextVisit')
      .limit(LIST_SIZE)
      .select('name concern nextVisit'),
  ]);
  return { total, newThisMonth, upcomingVisits };
}

async function billingSection({ monthStart }) {
  const thisMonth = { date: { $gte: monthStart } };
  const [billedThisMonth, collectedThisMonth, billsThisMonth, outstanding, unpaidCount, recent] = await Promise.all([
    sumOf(Bill, thisMonth, 'total'),
    sumOf(Bill, { ...thisMonth, paymentStatus: 'Paid' }, 'total'),
    Bill.countDocuments(thisMonth),
    sumOf(Bill, { paymentStatus: 'Pending' }, 'total'),
    Bill.countDocuments({ paymentStatus: 'Pending' }),
    Bill.find().sort('-date -createdAt').limit(LIST_SIZE).select('invoiceNumber clientName date total paymentStatus'),
  ]);
  return { billedThisMonth, collectedThisMonth, billsThisMonth, outstanding, unpaidCount, recent };
}

async function expensesSection({ monthStart }) {
  const [approvedThisMonth, pendingCount, pendingAmount, pending] = await Promise.all([
    sumOf(Expense, { status: 'Approved', date: { $gte: monthStart } }, 'amount'),
    Expense.countDocuments({ status: 'Pending' }),
    sumOf(Expense, { status: 'Pending' }, 'amount'),
    Expense.find({ status: 'Pending' }).sort('-date').limit(LIST_SIZE).select('date category amount description submittedBy'),
  ]);
  return { approvedThisMonth, pendingCount, pendingAmount, pending };
}

async function payrollSection() {
  const latest = await Payroll.findOne().sort('-createdAt').select('month');
  const [pendingCount, pendingAmount, latestMonthTotal, latestMonthCount] = await Promise.all([
    Payroll.countDocuments({ status: 'Pending' }),
    sumOf(Payroll, { status: 'Pending' }, 'netSalary'),
    latest ? sumOf(Payroll, { month: latest.month }, 'netSalary') : 0,
    latest ? Payroll.countDocuments({ month: latest.month }) : 0,
  ]);
  return { latestMonth: latest?.month ?? null, latestMonthTotal, latestMonthCount, pendingCount, pendingAmount };
}

async function employeesSection() {
  const [active, inactive, byDepartment, monthlySalaries] = await Promise.all([
    Employee.countDocuments({ status: 'Active' }),
    Employee.countDocuments({ status: 'Inactive' }),
    countBy(Employee, 'department', { status: 'Active' }),
    sumOf(Employee, { status: 'Active' }, 'salary'),
  ]);
  return { active, inactive, byDepartment, monthlySalaries };
}

async function servicesSection() {
  const [total, active, online, byCategory] = await Promise.all([
    Service.countDocuments(),
    Service.countDocuments({ isActive: true }),
    Service.countDocuments({ isActive: true, showOnline: true }),
    countBy(Service, 'category', { isActive: true }),
  ]);
  return { total, active, online, categories: byCategory.length };
}

async function branchesSection({ today }) {
  const [branches, todayByBranch] = await Promise.all([
    Branch.find().sort('name').select('name city isActive bookingEnabled'),
    countBy(Appointment, 'branch', { date: dayRange(today), status: { $ne: 'Cancelled' } }),
  ]);
  const todayCounts = new Map(todayByBranch.map((row) => [String(row.label), row.count]));
  return {
    total: branches.length,
    takingBookings: branches.filter((b) => b.isActive && b.bookingEnabled).length,
    list: branches.map((b) => ({
      id: b.id,
      name: b.name,
      city: b.city,
      isActive: b.isActive,
      bookingEnabled: b.bookingEnabled,
      appointmentsToday: todayCounts.get(b.id) || 0,
    })),
  };
}

async function teamSection() {
  const [members, active, pendingInvites, byRole] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Invite.countDocuments({ acceptedAt: null, expiresAt: { $gt: new Date() } }),
    countBy(User, 'role', { isActive: true }),
  ]);
  return { members, active, pendingInvites, byRole };
}

// Revenue (bill totals) and approved expenses per month, for whichever of the two the user may see.
async function buildChart({ withRevenue, withExpenses }, monthsBack = 6) {
  const now = new Date();
  const rangeStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (monthsBack - 1), 1));
  const byMonth = (Model, match, field) =>
    Model.aggregate([
      { $match: { ...match, date: { $gte: rangeStart } } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: `$${field}` } } },
    ]);

  const [revenueRows, expenseRows] = await Promise.all([
    withRevenue ? byMonth(Bill, {}, 'total') : [],
    withExpenses ? byMonth(Expense, { status: 'Approved' }, 'amount') : [],
  ]);
  const toMap = (rows) => new Map(rows.map((r) => [`${r._id.year}-${r._id.month}`, r.total]));
  const revenueMap = toMap(revenueRows);
  const expenseMap = toMap(expenseRows);

  const chart = [];
  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`;
    chart.push({
      month: MONTH_LABELS[d.getUTCMonth()],
      ...(withRevenue && { revenue: revenueMap.get(key) || 0 }),
      ...(withExpenses && { expenses: expenseMap.get(key) || 0 }),
    });
  }
  return chart;
}

// Each section is only built, and only returned, when the user's role can open that page.
const SECTIONS = {
  leads: { permission: 'leads', build: leadsSection },
  appointments: { permission: 'appointments', build: appointmentsSection },
  clients: { permission: 'clients', build: clientsSection },
  billing: { permission: 'billing', build: billingSection },
  expenses: { permission: 'expenses', build: expensesSection },
  payroll: { permission: 'payroll', build: payrollSection },
  employees: { permission: 'employees', build: employeesSection },
  services: { permission: 'services', build: servicesSection },
  branches: { permission: 'branches', build: branchesSection },
  team: { adminOnly: true, build: teamSection },
};

export const getDashboard = asyncHandler(async (req, res) => {
  const permissions = req.permissions ?? [];
  const isAdmin = req.user.role === ADMIN_ROLE;
  const allowed = Object.entries(SECTIONS).filter(([, section]) =>
    section.adminOnly ? isAdmin : permissions.includes(section.permission)
  );

  const { date: today, minutes } = clinicNow();
  const context = { today, now: fromMinutes(minutes), ...periodStarts(today) };

  const [built, chart] = await Promise.all([
    Promise.all(allowed.map(([, section]) => section.build(context))),
    buildChart({ withRevenue: permissions.includes('billing'), withExpenses: permissions.includes('expenses') }),
  ]);

  const sections = Object.fromEntries(allowed.map(([key], i) => [key, built[i]]));
  res.status(200).json({ success: true, data: { today, sections, chart } });
});
