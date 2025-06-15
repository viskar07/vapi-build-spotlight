import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
    "/", "/sign-in(.*)", "/sign-up(.*)" , "/api(.*)", "/live-webinar(.*)"
])


export default clerkMiddleware(async (auth, req) => {

  const pathname = req.nextUrl.pathname;

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Redirect unauthenticated access from `/` to `/sign-in`
  if (pathname === "/" ) {
    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};