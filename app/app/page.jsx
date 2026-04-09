"use client";
import dynamic from "next/dynamic";
import { GuestAuthProvider } from "../../src/components/AuthProvider";
import App from "../../src/App";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Only load Clerk when configured — keeps bundle small and avoids import errors without keys
const ClerkPage = clerkKey
  ? dynamic(() => import("../../src/components/ClerkWrapper"), { ssr: false })
  : null;

export default function AppPage() {
  if (ClerkPage) return <ClerkPage />;
  return (
    <GuestAuthProvider>
      <App />
    </GuestAuthProvider>
  );
}
