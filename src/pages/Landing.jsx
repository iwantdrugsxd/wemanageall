import LandingShell from '../components/landing/LandingShell';
import LandingNavbar from '../components/landing/LandingNavbar';
import Hero from '../components/landing/Hero';
import StoryScroller from '../components/landing/StoryScroller';
import TrustGeometry from '../components/landing/TrustGeometry';
import PricingSection from '../components/landing/PricingSection';
import PricingCompare from '../components/landing/PricingCompare';
import PricingFaq from '../components/landing/PricingFaq';
import FinalCTA from '../components/landing/FinalCTA';
import LandingFooter from '../components/landing/LandingFooter';
import SmartCTA from '../components/landing/SmartCTA';

export default function Landing() {
  return (
    <LandingShell>
      <LandingNavbar />
      <div id="sentinel-hero" className="absolute top-0 left-0 w-full h-1" aria-hidden="true" />
      <Hero />
      <div id="sentinel-modules" className="absolute top-0 left-0 w-full h-1" aria-hidden="true" />
      <section id="modules" className="mk-section bg-[var(--mk-bg)]">
        {/* Module pills are in Hero, this section is for anchor */}
      </section>
      <div id="sentinel-system" className="absolute top-0 left-0 w-full h-1" aria-hidden="true" />
      <StoryScroller />
      <TrustGeometry />
      <div id="sentinel-pricing" className="absolute top-0 left-0 w-full h-1" aria-hidden="true" />
      <PricingSection />
      <PricingCompare />
      <PricingFaq />
      <FinalCTA />
      <LandingFooter />
      <SmartCTA />
    </LandingShell>
  );
}
