# ---------- STAGE 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# ---------- STAGE 2: Run ----------
FROM node:20-alpine AS runner

WORKDIR /app

# Solo instalamos dependencias necesarias para producción
COPY package*.json ./
RUN npm ci --omit=dev

# Copiamos prisma + build
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Ejecutar migraciones y arrancar app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
