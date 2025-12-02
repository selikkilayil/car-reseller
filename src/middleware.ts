import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const pathname = new URL(request.url).pathname;

  // Public routes
  const isLoginPage = pathname.startsWith('/login');
  const isApiAuth = pathname.startsWith('/api/auth/login');

  // If no session and trying to access protected route, redirect to login
  if (!session && !isLoginPage && !isApiAuth) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If has session and trying to access login, redirect to home
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
