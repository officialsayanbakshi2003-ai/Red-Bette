import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/token";

// Fast, optimistic gate for signed-in areas. Every page and server action in
// these areas still checks the session against the database; this only saves
// a render for visitors who are clearly not signed in.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    const res = NextResponse.redirect(login);
    // Drop a cookie that failed verification (expired or tampered).
    if (request.cookies.has(SESSION_COOKIE)) res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.rewrite(new URL("/404", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/wishlist"],
};
