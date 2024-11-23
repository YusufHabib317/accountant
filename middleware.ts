import { type NextRequest, NextResponse } from 'next/server';
import { betterFetch } from '@better-fetch/fetch';
import type { Session } from 'better-auth/types';

export default async function authMiddleware(request: NextRequest) {
  function addSecurityHeaders(response: NextResponse) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
  }
  try {
    const baseURL = process.env.NODE_ENV === 'production'
      ? `https://${request.headers.get('host')}`
      : `${request.nextUrl.origin}`;
    const { data: session } = await betterFetch<Session>(
      '/api/auth/get-session',
      {
        baseURL,
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      },
    );

    const isRootUrl = request.nextUrl.pathname === '/';

    if (!session) {
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      addSecurityHeaders(response);
      return response;
    }

    if (isRootUrl) {
      const response = NextResponse.redirect(new URL('/dashboard/statics', request.url));
      addSecurityHeaders(response);
      return response;
    }

    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auth middleware error:', error);
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    addSecurityHeaders(response);
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!api/auth|auth/login|auth/register|auth/reset-password|auth/forgot-password|auth/otp-email-verification|_next/static|_next/image|favicon.ico).*)',
  ],
};
