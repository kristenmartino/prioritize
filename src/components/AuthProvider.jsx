"use client";
import { useUser } from "@clerk/nextjs";
import { AuthContext } from "../hooks/useAuth";

export function ClerkAuthProvider({ children }) {
  const { isSignedIn, isLoaded, user } = useUser();
  const value = {
    isSignedIn: !!isSignedIn,
    isLoaded,
    userId: user?.id || null,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function GuestAuthProvider({ children }) {
  const value = { isSignedIn: false, isLoaded: true, userId: null };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
