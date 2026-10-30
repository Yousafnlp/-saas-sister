import {
  Users,
  CalendarClock,
  DollarSign,
  TrendingUp,
  Home,
  Briefcase,
  UserRound,
  Receipt,
  Tags,
  Building2,
  UserCog,
  ShieldCheck,
} from 'lucide-react';
import { ADMIN_ROLE, type Permission } from '@daesthetics/shared';

export interface MenuItem {
  href: string;
  label: string;
  icon: any;
  /** Permission needed to open this page. Leave out for pages everyone can open. */
  permission?: Permission;
  adminOnly?: boolean;
}

export const menuItems: MenuItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/crm-leads', label: 'CRM Leads', icon: Briefcase, permission: 'leads' },
  { href: '/appointments', label: 'Appointments', icon: CalendarClock, permission: 'appointments' },
  { href: '/clients', label: 'Clients', icon: UserRound, permission: 'clients' },
  { href: '/billing', label: 'Billing', icon: Receipt, permission: 'billing' },
  { href: '/services', label: 'Services & Prices', icon: Tags, permission: 'services' },
  { href: '/employees', label: 'Employees', icon: Users, permission: 'employees' },
  { href: '/expenses', label: 'Expenses', icon: TrendingUp, permission: 'expenses' },
  { href: '/payroll', label: 'Payroll', icon: DollarSign, permission: 'payroll' },
  { href: '/branches', label: 'Branches', icon: Building2, permission: 'branches' },
  { href: '/team', label: 'Team', icon: UserCog, adminOnly: true },
  { href: '/roles', label: 'Roles & Permissions', icon: ShieldCheck, adminOnly: true },
];

export function canOpen(item: MenuItem, userRole: string | null | undefined, can: (permission: Permission) => boolean) {
  if (item.adminOnly) return userRole === ADMIN_ROLE;
  return !item.permission || can(item.permission);
}

/** The menu entry a path belongs to, e.g. /clients/123 belongs to Clients. */
export function menuItemFor(pathname: string) {
  return menuItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}
