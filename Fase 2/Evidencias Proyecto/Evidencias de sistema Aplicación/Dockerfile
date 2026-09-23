# Versiones idénticas al entorno local (Node 24.21.0 LTS trae npm 11.19.0 incluido)
ARG NODE_VERSION=24.21.0
ARG TURBO_VERSION=2.11.2

# ---------- Base común ----------
FROM node:${NODE_VERSION}-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ---------- 1. Pruner: extrae del monorepo solo lo que necesita el backend ----------
FROM base AS pruner
ARG TURBO_VERSION
RUN npm install -g turbo@${TURBO_VERSION}
COPY . .
RUN turbo prune backend --docker

# ---------- 2. Builder: instala todas las dependencias y compila ----------
FROM base AS builder
COPY --from=pruner /app/.npmrc ./
COPY --from=pruner /app/out/json/ ./
RUN npm ci --engine-strict=false
COPY --from=pruner /app/out/full/ ./
RUN npx turbo run build --filter=backend

# ---------- 3. Dependencias de producción (sin devDependencies) ----------
FROM base AS prod-deps
COPY --from=pruner /app/.npmrc ./
COPY --from=pruner /app/out/json/ ./
RUN npm ci --omit=dev --engine-strict=false && mkdir -p apps/backend/node_modules

# ---------- 4. Runner: imagen final mínima ----------
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=prod-deps --chown=node:node /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder --chown=node:node /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder --chown=node:node /app/apps/backend/dist ./apps/backend/dist
WORKDIR /app/apps/backend
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
