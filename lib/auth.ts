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
import Credentials from "next-auth/providers/credentials";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

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

// Demo Credentials — always available (no database dependency)
providers.push(
  Credentials({
    id: "demo-login",
    name: "Demo Login",
    credentials: {
      name: { label: "Your Name", type: "text", placeholder: "Demo User" },
    },
    async authorize(credentials) {
      // Simple demo login — no database needed
      const displayName =
        (credentials?.name as string)?.trim() || "Demo User";
      const slug = displayName.toLowerCase().replace(/\s+/g, "-");

      console.log("[Auth] Demo login for:", displayName);

      return {
        id: `demo-${slug}`,
        name: displayName,
        email: `${slug}@demo.local`,
      };
    },
  })
);

// ── NextAuth Configuration ────────────────────────────────────
const authConfig: NextAuthConfig = {
  // NOTE: PrismaAdapter removed — it conflicts with Credentials provider in
  // NextAuth v5 (tries to create Account records with missing OAuth fields).
  // Users are managed manually in the authorize() callback via Prisma.
  // When Azure AD OAuth is added, the adapter can be re-enabled.

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
        token.role = "demo";
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
