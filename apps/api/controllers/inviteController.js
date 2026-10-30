import Invite, { hashInviteToken } from '../models/Invite.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import generateToken from '../utils/generateToken.js';
import { sessionUser } from '../utils/roles.js';

// Invites that haven't been accepted yet (expired ones included, so the admin can re-send them).
export const getInvites = asyncHandler(async (req, res) => {
  const data = await Invite.find({ acceptedAt: null }).sort('-createdAt').populate('invitedBy', 'name email');
  res.status(200).json({ success: true, data });
});

export const createInvite = asyncHandler(async (req, res) => {
  const { email, name = '', role } = req.body;

  if (await User.exists({ email })) {
    throw new AppError('Someone with this email already has an account', 409);
  }

  // One open invite per email: a new invite replaces any earlier one.
  await Invite.deleteMany({ email, acceptedAt: null });

  const invite = new Invite({ email, name, role, invitedBy: req.user._id });
  const token = invite.issueToken();
  await invite.save();
  await invite.populate('invitedBy', 'name email');

  res.status(201).json({ success: true, token, data: invite });
});

// Issues a new link (and a fresh 7-day expiry). The old link stops working.
export const regenerateInvite = asyncHandler(async (req, res) => {
  const invite = await Invite.findOne({ _id: req.params.id, acceptedAt: null });
  if (!invite) throw new AppError('Invite not found', 404);

  const token = invite.issueToken();
  await invite.save();
  await invite.populate('invitedBy', 'name email');

  res.status(200).json({ success: true, token, data: invite });
});

export const deleteInvite = asyncHandler(async (req, res) => {
  const invite = await Invite.findOneAndDelete({ _id: req.params.id, acceptedAt: null });
  if (!invite) throw new AppError('Invite not found', 404);
  res.status(200).json({ success: true, data: {} });
});

async function findOpenInvite(token) {
  const invite = await Invite.findOne({ tokenHash: hashInviteToken(token), acceptedAt: null });
  if (!invite) {
    throw new AppError('This invite link is not valid. Ask your admin for a new one.', 404);
  }
  if (invite.expiresAt < new Date()) {
    throw new AppError('This invite link has expired. Ask your admin for a new one.', 410);
  }
  return invite;
}

// Public: lets the invite page show who the invite is for before they set a password.
export const getInviteByToken = asyncHandler(async (req, res) => {
  const invite = await findOpenInvite(req.params.token);
  res.status(200).json({
    success: true,
    data: { email: invite.email, name: invite.name, role: invite.role, expiresAt: invite.expiresAt },
  });
});

// Public: creates the account, marks the invite used and signs the new user in.
export const acceptInvite = asyncHandler(async (req, res) => {
  const invite = await findOpenInvite(req.params.token);

  if (await User.exists({ email: invite.email })) {
    throw new AppError('An account with this email already exists. Please sign in instead.', 409);
  }

  const user = await User.create({
    name: req.body.name,
    email: invite.email,
    password: req.body.password,
    role: invite.role,
  });

  invite.acceptedAt = new Date();
  await invite.save();

  res.status(201).json({ success: true, token: generateToken(user._id), data: await sessionUser(user) });
});
