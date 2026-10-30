import mongoose from 'mongoose';
import toJSON from '../utils/toJSON.js';
import { PERMISSIONS } from '@daesthetics/shared';

// Role names compare case-insensitively, so "nurse" can't sit next to "Nurse".
export const ROLE_NAME_COLLATION = { locale: 'en', strength: 2 };

// Custom roles, plus Manager or Staff once their permissions have been edited.
// Admin is never stored: it always has every permission (see utils/roles.js).
const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [40, 'Name can be at most 40 characters'],
    },
    permissions: {
      type: [{ type: String, enum: PERMISSIONS }],
      default: [],
    },
  },
  { timestamps: true }
);

roleSchema.index({ name: 1 }, { unique: true, collation: ROLE_NAME_COLLATION });

roleSchema.plugin(toJSON);

export default mongoose.model('Role', roleSchema);
