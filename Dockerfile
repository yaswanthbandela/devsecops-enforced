# ── Stage 1: Dependencies ────────────────────────────────────
FROM node:lts-alpine AS deps

RUN apk update && apk upgrade --no-cache
RUN npm install -g pnpm@9

WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod


# ── Stage 2: Runtime ─────────────────────────────────────────
FROM node:lts-alpine AS runner

RUN apk update && apk upgrade --no-cache

# 🔐 Remove npm entirely - not needed at runtime, eliminates bundled vulnerable tar
RUN rm -rf \
    /usr/local/lib/node_modules/npm \
    /usr/local/bin/npm \
    /usr/local/bin/npx

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY src/ ./src/
COPY package.json ./

USER appuser
EXPOSE 3000
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/index.js"]
