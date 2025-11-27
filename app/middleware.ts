
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;


    if (!token) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    // 2️⃣ If user exists but not verified
    if (!token.isVerified) {
      return NextResponse.redirect(new URL("/verify", req.url));
    }


    return NextResponse.next();
  },
  {
    callbacks: {

      authorized: ({ token }) => !!token, 
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/messages/:path*", "/profile/:path*"],
};
