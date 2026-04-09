"use client";
import { ClerkProvider } from "@clerk/nextjs";
import { ClerkAuthProvider } from "./AuthProvider";
import App from "../App";

const clerkAppearance = {
  variables: {
    colorPrimary: "#5E8CFF",
    colorBackground: "#141922",
    colorText: "#E9EEF5",
    colorInputBackground: "#0E1116",
    colorInputText: "#E9EEF5",
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
