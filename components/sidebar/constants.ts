import {
  Users,
  CalendarClock,
  DollarSign,
  TrendingUp,
  Home,
  Briefcase,
  UserRound,
  Receipt,
} from 'lucide-react';

export interface MenuItem {
  href: string;
  label: string;
  icon: any;
  roles: ('Admin' | 'Manager' | 'Staff')[];
}

export const menuItems: MenuItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['Admin', 'Manager', 'Staff'] },
  { href: '/crm-leads', label: 'CRM Leads', icon: Briefcase, roles: ['Admin', 'Manager'] },
  { href: '/appointments', label: 'Appointments', icon: CalendarClock, roles: ['Admin', 'Manager', 'Staff'] },
  { href: '/clients', label: 'Clients', icon: UserRound, roles: ['Admin', 'Manager', 'Staff'] },
  { href: '/billing', label: 'Billing', icon: Receipt, roles: ['Admin', 'Manager', 'Staff'] },
  { href: '/employees', label: 'Employees', icon: Users, roles: ['Admin'] },
  { href: '/expenses', label: 'Expenses', icon: TrendingUp, roles: ['Admin', 'Manager', 'Staff'] },
  { href: '/payroll', label: 'Payroll', icon: DollarSign, roles: ['Admin'] },
];
