/**
 * NextAuth.js v5 Configuration
 *
 * Two providers:
 * 1. Azure AD (Microsoft SSO) — active ONLY when env vars are set
 * 2. Demo Credentials — always available for local dev / demo mode
 *
 * When Tim configures the Westernacher Azure AD, just add 3 env vars and SSO goes live.
 */

import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

// ── Azure AD Configuration Check ─────────────────────────────
export const isAzureConfigured = Boolean(
  process.env.AZURE_AD_CLIENT_ID &&
    process.env.AZURE_AD_CLIENT_SECRET &&
    process.env.AZURE_AD_TENANT_ID
);

// ── Build Providers Array ─────────────────────────────────────
const providers: NextAuthConfig["providers"] = [];

// Azure AD — only added when credentials exist
if (isAzureConfigured) {
  providers.push(
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
      },
    })
  );
}

// Demo Credentials — always available
providers.push(
  CredentialsProvider({
    id: "demo-login",
    name: "Demo Login",
    credentials: {
      name: { label: "Your Name", type: "text", placeholder: "Demo User" },
    },
    async authorize(credentials) {
      const displayName =
        (credentials?.name as string)?.trim() || "Demo User";

      // Find or create a demo user in the database
      try {
        let user = await prisma.user.findFirst({
          where: {
            email: `demo-${displayName.toLowerCase().replace(/\s+/g, "-")}@demo.local`,
            role: "demo",
          },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: displayName,
              email: `demo-${displayName.toLowerCase().replace(/\s+/g, "-")}@demo.local`,
              role: "demo",
            },
          });
        } else {
          // Update name if changed
          user = await prisma.user.update({
            where: { id: user.id },
            data: { name: displayName },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      } catch (error) {
        console.error("[Auth] Demo user creation failed:", error);
        return null;
      }
    },
  })
);

// ── NextAuth Configuration ────────────────────────────────────
const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),

  // JWT strategy required for credentials provider
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },

  providers,

  pages: {
    signIn: "/auth/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, add user data to JWT
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as Record<string, unknown>).role as string || "user";
      }
      return token;
    },

    async session({ session, token }) {
      // Pass JWT data to session (available in useSession())
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as Record<string, unknown>).role = token.role as string;
      }
      return session;
    },
  },
};

// ── Export NextAuth handlers + utilities ────────────────────────
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
