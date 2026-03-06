import { NextRequest, NextResponse } from "next/server";
import { getUserData, getAuthToken } from "./lib/cookie";

const publicPaths = ["/login", "/register", "/forgot-password", "/reset-password"];
const adminPaths = ["/admin"];
const protectedPaths = ["/auth"];

const isOnboardingComplete = (user: any) => {
  return Boolean(
    user?.onboardingCompleted &&
    user?.username &&
    user?.dateOfBirth &&
    user?.gender &&
    user?.bio &&
    Array.isArray(user?.interests) &&
    user.interests.length > 0 &&
    user?.imageUrl &&
    Array.isArray(user?.profileImages) &&
    user.profileImages.length > 0
  );
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get token & user
  const token = await getAuthToken(); // pass request to get cookie
  const user = token ? await getUserData() : null;

  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  // 1. Unauthenticated user trying to access protected or other non-public routes
  if (!user && (isProtectedPath || (!isPublicPath && !isAdminPath))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. Logged-in user accessing public paths
  if (user && isPublicPath) {
    const completed = isOnboardingComplete(user);
    const target = user.role === "admin"
      ? "/admin"
      : completed
        ? "/auth/dashboard"
        : "/auth/profile";
    return NextResponse.redirect(new URL(target, req.url));
  }

  // 3. Admins should not access user routes
  if (user && isProtectedPath && user.role === "admin") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // 4. Non-admin users must complete onboarding before dashboard
  if (user && user.role !== "admin" && !isOnboardingComplete(user) && pathname.startsWith("/auth/dashboard")) {
    return NextResponse.redirect(new URL("/auth/profile", req.url));
  }

  // 5. Onboarded users should not stay on onboarding page
  if (user && user.role !== "admin" && isOnboardingComplete(user) && pathname.startsWith("/auth/profile")) {
    return NextResponse.redirect(new URL("/auth/dashboard", req.url));
  }

  // 6. Non-admin user trying to access admin routes
  if (user && isAdminPath && user.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/auth/:path*",
  ],
};
