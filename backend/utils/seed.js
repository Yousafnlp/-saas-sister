import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Client from '../models/Client.js';
import Lead from '../models/Lead.js';
import Appointment from '../models/Appointment.js';
import Expense from '../models/Expense.js';
import Payroll from '../models/Payroll.js';

const USERS = [
  { name: 'Admin User', email: 'admin@daesthetics.com', password: 'admin123', role: 'Admin' },
  { name: 'Manager User', email: 'manager@daesthetics.com', password: 'manager123', role: 'Manager' },
  { name: 'Staff User', email: 'staff@daesthetics.com', password: 'staff123', role: 'Staff' },
];

const EMPLOYEES = [
  { name: 'Alice Johnson', email: 'alice@company.com', department: 'Doctor (DR)', salary: 195000, joinDate: '2022-01-15', status: 'Active', timings: '9:00 AM - 6:00 PM', damages: 0, benefits: 'Health Insurance, Transport', payrollReceiving: 'Bank Transfer - HBL' },
  { name: 'Bob Smith', email: 'bob@company.com', department: 'Management', salary: 120000, joinDate: '2021-06-20', status: 'Active', timings: '10:00 AM - 7:00 PM', damages: 0, benefits: 'Health Insurance', payrollReceiving: 'Bank Transfer - UBL' },
  { name: 'Carol White', email: 'carol@company.com', department: 'Technician', salary: 70000, joinDate: '2020-03-10', status: 'Active', timings: '11:00 AM - 8:00 PM', damages: 1500, benefits: 'Meals', payrollReceiving: 'Cash' },
  { name: 'David Lee', email: 'david@company.com', department: 'Technician', salary: 80000, joinDate: '2023-02-01', status: 'Active', timings: '9:00 AM - 6:00 PM', damages: 0, benefits: 'Transport', payrollReceiving: 'Bank Transfer - MCB' },
  { name: 'Emma Davis', email: 'emma@company.com', department: 'Doctor (DR)', salary: 210000, joinDate: '2021-11-05', status: 'Inactive', timings: '10:00 AM - 7:00 PM', damages: 0, benefits: 'Health Insurance, Meals', payrollReceiving: 'Cheque' },
];

const CLIENTS = [
  { name: 'John Mitchell', number: '0300-1234567', date: '2024-03-14', age: 34, gender: 'Male', concern: 'Acne treatment', nextVisit: '2024-04-01' },
  { name: 'Sarah Chen', number: '0301-2345678', date: '2024-03-13', age: 28, gender: 'Female', concern: 'Skin brightening', nextVisit: '2024-03-27' },
  { name: 'Michael Brown', number: '0302-3456789', date: '2024-03-12', age: 41, gender: 'Male', concern: 'Hair loss consultation', nextVisit: '2024-04-05' },
  { name: 'Jessica Davis', number: '0303-4567890', date: '2024-03-14', age: 30, gender: 'Female', concern: 'Laser hair removal', nextVisit: '2024-03-28' },
  { name: 'Robert Wilson', date: '2024-02-20', age: 52, gender: 'Male', concern: 'Anti-aging treatment', nextVisit: '2024-03-20' },
  { name: 'Emily Garcia', date: '2024-03-13', age: 26, gender: 'Female', concern: 'Facial consultation', nextVisit: '2024-03-30' },
];

const LEADS = [
  { name: 'John Mitchell', number: '0300-1234567', source: 'Instagram', city: 'Lahore', gender: 'Male', category: 'LHR Leads' },
  { name: 'Sarah Chen', number: '0301-2345678', source: 'WhatsApp', city: 'Islamabad', gender: 'Female', category: 'Potential' },
  { name: 'Michael Brown', number: '0302-3456789', source: 'Google', city: 'Karachi', gender: 'Male', category: 'Interested' },
  { name: 'Jessica Davis', number: '0303-4567890', source: 'Instagram', city: 'Sialkot', gender: 'Female', category: 'Skt Leads' },
];

const EXPENSES = [
  { date: '2024-03-14', category: 'Travel', city: 'Lahore', amount: 450, description: 'Flight to client meeting', status: 'Pending', submittedBy: 'Alice Johnson' },
  { date: '2024-03-13', category: 'Equipment', city: 'Islamabad', amount: 1200, description: 'Office Monitor', status: 'Approved', submittedBy: 'Bob Smith' },
  { date: '2024-03-12', category: 'Meals', city: 'Karachi', amount: 85, description: 'Team lunch', status: 'Approved', submittedBy: 'Carol White' },
  { date: '2024-03-11', category: 'Software', city: 'Sialkot', amount: 299, description: 'Project Management Tool', status: 'Rejected', submittedBy: 'David Lee' },
];

async function upsertUsers() {
  for (const u of USERS) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) await User.create(u);
  }
  console.log(`Seeded ${USERS.length} users (skipped any that already existed)`);
}

async function upsertMany(Model, docs, keyField) {
  let created = 0;
  for (const doc of docs) {
    const exists = await Model.findOne({ [keyField]: doc[keyField] });
    if (!exists) {
      await Model.create(doc);
      created += 1;
    }
  }
  console.log(`Seeded ${created}/${docs.length} ${Model.modelName} document(s) (rest already existed)`);
}

async function seedPayroll() {
  const employees = await Employee.find({ email: { $in: EMPLOYEES.map((e) => e.email) } });
  let created = 0;
  for (const employee of employees) {
    const exists = await Payroll.findOne({ employee: employee._id, month: 'March 2024' });
    if (!exists) {
      await Payroll.create({
        employee: employee._id,
        employeeName: employee.name,
        employeeEmail: employee.email,
        month: 'March 2024',
        baseSalary: Math.round(employee.salary * 0.4),
        bonus: 2000,
        deductions: 5000,
        status: 'Processed',
      });
      created += 1;
    }
  }
  console.log(`Seeded ${created} payroll record(s)`);
}

async function seedAppointments() {
  const leads = await Lead.find({ number: { $in: LEADS.map((l) => l.number) } });
  const byNumber = new Map(leads.map((l) => [l.number, l]));

  const appointments = [
    { number: '0300-1234567', name: 'John Mitchell', service: 'Consultation', date: '2024-03-20', time: '10:00', status: 'Scheduled', notes: '' },
    { number: '0301-2345678', name: 'Sarah Chen', service: 'Follow-up', date: '2024-03-21', time: '14:30', status: 'Confirmed', notes: 'Second session' },
    { number: '0303-4567890', name: 'Jessica Davis', service: 'Procedure', date: '2024-03-18', time: '11:00', status: 'Completed', notes: '' },
  ];

  let created = 0;
  for (const a of appointments) {
    const exists = await Appointment.findOne({ number: a.number, date: a.date, time: a.time });
    if (!exists) {
      const lead = byNumber.get(a.number);
      await Appointment.create({ ...a, lead: lead ? lead._id : null });
      created += 1;
    }
  }
  console.log(`Seeded ${created} appointment(s)`);
}

async function run() {
  await connectDB();

  await upsertUsers();
  await upsertMany(Employee, EMPLOYEES, 'email');
  await upsertMany(Client, CLIENTS, 'name');
  await upsertMany(Lead, LEADS, 'number');
  await upsertMany(Expense, EXPENSES, 'description');
  await seedPayroll();
  await seedAppointments();

  console.log('\nSeed complete. Sample logins:');
  USERS.forEach((u) => console.log(`  ${u.role}: ${u.email} / ${u.password}`));

  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
