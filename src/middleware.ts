import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. CORS Protection
  // Restrict API access to kapruka.com and local development
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = ['https://www.kapruka.com', 'https://kapruka.com', 'http://localhost:3000'];
  
  // Apply CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const isAllowed = allowedOrigins.includes(origin) || !origin || process.env.NODE_ENV === 'development';
    
    if (!isAllowed && process.env.NODE_ENV === 'production') {
      return new NextResponse('Forbidden: Invalid CORS Origin', { status: 403 });
    }

    const response = NextResponse.next();
    if (isAllowed && origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    return response;
  }

  // 2. Session Validation
  // Ensure secure routes cannot be accessed without an active session
  if (request.nextUrl.pathname.startsWith('/secure')) {
    const sessionToken = request.cookies.get('kapruka_session_token');
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/secure/:path*'],
};
