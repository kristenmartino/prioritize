import { useState, useEffect } from "react";

let clerkUseUser;
try {
  clerkUseUser = require("@clerk/nextjs").useUser;
} catch {}

export function useAuth() {
  if (!clerkUseUser || !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return { isSignedIn: false, isLoaded: true, userId: null };
  }

  const { isSignedIn, isLoaded, user } = clerkUseUser();
  return { isSignedIn: !!isSignedIn, isLoaded, userId: user?.id || null };
}
