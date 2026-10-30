import {
  ADMIN_ROLE,
  BUILT_IN_ROLES,
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSIONS,
  normalizePermissions,
} from '@daesthetics/shared';
import Role, { ROLE_NAME_COLLATION } from '../models/Role.js';
import User from '../models/User.js';
import Invite from '../models/Invite.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

const isBuiltInName = (name) => BUILT_IN_ROLES.some((r) => r.toLowerCase() === name.toLowerCase());

const serialize = (name, permissions) => ({ name, builtIn: BUILT_IN_ROLES.includes(name), permissions });

async function assertNameFree(name, exceptId) {
  const taken =
    isBuiltInName(name) ||
    (await Role.exists({ name, ...(exceptId && { _id: { $ne: exceptId } }) }).collation(ROLE_NAME_COLLATION));
  if (taken) throw new AppError(`A role called "${name}" already exists`, 409);
}

// Built-in roles first (Admin, Manager, Staff), then custom roles by name.
export const getRoles = asyncHandler(async (req, res) => {
  const stored = await Role.find().collation(ROLE_NAME_COLLATION).sort('name').lean();
  const byName = new Map(stored.map((r) => [r.name, r]));

  const builtIn = BUILT_IN_ROLES.map((name) =>
    serialize(name, name === ADMIN_ROLE ? PERMISSIONS : byName.get(name)?.permissions ?? DEFAULT_ROLE_PERMISSIONS[name])
  );
  const custom = stored.filter((r) => !BUILT_IN_ROLES.includes(r.name)).map((r) => serialize(r.name, r.permissions));

  res.status(200).json({ success: true, data: [...builtIn, ...custom] });
});

export const createRole = asyncHandler(async (req, res) => {
  const { name, permissions } = req.body;
  await assertNameFree(name);

  const role = await Role.create({ name, permissions: normalizePermissions(permissions) });
  res.status(201).json({ success: true, data: serialize(role.name, role.permissions) });
});

// Changes a role's permissions, or renames a custom role (members and open invites move with it).
export const updateRole = asyncHandler(async (req, res) => {
  const current = req.params.name;
  const { name = current, permissions } = req.body;

  if (current === ADMIN_ROLE) {
    throw new AppError('The Admin role always has full access and cannot be changed', 400);
  }

  const isBuiltIn = BUILT_IN_ROLES.includes(current);
  if (isBuiltIn && name !== current) {
    throw new AppError('Built-in roles cannot be renamed', 400);
  }

  // Manager and Staff are only stored once they've been edited.
  let role = await Role.findOne({ name: current });
  if (!role) {
    if (!isBuiltIn) throw new AppError('Role not found', 404);
    role = new Role({ name: current, permissions: DEFAULT_ROLE_PERMISSIONS[current] });
  }

  if (name !== current) await assertNameFree(name, role._id);

  role.name = name;
  if (permissions !== undefined) role.permissions = normalizePermissions(permissions);
  await role.save();

  if (name !== current) {
    await Promise.all([
      User.updateMany({ role: current }, { role: name }),
      Invite.updateMany({ role: current }, { role: name }),
    ]);
  }

  res.status(200).json({ success: true, data: serialize(role.name, role.permissions) });
});

export const deleteRole = asyncHandler(async (req, res) => {
  const { name } = req.params;
  if (BUILT_IN_ROLES.includes(name)) {
    throw new AppError('Built-in roles cannot be deleted', 400);
  }

  const [members, invites] = await Promise.all([
    User.countDocuments({ role: name }),
    Invite.countDocuments({ role: name, acceptedAt: null }),
  ]);
  if (members > 0) {
    throw new AppError(`${members} ${members === 1 ? 'person has' : 'people have'} this role. Give them another role first.`, 409);
  }
  if (invites > 0) {
    throw new AppError(`${invites} pending ${invites === 1 ? 'invite uses' : 'invites use'} this role. Cancel ${invites === 1 ? 'it' : 'them'} first.`, 409);
  }

  const role = await Role.findOneAndDelete({ name });
  if (!role) throw new AppError('Role not found', 404);
  res.status(200).json({ success: true, data: {} });
});
