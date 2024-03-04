import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from './prisma/prisma';
import github from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import spotify from 'next-auth/providers/spotify';
import { LOGIN_URL as SpotifyLoginURL, refreshAccessToken } from "@/lib/spotify";


export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET,
  //@ts-ignore
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: '/login',
  },
  providers: [
    github,
    spotify({
      clientId: process.env.SPOTIFY_CLIENT as string,
      clientSecret: process.env.SPOTIFY_SECRET as string, 
      authorization: SpotifyLoginURL, 
    }),
    CredentialsProvider({
      name: 'Sign in',
      id: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'example@example.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log(credentials)
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: String(credentials.email),
          },
        });

        if (
          !user ||
          !(await bcrypt.compare(String(credentials.password), user.password!))
        ) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          randomKey: 'Hey cool',
        };
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const paths = ['/profile', '/client-side'];
      const isProtected = paths.some((path) =>
        nextUrl.pathname.startsWith(path)
      );

      if (isProtected && !isLoggedIn) {
        const redirectUrl = new URL('/api/auth/signin', nextUrl.origin);
        redirectUrl.searchParams.append('callbackUrl', nextUrl.href);
        return Response.redirect(redirectUrl);
      }
      return true;
    },
    async jwt({ token, account, user }) {
      if (account && user) {
        return {
          ...token,
          id: account.providerAccountId as string,
          access_token: account.access_token as string,
          refresh_token: account.refresh_token as string,
          expires_at: account.expires_at as number * 1000,
        }
      };

      if (Date.now() < Number(token.expires_at)) {
        console.log("Existing acees token is valid")
        return token;
      }
      if (account?.provider === 'spotify') {
        return await refreshAccessToken(token);
      }
      return {
        ...token,
      };
    },
    //@ts-ignore
    async session({ session, token }: { session: UserSession; token: Token }): Promise<UserSession> {
      session.user.token = token;
      return session;
    },
  },
});
