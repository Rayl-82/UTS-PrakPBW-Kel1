import 'server-only';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import authConfig from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: String(credentials.identifier) },
              { name: String(credentials.identifier) },
            ],
          },
        });
        if (!user) return null;

        const isValid = await bcrypt.compare(
          String(credentials.password),
          user.password
        );
        if (!isValid) return null;

        return { id: String(user.id), name: user.name, email: user.email };
      },
    }),
  ],
});
