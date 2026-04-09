import Link from "next/link";
import { LC } from "./landingTheme";

export const LandingNav = () => (
  <nav style={{ height: 56, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1120, margin: "0 auto" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${LC.blue}, ${LC.violet})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={LC.bg} strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" strokeLinecap="round"/><line x1="12" y1="6" x2="12" y2="20" strokeLinecap="round"/><circle cx="5" cy="6" r="2" fill={LC.bg} stroke="none"/><circle cx="19" cy="6" r="2" fill={LC.bg} stroke="none"/></svg>
      </div>
      <span style={{ fontSize: 16, fontWeight: 800, color: LC.text, letterSpacing: "-0.02em" }}>Tarazu</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <Link href="/app" style={{ fontSize: 13, color: LC.textMuted, textDecoration: "none", fontWeight: 500 }}>Sign in</Link>
      <Link href="/app" style={{ fontSize: 13, color: LC.ctaText, background: LC.ctaBg, padding: "8px 20px", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}>Try Tarazu</Link>
    </div>
  </nav>
);
