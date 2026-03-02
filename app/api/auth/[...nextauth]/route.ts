/**
 * NextAuth.js v5 API Route (catch-all)
 * Handles: /api/auth/signin, /api/auth/signout, /api/auth/callback, etc.
 */

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
