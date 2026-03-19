import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getRoleFromToken(token: string): string | null {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;
    const decodedJson = atob(payloadBase64);
    const payload = JSON.parse(decodedJson);
    return payload.role;
  } catch (e) {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const path = req.nextUrl.pathname;

  // Protect Admin Routes
  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    if (!token) return NextResponse.redirect(new URL('/admin/login', req.url));
    const role = getRoleFromToken(token);
    if (role !== 'SUPERADMIN') {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // Protect Manager Routes
  if (path.startsWith('/manager') && !path.startsWith('/manager/login')) {
    if (!token) return NextResponse.redirect(new URL('/manager/login', req.url));
    const role = getRoleFromToken(token);
    if (role !== 'MANAGER' && role !== 'SUPERADMIN') { // Optionally let superadmin access manager routes, or restrict entirely
      return NextResponse.redirect(new URL('/manager/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/manager/:path*'],
};

