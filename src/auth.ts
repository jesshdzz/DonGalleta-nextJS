import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

export const { auth, handlers } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;

          if (!user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }

        console.log('Credenciales inválidas');
        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile }) {
      if (account?.provider === 'google' && profile?.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        if (existingUser?.password) {
          return '/auth/login?error=EmailYaRegistrado';
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Primera vez que entra (login) — aplica para Credentials y Google
      if (user) {
        token.sub = user.id;
        token.role = user.role ?? 'USER';
        token.picture = user.image ?? token.picture;
      }
      if (account?.provider === 'google' && user && token.sub) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.sub } });
        token.role = dbUser?.role ?? 'USER';
      }
      return token;
    },
    async session({ session, token }) {
      const base = await authConfig.callbacks!.session!({ session, token } as Parameters<typeof authConfig.callbacks.session>[0]);
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { image: true },
        });
        base.user.image = dbUser?.image ?? token.picture ?? null;
      }
      return base;
    },
  },
});