import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { site } from './site';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "Rs 12,000". A fixed locale keeps server and browser output identical. */
export const formatRs = (amount: number) => `Rs ${amount.toLocaleString('en-US')}`;

/** A wa.me link that opens a chat with the message typed in, or null when no number is set. */
export function whatsappLink(text: string) {
  if (!site.contact.whatsapp) return null;
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(text)}`;
}

/** A mailto link with subject and body filled in, or null when no email is set. */
export function emailLink(subject: string, body: string) {
  if (!site.contact.email) return null;
  return `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
