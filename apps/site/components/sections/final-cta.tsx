import { ArrowRight, MessageCircle } from 'lucide-react';
import { site } from '@/lib/site';
import { whatsappLink } from '@/lib/utils';
import { ButtonLink } from '@/components/button';

export function FinalCta() {
  const whatsapp = whatsappLink(`Hi ${site.name}, I'd like to see a demo for my clinic.`);

  return (
    <section className="px-4 py-24 sm:px-6 md:py-32">
      <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-band px-6 py-16 text-center text-band-foreground sm:px-12 md:py-24">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="absolute -left-20 -top-28 size-96 rounded-full bg-primary/40 blur-3xl" />
          <div className="absolute -bottom-32 -right-16 size-96 rounded-full bg-band-foreground/10 blur-3xl" />
        </div>
        <h2 className="mx-auto max-w-3xl font-display text-4xl leading-[1.06] tracking-tight sm:text-5xl md:text-6xl">
          See it working for your clinic
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-band-muted">
          Book a free demo and we’ll walk through a day at your clinic, from the first message to the printed receipt.
        </p>
        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <ButtonLink href="/demo" variant="light" size="lg">
            Book a free demo <ArrowRight aria-hidden="true" />
          </ButtonLink>
          {whatsapp && (
            <ButtonLink href={whatsapp} variant="outlineLight" size="lg">
              <MessageCircle aria-hidden="true" /> Chat on WhatsApp
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  );
}
