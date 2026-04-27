# =============================================================================
# Backend Kore Tech — Dockerfile PROD (multi-stage)
#
# Stage 1 (builder): instala dev deps, gera Prisma client, compila TS
# Stage 2 (runner):  só prod deps + dist compilado + Prisma engine
#
# Final image: ~250MB. Sem ferramentas de build.
# =============================================================================

# -------- Stage 1: Build --------
FROM node:20-slim AS builder

RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cache de layer das deps
COPY package.json package-lock.json* ./
RUN npm ci

# Copia schema antes pra cachear o prisma generate
COPY prisma ./prisma
RUN npx prisma generate

# Copia o resto e compila
COPY . .
RUN npm run build

# -------- Stage 2: Runtime --------
FROM node:20-slim AS runner

RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates tini \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

# Só prod deps (npm ci --omit=dev é o jeito moderno).
# tsx mora em "dependencies" (lição #03 do Miami) pra `prisma db seed` rodar
# em prod sem erro silencioso de "command not found".
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Prisma client gerado + schema (precisa do schema pra migrate deploy)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma  ./node_modules/@prisma
COPY --from=builder /app/prisma                ./prisma
COPY --from=builder /app/dist                  ./dist

# Tini como init
ENTRYPOINT ["/usr/bin/tini", "--"]

EXPOSE 4001

# Aplica migrations pendentes ANTES de subir (no-op se já em dia).
# IMPORTANTE: NÃO incluir `npx prisma db seed` aqui — sobrescreve edições
# do admin a cada deploy (lição #04 do Miami). Pra rodar seed: `railway run`.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
