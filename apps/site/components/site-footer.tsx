import Link from 'next/link';
import { site } from '@/lib/site';
import { whatsappLink } from '@/lib/utils';
import { Logo } from './logo';

const PRODUCT_LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/demo', label: 'Book a demo' },
];

export function SiteFooter() {
  const whatsapp = whatsappLink(`Hi ${site.name}, I'd like to know more.`);

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid grid-cols-1 max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[2fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Clinic software for dental, physiotherapy, skin and medical clinics. Leads, bookings, patients, billing and
            the back office in one place.
          </p>
        </div>

        <nav aria-label="Product">
          <h2 className="text-sm font-semibold text-foreground">Product</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {PRODUCT_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold text-foreground">Talk to us</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {whatsapp && (
              <li>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">
                  WhatsApp
                </a>
              </li>
            )}
            {site.contact.email && (
              <li>
                <a href={`mailto:${site.contact.email}`} className="text-muted-foreground transition-colors hover:text-foreground">
                  {site.contact.email}
                </a>
              </li>
            )}
            {site.appUrl && (
              <li>
                <a href={site.appUrl} className="text-muted-foreground transition-colors hover:text-foreground">
                  Sign in to your clinic
                </a>
              </li>
            )}
            <li>
              <Link href="/demo" className="text-muted-foreground transition-colors hover:text-foreground">
                Request a demo
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>Made in Pakistan, for clinics everywhere.</p>
        </div>
      </div>
    </footer>
  );
}
