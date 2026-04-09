import { LandingNav } from "../src/components/landing/LandingNav";
import { LandingHero } from "../src/components/landing/LandingHero";
import { LandingProofStrip } from "../src/components/landing/LandingProofStrip";
import { LandingProblems } from "../src/components/landing/LandingProblems";
import { LandingCapabilities } from "../src/components/landing/LandingCapabilities";
import { LandingComparison } from "../src/components/landing/LandingComparison";
import { LandingTiers } from "../src/components/landing/LandingTiers";
import { LandingAudience } from "../src/components/landing/LandingAudience";
import { LandingCTA } from "../src/components/landing/LandingCTA";

export default function LandingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0E1116", color: "#E9EEF5", fontFamily: "'Inter', sans-serif" }}>
      <LandingNav />
      <LandingHero />
      <LandingProofStrip />
      <LandingProblems />
      <LandingCapabilities />
      <LandingComparison />
      <LandingTiers />
      <LandingAudience />
      <LandingCTA />
    </main>
  );
}
