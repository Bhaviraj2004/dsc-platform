import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwtRole(token: string): string | null {
  try {
    const base64Payload = token.split('.')[1];
    if (!base64Payload) return null;
    const payload = JSON.parse(atob(base64Payload));
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.some(r => pathname.startsWith(r));
  const isCARoute = pathname.startsWith('/ca');
  const isClientRoute = pathname.startsWith('/client');

  const role = token ? decodeJwtRole(token) : null;

  // Not logged in — redirect to login if trying to access protected routes
  if ((isCARoute || isClientRoute) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Logged in — redirect away from auth pages to the correct dashboard
  if (isAuthRoute && token && role) {
    return NextResponse.redirect(
      new URL(role === 'CA' ? '/ca' : '/client', request.url),
    );
  }

  // Cross-role protection: CA trying to access client area and vice versa
  if (token && role) {
    if (isCARoute && role !== 'CA') {
      return NextResponse.redirect(new URL('/client', request.url));
    }
    if (isClientRoute && role !== 'CLIENT') {
      return NextResponse.redirect(new URL('/ca', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};