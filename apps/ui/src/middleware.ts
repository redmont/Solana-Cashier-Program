import { NextResponse, type NextRequest } from 'next/server';

const blockedCountries =
  process.env.NEXT_BLOCKED_COUNTRIES?.split(',').map((c) => c.toUpperCase()) ??
  [];

export const config = {
  matcher: '/(profile)?',
};

export function middleware(req: NextRequest) {
  const country = req.geo?.country || 'US';

  if (blockedCountries.includes(country)) {
    req.nextUrl.pathname = '/blocked';
    return NextResponse.rewrite(req.nextUrl);
  }

  return NextResponse.next();
}
