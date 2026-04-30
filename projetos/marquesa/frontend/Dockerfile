# =============================================================================
# Marquesa Frontend — Dockerfile multi-stage (Next.js standalone)
#
# IMPORTANTE: build context é o diretório do PROJETO (projetos/marquesa/), não
# frontend/. Isso é necessário porque o frontend importa textos de ../copy/.
#
# Build (manual):
#   docker build -f frontend/Dockerfile -t marquesa-web .
#   (rodar de dentro de projetos/marquesa/)
#
# O docker-compose.prod.yml já passa o context correto.
# =============================================================================

FROM node:20-alpine AS deps
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Copia o frontend pra /app e o copy/ pro irmão (../copy a partir de /app)
COPY frontend/ ./
COPY copy/ /copy/
# Symlink pra resolver ../copy relativo ao /app/ que é onde o build roda
RUN mkdir -p /app/.. && ln -sf /copy /copy_alias
# O microcopy é importado via ../copy. /app/../copy = /copy — já existe acima.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
