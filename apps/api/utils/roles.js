import { ADMIN_ROLE, BUILT_IN_ROLES, DEFAULT_ROLE_PERMISSIONS, PERMISSIONS } from '@daesthetics/shared';
import Role from '../models/Role.js';

// Admin always gets everything, so the clinic can never lock itself out.
// Manager and Staff use their defaults until an Admin edits them.
export async function getRolePermissions(name) {
  if (name === ADMIN_ROLE) return PERMISSIONS;
  const role = await Role.findOne({ name }).lean();
  return role?.permissions ?? DEFAULT_ROLE_PERMISSIONS[name] ?? [];
}

export async function roleExists(name) {
  if (typeof name !== 'string') return false;
  return BUILT_IN_ROLES.includes(name) || Boolean(await Role.exists({ name }));
}

// express-validator rule body for fields that take a role name.
export async function assertRoleExists(name) {
  if (!(await roleExists(name))) throw new Error('Invalid role');
  return true;
}

// What the web app needs to know about the signed-in user.
export async function sessionUser(user, permissions) {
  return { ...user.toSafeObject(), permissions: permissions ?? (await getRolePermissions(user.role)) };
}
