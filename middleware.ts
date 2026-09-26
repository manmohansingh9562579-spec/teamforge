import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/signin",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding",
    "/profile",
    "/profile/edit/:path*",
    "/teams/create/:path*",
    "/teams/:slug/manage/:path*",
    "/teams/:slug/workspace/:path*",
    "/teams/:slug/tasks/:path*",
    "/teams/:slug/members/:path*",
    "/teams/:slug/activity/:path*",
    "/teams/:slug/settings/:path*",
    "/my-teams/:path*",
    "/requests/:path*",
    "/connections/:path*",
    "/notifications/:path*",
    "/settings/:path*",
  ],
};
