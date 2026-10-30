export type Permission =
  | 'leads'
  | 'appointments'
  | 'clients'
  | 'billing'
  | 'expenses'
  | 'expenses.approve'
  | 'payroll'
  | 'services'
  | 'employees'
  | 'branches';
export interface PermissionInfo {
  key: Permission;
  label: string;
  description: string;
  requires?: Permission;
}
export interface PermissionGroup {
  label: string;
  permissions: PermissionInfo[];
}
export declare const ADMIN_ROLE: 'Admin';
export declare const BUILT_IN_ROLES: string[];
export declare const PERMISSION_GROUPS: PermissionGroup[];
export declare const PERMISSIONS: Permission[];
export declare const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]>;
export declare function normalizePermissions(keys: readonly string[]): Permission[];
export declare function withoutPermission(keys: readonly Permission[], removed: Permission): Permission[];
export declare const LEAD_SOURCE_OPTIONS: string[];
export declare const CITY_OPTIONS: string[];
export declare const GENDER_OPTIONS: string[];
export declare const LEAD_CATEGORY_OPTIONS: string[];
export declare const EMPLOYEE_DEPARTMENT_OPTIONS: string[];
export declare const EMPLOYEE_STATUS_OPTIONS: string[];
export declare const APPOINTMENT_SERVICE_OPTIONS: string[];
export declare const APPOINTMENT_STATUS_OPTIONS: string[];
export declare const APPOINTMENT_SOURCE_OPTIONS: string[];
export declare const BILLING_PAYMENT_METHOD_OPTIONS: string[];
export declare const BILLING_PAYMENT_STATUS_OPTIONS: string[];
export declare const EXPENSE_CATEGORY_OPTIONS: string[];
export declare const EXPENSE_STATUS_OPTIONS: string[];
export declare const PAYROLL_STATUS_OPTIONS: string[];
export declare const WEEKDAY_OPTIONS: string[];
export declare const BOOKING_SLOT_MINUTE_OPTIONS: number[];
