import { Hero } from '@/components/sections/hero';
import { Retire } from '@/components/sections/retire';
import { Specialties } from '@/components/sections/specialties';
import { Journey } from '@/components/sections/journey';
import { Features } from '@/components/sections/features';
import { Everything } from '@/components/sections/everything';
import { Trust } from '@/components/sections/trust';
import { Pricing } from '@/components/sections/pricing';
import { Faq } from '@/components/sections/faq';
import { FinalCta } from '@/components/sections/final-cta';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Retire />
      <Specialties />
      <Journey />
      <Features />
      <Everything />
      <Trust />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}
