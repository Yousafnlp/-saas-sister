// Option lists shared by the web app (form dropdowns) and the API (schema enums + validation).
// Keep them here so both sides always agree.

// Roles every clinic starts with. Admin always has every permission and can't be changed or removed.
// Manager and Staff keep their names but their permissions can be edited. Admins can add more roles.
export const ADMIN_ROLE = 'Admin';

export const BUILT_IN_ROLES = [ADMIN_ROLE, 'Manager', 'Staff'];

// What a role can be allowed to do, grouped the way the Team page shows them.
// `requires` names a permission that must come with this one.
export const PERMISSION_GROUPS = [
  {
    label: 'Front desk',
    permissions: [
      { key: 'leads', label: 'CRM leads', description: 'See and edit leads' },
      { key: 'appointments', label: 'Appointments', description: 'Book, change and cancel appointments' },
      { key: 'clients', label: 'Clients', description: 'See and edit client records' },
      { key: 'billing', label: 'Billing', description: 'Create and edit bills' },
    ],
  },
  {
    label: 'Money',
    permissions: [
      { key: 'expenses', label: 'Expenses', description: 'See expenses and submit new ones' },
      {
        key: 'expenses.approve',
        label: 'Approve expenses',
        description: 'Edit, approve, reject and delete expenses',
        requires: 'expenses',
      },
      { key: 'payroll', label: 'Payroll', description: 'See salaries, prepare and process payroll' },
    ],
  },
  {
    label: 'Clinic setup',
    permissions: [
      { key: 'services', label: 'Price list', description: 'Add, edit and remove services and prices' },
      { key: 'employees', label: 'Employees', description: 'See and edit employee records, including salaries' },
      { key: 'branches', label: 'Branches', description: 'Add branches, set opening hours and online booking' },
    ],
  },
];

export const PERMISSIONS = PERMISSION_GROUPS.flatMap((group) => group.permissions.map((p) => p.key));

export const DEFAULT_ROLE_PERMISSIONS = {
  Admin: PERMISSIONS,
  Manager: ['leads', 'appointments', 'clients', 'billing', 'expenses', 'expenses.approve', 'services'],
  Staff: ['appointments', 'clients', 'billing', 'expenses'],
};

const PERMISSION_REQUIRES = Object.fromEntries(
  PERMISSION_GROUPS.flatMap((group) => group.permissions).map((p) => [p.key, p.requires])
);

// Drops unknown keys, adds anything a permission depends on, and returns them in catalog order.
export function normalizePermissions(keys) {
  const wanted = new Set(keys);
  for (const key of keys) {
    if (PERMISSION_REQUIRES[key]) wanted.add(PERMISSION_REQUIRES[key]);
  }
  return PERMISSIONS.filter((key) => wanted.has(key));
}

// Removes a permission along with anything that depends on it.
export function withoutPermission(keys, removed) {
  return keys.filter((key) => key !== removed && PERMISSION_REQUIRES[key] !== removed);
}

export const LEAD_SOURCE_OPTIONS = ['Instagram', 'WhatsApp', 'Google'];

export const CITY_OPTIONS = ['Lahore', 'Islamabad', 'Karachi', 'Sialkot'];

export const GENDER_OPTIONS = ['Male', 'Female', 'Unknown'];

export const LEAD_CATEGORY_OPTIONS = [
  'LHR Leads',
  'Skt Leads',
  'Potential',
  'Salon & Common',
  'Lash & Nails',
  'Offer & Deals',
  'Institute',
  'Clients',
  'Interested',
  'Pending Payment',
  'Vendors',
  'Jobs',
  'Bloggers & PR',
  'Wellness',
  'Lead',
  'New Order',
  'Advanced',
  'Packages',
  'Important',
];

export const EMPLOYEE_DEPARTMENT_OPTIONS = ['Doctor (DR)', 'Technician', 'Management'];

export const EMPLOYEE_STATUS_OPTIONS = ['Active', 'Inactive'];

export const APPOINTMENT_SERVICE_OPTIONS = ['Consultation', 'Follow-up', 'Procedure'];

export const APPOINTMENT_STATUS_OPTIONS = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'];

export const APPOINTMENT_SOURCE_OPTIONS = ['Staff', 'Online'];

export const BILLING_PAYMENT_METHOD_OPTIONS = ['Cash', 'Card', 'Bank Transfer', 'Easypaisa/JazzCash'];

export const BILLING_PAYMENT_STATUS_OPTIONS = ['Paid', 'Pending'];

export const EXPENSE_CATEGORY_OPTIONS = ['Travel', 'Meals', 'Office Supplies', 'Equipment', 'Software', 'Other'];

export const EXPENSE_STATUS_OPTIONS = ['Pending', 'Approved', 'Rejected'];

export const PAYROLL_STATUS_OPTIONS = ['Pending', 'Processed'];

export const WEEKDAY_OPTIONS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const BOOKING_SLOT_MINUTE_OPTIONS = [15, 30, 45, 60];
