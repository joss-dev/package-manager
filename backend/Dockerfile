# Etapa de desarrollo
FROM node:20-alpine AS development

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Exponer puerto
EXPOSE 3000

# Comando por defecto para desarrollo
CMD ["npm", "run", "start:dev"]

# Etapa de build
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Compilar la aplicación
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS production

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar build de la etapa anterior
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Copiar schema de Prisma para migraciones
COPY prisma ./prisma

# Exponer puerto
EXPOSE 3000

# Comando por defecto para producción
CMD ["npm", "run", "start:prod"]
