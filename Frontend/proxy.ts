import { NextRequest, NextResponse } from "next/server";
import { getUserData, getAuthToken } from "./lib/cookie";

const publicPaths = ["/login", "/register", "/forgot-password"];
const adminPaths = ["/admin"];
const protectedPaths = ["/auth/dashboard"]; // explicitly protected

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
    const target = user.role === "admin" ? "/admin/dashboard" : "/auth/dashboard";
    return NextResponse.redirect(new URL(target, req.url));
  }

  // 3. Admins should land on the admin dashboard instead of user dashboard
  if (user && isProtectedPath && user.role === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // 4. Non-admin user trying to access admin routes
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
    "/auth/dashboard",
  ],
};
