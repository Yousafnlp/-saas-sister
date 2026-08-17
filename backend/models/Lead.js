import mongoose from 'mongoose';
import toJSON from '../utils/toJSON.js';

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    number: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    source: {
      type: String,
      required: [true, 'Source is required'],
      enum: ['Instagram', 'WhatsApp', 'Google'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      enum: ['Lahore', 'Islamabad', 'Karachi', 'Sialkot'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Unknown'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
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
      ],
    },
  },
  { timestamps: true }
);

leadSchema.index({ name: 'text', number: 'text' });
leadSchema.plugin(toJSON);

export default mongoose.model('Lead', leadSchema);
