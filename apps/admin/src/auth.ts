import NextAuth from 'next-auth';

import Credentials from 'next-auth/providers/credentials';
import { validateJWT } from './lib/authHelpers';

type User = {
  id: string;
  name: string;
  email: string;
};

export const config = {
  theme: {
    logo: 'https://next-auth.js.org/img/logo/logo-sm.png',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        token: { label: 'Token', type: 'text' },
      },
      async authorize(
        credentials: Partial<Record<'token', unknown>> | undefined,
      ): Promise<User | null> {
        const token = credentials?.token as string; // Safely cast to string; ensure to handle undefined case
        if (typeof token !== 'string' || !token) {
          throw new Error('Token is required');
        }
        const jwtPayload = await validateJWT(token);

        if (jwtPayload) {
          // The user must have the 'admin' scope
          if (!jwtPayload.scope?.includes('admin')) {
            // Unauthorized
            return null;
          }

          const user: User = {
            id: jwtPayload.sub!,
            name: jwtPayload.name || '',
            email: jwtPayload.email || '',
          };
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
};

export const { auth, handlers, signIn, signOut } = NextAuth(config);
