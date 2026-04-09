"use client";
import { ClerkProvider } from "@clerk/nextjs";
import { ClerkAuthProvider } from "./AuthProvider";
import App from "../App";

const clerkAppearance = {
  variables: {
    colorPrimary: "#5E8CFF",
    colorBackground: "#141922",
    colorText: "#E9EEF5",
    colorTextSecondary: "#8A96A8",
    colorInputBackground: "#0E1116",
    colorInputText: "#E9EEF5",
    colorNeutral: "#E9EEF5",
  },
  elements: {
    userButtonPopoverCard: { backgroundColor: "#141922", borderColor: "#273142" },
    userButtonPopoverActionButton: { color: "#E9EEF5" },
    userButtonPopoverActionButtonText: { color: "#E9EEF5" },
    userButtonPopoverActionButtonIcon: { color: "#8A96A8" },
    userButtonPopoverFooter: { display: "none" },
  },
};

export default function ClerkWrapper() {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={clerkAppearance}
    >
      <ClerkAuthProvider>
        <App />
      </ClerkAuthProvider>
    </ClerkProvider>
  );
}
