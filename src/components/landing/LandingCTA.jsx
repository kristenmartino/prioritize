import Link from "next/link";
import { LC } from "./landingTheme";

export const LandingCTA = () => (
  <section style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px 120px", textAlign: "center" }}>
    <h2 style={{ fontSize: 32, fontWeight: 700, color: LC.text, margin: "0 0 24px", letterSpacing: "-0.02em" }}>
      Turn product debates into structured decisions.
    </h2>
    <Link href="/app" style={{ display: "inline-block", padding: "16px 40px", background: LC.ctaBg, color: LC.ctaText, borderRadius: 10, fontSize: 18, fontWeight: 600, textDecoration: "none" }}>
      Try Tarazu
    </Link>
    <p style={{ fontSize: 12, color: LC.textDim, marginTop: 16 }}>No account required to start.</p>
  </section>
);
