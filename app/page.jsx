"use client";
import { ClerkProvider } from "@clerk/nextjs";
import { ClerkAuthProvider, GuestAuthProvider } from "../src/components/AuthProvider";
import App from "../src/App";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const clerkAppearance = {
  variables: {
    colorPrimary: "#4ADE80",
    colorBackground: "#141820",
    colorText: "#E8ECF2",
    colorInputBackground: "#0C0F14",
    colorInputText: "#E8ECF2",
  },
};

export default function Page() {
  if (!clerkKey) {
    return (
      <GuestAuthProvider>
        <App />
      </GuestAuthProvider>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkKey} appearance={clerkAppearance}>
      <ClerkAuthProvider>
        <App />
      </ClerkAuthProvider>
    </ClerkProvider>
  );
}
