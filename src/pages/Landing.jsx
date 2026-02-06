import LandingShell from '../components/landing/LandingShell';
import LandingNavbar from '../components/landing/LandingNavbar';
import Hero from '../components/landing/Hero';
import PinnedStory from '../components/landing/PinnedStory';
import TrustGeometry from '../components/landing/TrustGeometry';
import PricingTeaser from '../components/landing/PricingTeaser';
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
      <PinnedStory />
      <TrustGeometry />
      <div id="sentinel-pricing" className="absolute top-0 left-0 w-full h-1" aria-hidden="true" />
      <PricingTeaser />
      <FinalCTA />
      <LandingFooter />
      <SmartCTA />
    </LandingShell>
  );
}
