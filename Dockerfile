# ── Stage 1: Install dependencies ────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci

# ── Stage 2: Build the application ──────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (uses linux-musl-openssl-3.0.x binary)
RUN npx prisma generate

# Build Next.js — 3 GB heap (leaves ~1 GB for OS/Docker in a 4 GB CI container)
RUN NODE_OPTIONS="--max_old_space_size=3072" npm run build

# ── Stage 3: Production runner ──────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone server + static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma engines (must be present at runtime)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Copy Prisma CLI and package.json for runtime migrations
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

# Copy Prisma schema + config (needed for runtime migrations if desired)
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
