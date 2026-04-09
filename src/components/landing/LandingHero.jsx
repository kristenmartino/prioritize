import Link from "next/link";
import { LC } from "./landingTheme";

export const LandingHero = () => (
  <section style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px 60px", textAlign: "center" }}>
    <h1 style={{ fontSize: 56, fontWeight: 700, color: LC.text, letterSpacing: "-0.03em", margin: "0 0 24px", lineHeight: 1.1 }}>
      Weigh what matters.
    </h1>
    <p style={{ fontSize: 20, color: LC.textMuted, maxWidth: 620, margin: "0 auto 40px", lineHeight: 1.6 }}>
      Tarazu helps product teams prioritize candidates, compare tradeoffs, and document decisions with structured frameworks and explainable AI.
    </p>
    <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
      <Link href="/app" style={{ padding: "14px 32px", background: LC.ctaBg, color: LC.ctaText, borderRadius: 8, fontSize: 16, fontWeight: 600, textDecoration: "none" }}>
        Start free
      </Link>
      <Link href="/app" style={{ padding: "14px 32px", border: `1px solid ${LC.blue}`, color: LC.blue, borderRadius: 8, fontSize: 16, fontWeight: 600, textDecoration: "none", background: "transparent" }}>
        See the product
      </Link>
    </div>
  </section>
);
