"use client";
import { ClerkProvider } from "@clerk/nextjs";
import { ClerkAuthProvider } from "./AuthProvider";
import App from "../App";

const clerkAppearance = {
  variables: {
    colorPrimary: "#4ADE80",
    colorBackground: "#141820",
    colorText: "#E8ECF2",
    colorInputBackground: "#0C0F14",
    colorInputText: "#E8ECF2",
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
