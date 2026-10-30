import crypto from 'crypto';
import mongoose from 'mongoose';
import toJSON from '../utils/toJSON.js';

export const INVITE_TTL_DAYS = 7;

export function hashInviteToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

const inviteSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    // A built-in role name or the name of a custom Role.
    role: {
      type: String,
      trim: true,
      default: 'Staff',
    },
    // Only the hash is stored; the raw token exists in the link the admin shares.
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Creates a fresh token, stores its hash and resets the expiry. Returns the raw token.
inviteSchema.methods.issueToken = function issueToken() {
  const token = crypto.randomBytes(32).toString('hex');
  this.tokenHash = hashInviteToken(token);
  this.expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
  return token;
};

inviteSchema.plugin(toJSON);

export default mongoose.model('Invite', inviteSchema);
