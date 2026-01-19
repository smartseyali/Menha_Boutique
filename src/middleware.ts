import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define paths that are allowed (admin, api, static assets)
  // We allow /_next so Next.js internals work
  // We allow /assets, /images, /favicon.ico for static files
  // We allow /api access for the app
  // We allow /admin paths
  
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/assets') ||
    pathname.includes('.') // usually file extensions like .png, .css
  ) {
    return NextResponse.next();
  }

  // Redirect everything else to admin login
  return NextResponse.redirect(new URL('/admin/login', request.url));
}

export const config = {
  matcher: '/:path*',
};
