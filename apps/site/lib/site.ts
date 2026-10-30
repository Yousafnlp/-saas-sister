// Everything to review before launch lives in this file: the brand name, contact details,
// pricing and plan limits. Contact details can also come from environment variables
// (see .env.example), so each deployment can use its own without a code change.

const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const site = {
  name: 'Clinicdesk',
  // Used in the browser-frame mockups, e.g. lumen.clinicdesk.pk/dashboard.
  domain: 'clinicdesk.pk',
  url: process.env.NEXT_PUBLIC_SITE_URL || (vercelUrl ? `https://${vercelUrl}` : 'http://localhost:3001'),
  title: 'Clinic software for dental, physio, skin and medical clinics',
  description:
    'Enquiries from WhatsApp and Instagram, an online booking link, appointments, patient records, billing with printed receipts, staff, expenses and payroll. One app for every branch of your clinic.',
  contact: {
    // International format, digits only, e.g. 923001234567. Empty hides the WhatsApp buttons.
    whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, ''),
    // Empty hides the email option.
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
  },
  // Where customers sign in to their clinic. Empty hides the "Sign in" link.
  appUrl: process.env.NEXT_PUBLIC_APP_URL || '',
  // The clinic shown in the screenshots. It is fictional.
  demoClinic: 'lumen',
};

export interface Plan {
  id: string;
  name: string;
  description: string;
  /** Rupees per month on monthly billing. null means "talk to us". */
  monthly: number | null;
  /** Rupees per year on yearly billing. */
  yearly: number | null;
  limits: string[];
  features: string[];
  highlighted?: boolean;
}

// Placeholder prices: set your own before launch.
export const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For a single clinic getting organised.',
    monthly: 6000,
    yearly: 60000,
    limits: ['1 branch', 'Up to 5 staff logins'],
    features: ['Every feature included', 'Online booking page', 'Receipt printing', 'WhatsApp support'],
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'For busy clinics with a few branches.',
    monthly: 12000,
    yearly: 120000,
    limits: ['Up to 3 branches', 'Up to 15 staff logins'],
    features: ['Everything in Starter', 'A booking link for each branch', 'Priority WhatsApp support', 'Guided setup of your price list and team'],
    highlighted: true,
  },
  {
    id: 'chain',
    name: 'Chain',
    description: 'For groups with 4 or more branches.',
    monthly: null,
    yearly: null,
    limits: ['Unlimited branches', 'Unlimited staff logins'],
    features: ['Everything in Growth', 'Onboarding and staff training', 'A named contact for your account', 'Invoiced billing'],
  },
];

/** Months charged on yearly billing; the rest are free. */
export const YEARLY_MONTHS_CHARGED = 10;
