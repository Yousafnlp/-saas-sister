export const mockEmployees = [
  { id: 1, name: 'Alice Johnson', email: 'alice@company.com', department: 'Doctor (DR)', salary: 195000, joinDate: '2022-01-15', status: 'Active', timings: '9:00 AM - 6:00 PM', damages: 0, benefits: 'Health Insurance, Transport', payrollReceiving: 'Bank Transfer - HBL' },
  { id: 2, name: 'Bob Smith', email: 'bob@company.com', department: 'Management', salary: 120000, joinDate: '2021-06-20', status: 'Active', timings: '10:00 AM - 7:00 PM', damages: 0, benefits: 'Health Insurance', payrollReceiving: 'Bank Transfer - UBL' },
  { id: 3, name: 'Carol White', email: 'carol@company.com', department: 'Technician', salary: 70000, joinDate: '2020-03-10', status: 'Active', timings: '11:00 AM - 8:00 PM', damages: 1500, benefits: 'Meals', payrollReceiving: 'Cash' },
  { id: 4, name: 'David Lee', email: 'david@company.com', department: 'Technician', salary: 80000, joinDate: '2023-02-01', status: 'Active', timings: '9:00 AM - 6:00 PM', damages: 0, benefits: 'Transport', payrollReceiving: 'Bank Transfer - MCB' },
  { id: 5, name: 'Emma Davis', email: 'emma@company.com', department: 'Doctor (DR)', salary: 210000, joinDate: '2021-11-05', status: 'Inactive', timings: '10:00 AM - 7:00 PM', damages: 0, benefits: 'Health Insurance, Meals', payrollReceiving: 'Cheque' },
];

export const mockSales = [
  { id: 1, date: '2024-03-14', product: 'Premium Package', amount: 5000, region: 'North', salesman: 'David Lee', status: 'Completed' },
  { id: 2, date: '2024-03-13', product: 'Standard Package', amount: 2500, region: 'South', salesman: 'Bob Smith', status: 'Completed' },
  { id: 3, date: '2024-03-14', product: 'Enterprise Plan', amount: 15000, region: 'East', salesman: 'Alice Johnson', status: 'Pending' },
  { id: 4, date: '2024-03-12', product: 'Basic Package', amount: 1000, region: 'West', salesman: 'Carol White', status: 'Completed' },
];

export const mockExpenses = [
  { id: 1, date: '2024-03-14', category: 'Travel', amount: 450, description: 'Flight to client meeting', status: 'Pending', submittedBy: 'Alice Johnson' },
  { id: 2, date: '2024-03-13', category: 'Equipment', amount: 1200, description: 'Office Monitor', status: 'Approved', submittedBy: 'Bob Smith' },
  { id: 3, date: '2024-03-12', category: 'Meals', amount: 85, description: 'Team lunch', status: 'Approved', submittedBy: 'Carol White' },
  { id: 4, date: '2024-03-11', category: 'Software', amount: 299, description: 'Project Management Tool', status: 'Rejected', submittedBy: 'David Lee' },
];

export const mockPayroll = [
  { id: 1, employeeName: 'Alice Johnson', month: 'March 2024', baseSalary: 95000, bonus: 5000, deductions: 15000, netSalary: 85000, status: 'Processed' },
  { id: 2, employeeName: 'Bob Smith', month: 'March 2024', baseSalary: 75000, bonus: 3000, deductions: 12000, netSalary: 66000, status: 'Processed' },
  { id: 3, employeeName: 'Carol White', month: 'March 2024', baseSalary: 70000, bonus: 2000, deductions: 11000, netSalary: 61000, status: 'Pending' },
  { id: 4, employeeName: 'David Lee', month: 'March 2024', baseSalary: 80000, bonus: 4000, deductions: 13000, netSalary: 71000, status: 'Processed' },
];

export const mockReports = [
  { id: 1, name: 'Monthly Performance Report', type: 'Performance', generatedDate: '2024-03-14', status: 'Available' },
  { id: 2, name: 'Attendance Summary', type: 'Attendance', generatedDate: '2024-03-14', status: 'Available' },
  { id: 3, name: 'Payroll Summary', type: 'Payroll', generatedDate: '2024-03-10', status: 'Available' },
  { id: 4, name: 'Sales Analysis Q1', type: 'Sales', generatedDate: '2024-03-01', status: 'Available' },
];

export const mockBranches = [
  { id: 1, name: 'North Branch', employees: 24, revenue: 125000, expenses: 42000, efficiency: 87 },
  { id: 2, name: 'South Branch', employees: 18, revenue: 98000, expenses: 35000, efficiency: 82 },
  { id: 3, name: 'East Branch', employees: 31, revenue: 156000, expenses: 52000, efficiency: 91 },
  { id: 4, name: 'West Branch', employees: 15, revenue: 72000, expenses: 28000, efficiency: 78 },
];

export const dashboardStats = {
  totalEmployees: 88,
  presentToday: 82,
  onLeave: 4,
  totalRevenue: 451000,
  totalExpenses: 157000,
  averageAttendance: 93,
  pendingApprovals: 5,
};

export const chartData = [
  { month: 'Jan', revenue: 125000, expenses: 45000 },
  { month: 'Feb', revenue: 138000, expenses: 52000 },
  { month: 'Mar', revenue: 151000, expenses: 48000 },
  { month: 'Apr', revenue: 142000, expenses: 51000 },
  { month: 'May', revenue: 165000, expenses: 55000 },
  { month: 'Jun', revenue: 178000, expenses: 60000 },
];

export const departmentStats = [
  { name: 'Engineering', employees: 24, projects: 8 },
  { name: 'Marketing', employees: 12, projects: 5 },
  { name: 'Sales', employees: 18, projects: 12 },
  { name: 'HR', employees: 8, projects: 2 },
  { name: 'Operations', employees: 26, projects: 3 },
];

export const mockCRMLeads = [
  { id: 1, name: 'John Mitchell', number: '0300-1234567', source: 'Instagram', city: 'Lahore', gender: 'Male', category: 'LHR Leads', createdAt: '2024-03-14T10:30:00' },
  { id: 2, name: 'Sarah Chen', number: '0301-2345678', source: 'WhatsApp', city: 'Islamabad', gender: 'Female', category: 'Potential', createdAt: '2024-03-13T14:15:00' },
  { id: 3, name: 'Michael Brown', number: '0302-3456789', source: 'Google', city: 'Karachi', gender: 'Male', category: 'Interested', createdAt: '2024-03-12T09:00:00' },
  { id: 4, name: 'Jessica Davis', number: '0303-4567890', source: 'Instagram', city: 'Sialkot', gender: 'Female', category: 'Skt Leads', createdAt: '2024-03-14T16:45:00' },
  { id: 5, name: 'Robert Wilson', number: '0304-5678901', source: 'WhatsApp', city: 'Lahore', gender: 'Male', category: 'Pending Payment', createdAt: '2024-03-11T11:20:00' },
  { id: 6, name: 'Emily Garcia', number: '0305-6789012', source: 'Google', city: 'Islamabad', gender: 'Female', category: 'Salon & Common', createdAt: '2024-03-14T13:30:00' },
  { id: 7, name: 'David Martinez', number: '0306-7890123', source: 'Instagram', city: 'Karachi', gender: 'Unknown', category: 'Lead', createdAt: '2024-03-10T08:00:00' },
  { id: 8, name: 'Lisa Anderson', number: '0307-8901234', source: 'WhatsApp', city: 'Lahore', gender: 'Female', category: 'Important', createdAt: '2024-03-13T10:00:00' },
];

export const mockClients = [
  { id: 1, name: 'John Mitchell', date: '2024-03-14', age: 34, gender: 'Male', concern: 'Acne treatment', nextVisit: '2024-04-01' },
  { id: 2, name: 'Sarah Chen', date: '2024-03-13', age: 28, gender: 'Female', concern: 'Skin brightening', nextVisit: '2024-03-27' },
  { id: 3, name: 'Michael Brown', date: '2024-03-12', age: 41, gender: 'Male', concern: 'Hair loss consultation', nextVisit: '2024-04-05' },
  { id: 4, name: 'Jessica Davis', date: '2024-03-14', age: 30, gender: 'Female', concern: 'Laser hair removal', nextVisit: '2024-03-28' },
  { id: 5, name: 'Robert Wilson', date: '2024-02-20', age: 52, gender: 'Male', concern: 'Anti-aging treatment', nextVisit: '2024-03-20' },
  { id: 6, name: 'Emily Garcia', date: '2024-03-13', age: 26, gender: 'Female', concern: 'Facial consultation', nextVisit: '2024-03-30' },
];

export const mockAppointments = [
  { id: 1, leadId: 1, name: 'John Mitchell', number: '0300-1234567', service: 'Consultation', date: '2024-03-20', time: '10:00', status: 'Scheduled', notes: '' },
  { id: 2, leadId: 2, name: 'Sarah Chen', number: '0301-2345678', service: 'Follow-up', date: '2024-03-21', time: '14:30', status: 'Confirmed', notes: 'Second session' },
  { id: 3, leadId: 4, name: 'Jessica Davis', number: '0303-4567890', service: 'Procedure', date: '2024-03-18', time: '11:00', status: 'Completed', notes: '' },
];
