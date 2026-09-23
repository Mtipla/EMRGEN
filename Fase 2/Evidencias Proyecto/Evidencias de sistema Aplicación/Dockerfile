FROM node:24-alpine AS builder
WORKDIR /app
RUN npm install -g turbo
COPY package*.json ./
COPY turbo.json ./
COPY apps/backend/package*.json ./apps/backend/
RUN npm install
COPY . .
RUN npx turbo run build --filter=backend...

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY apps/backend/package*.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]