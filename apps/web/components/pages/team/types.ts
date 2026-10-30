import { ADMIN_ROLE, PERMISSION_GROUPS, type Permission } from '@daesthetics/shared';
import type { StatusTone } from '@/components/status-badge';

export interface Role {
  name: string;
  /** Admin, Manager and Staff. They can't be renamed or deleted, and Admin can't be edited at all. */
  builtIn: boolean;
  permissions: Permission[];
}

export interface RoleResponse {
  success: boolean;
  data: Role;
}

export const ROLE_TONE: Record<string, StatusTone> = {
  Admin: 'info',
  Manager: 'success',
  Staff: 'neutral',
};

const PERMISSION_LABELS = Object.fromEntries(
  PERMISSION_GROUPS.flatMap((group) => group.permissions).map((p) => [p.key, p.label]),
) as Record<Permission, string>;

/** One line saying what a role can do, e.g. for the invite form. */
export function describeRole(role: Role | undefined) {
  if (!role) return '';
  if (role.name === ADMIN_ROLE) return 'Full access, including branches, team, employees and payroll.';
  if (role.permissions.length === 0) return 'Dashboard only.';
  return `Dashboard, ${role.permissions.map((p) => PERMISSION_LABELS[p].toLowerCase()).join(', ')}.`;
}
