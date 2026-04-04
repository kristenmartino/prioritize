import { NextResponse } from "next/server";

export default async function middleware(request) {
  // Only enable Clerk middleware when configured
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.next();
  }
  const { clerkMiddleware } = await import("@clerk/nextjs/server");
  return clerkMiddleware()(request, NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
