import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * Auth.js v5 session auth. Providers:
 *  - Credentials (email/password) — requires JWT session strategy
 *  - Google / Meta (Facebook) for one-click sign-in
 *
 * NOTE: connecting an *ad account* (Google Ads / Meta Marketing) with
 * ads-management scope + stored refresh tokens is a SEPARATE OAuth flow
 * (/api/oauth/{google,meta}/callback), not this sign-in flow.
 */

const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(creds) {
      const email = (creds?.email as string | undefined)?.toLowerCase().trim();
      const password = creds?.password as string | undefined;
      if (!email || !password) return null;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) return null;
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return null;
      return { id: user.id, email: user.email, name: user.name ?? undefined };
    },
  }),
];

if (process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      authorization: {
        params: { scope: "openid email profile", access_type: "offline", prompt: "consent" },
      },
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

if (process.env.META_APP_ID && process.env.META_APP_SECRET) {
  providers.push(
    Facebook({
      clientId: process.env.META_APP_ID,
      clientSecret: process.env.META_APP_SECRET,
      authorization: { params: { scope: "email public_profile" } },
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/signup" },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.uid = user.id;
      // OAuth sign-in: ensure a User row exists via adapter; stamp provider.
      return token;
    },
    async session({ session, token }) {
      if (token.uid && session.user) {
        session.user.id = token.uid as string;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
