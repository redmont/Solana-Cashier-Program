import { NextResponse, type NextRequest } from 'next/server';

const blockedCountries =
  process.env.NEXT_BLOCKED_COUNTRIES?.split(',').map((c) => c.toUpperCase()) ??
  [];

const vipCredentials =
  process.env.NEXT_VIP_CREDENTIALS?.split(';').map((c) => ({
    user: c.split(':')[0],
    pwd: c.split(':')[1],
  })) ?? [];

export const config = {
  matcher: '/(profile|vip)?',
};

export function middleware(req: NextRequest) {
  const country = req.geo?.country || 'US';

  // Handle country blocking
  if (blockedCountries.includes(country)) {
    req.nextUrl.pathname = '/blocked';
    return NextResponse.rewrite(req.nextUrl);
  }

  // Handle authentication for VIP page
  if (req.nextUrl.pathname.startsWith('/vip')) {
    const basicAuth = req.headers.get('authorization');
    const url = req.nextUrl;
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      const credentials = vipCredentials.find(
        (c) => c.user === user && c.pwd === pwd,
      );

      if (credentials) {
        return NextResponse.next();
      }
    }

    url.pathname = '/api/auth';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
