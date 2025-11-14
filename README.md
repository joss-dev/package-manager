# 📦 Order Manager - Sistema de Gestión de Pedidos

Sistema completo de gestión de pedidos con autenticación, ABM de productos, clientes y pedidos con validación de stock.

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

## 📑 Tabla de Contenidos

- [Stack Tecnológico](#-stack-tecnológico)
- [Requisitos Previos](#-requisitos-previos)
- [Inicio Rápido con Docker](#-inicio-rápido-con-docker-recomendado)
- [Ejecución Local (Sin Docker)](#-local-sin-docker)
- [Documentación API](#-documentación-api)
- [Usuarios de Prueba](#-usuarios-de-prueba)
- [Testing](#-testing)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Comandos Útiles](#-docker---comandos-útiles)
- [Troubleshooting](#-troubleshooting)
- [Deployment](#-deployment)

## 🛠️ Stack Tecnológico

### Backend
- **NestJS** - Framework Node.js
- **TypeScript** - Lenguaje tipado
- **PostgreSQL** - Base de datos relacional
- **Prisma ORM** - Object-Relational Mapping
- **JWT** - Autenticación con tokens
- **Swagger** - Documentación API

### Frontend
- **React** - Biblioteca UI
- **Vite** - Build tool y dev server
- **TypeScript** - Lenguaje tipado
- **Tailwind CSS** - Framework CSS
- **React Router** - Enrutamiento
- **Zod** - Validación de esquemas

## 📋 Requisitos Previos

- **Node.js** >= 20.x
- **npm** >= 10.x
- **Docker** y **Docker Compose** (para ejecución con contenedores)
- **PostgreSQL** 16 (si se ejecuta sin Docker)

## 🚀 Inicio Rápido con Docker (Recomendado)

### 1. Clonar el repositorio

```bash
git clone https://github.com/joss-dev/package-manager.git
cd package-manager
```

> **Requisito**: Tener Docker Desktop instalado y en ejecución

### 2. Configurar variables de entorno

#### Backend (backend/.env)
Copia el archivo de ejemplo y ajusta los valores:

```bash
cd backend
cp .env.example .env
```

**Variables requeridas:**

```env
# Application Configuration
NODE_ENV=development
PORT=8082

# Database Configuration (for Docker)
DATABASE_URL="postgresql://postgres:admin@db:5432/orders?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-32-chars"
JWT_EXPIRATION="7d"

# CORS Configuration
FRONTEND_URL="http://localhost:5173"
```

> **Nota**: Para ejecución local sin Docker, cambiar `@db:5432` por `@localhost:5432`

#### Frontend (frontend/.env)
```bash
cd ../frontend
cp .env.example .env
```

**Variables requeridas:**

```env
# API Configuration
VITE_API_URL=http://localhost:8082
```

### 3. Iniciar el proyecto con Docker

Desde la raíz del proyecto:

```bash
# Construir e iniciar todos los servicios
docker-compose up --build

# O en modo detached (segundo plano)
docker-compose up -d --build
```

Esto iniciará:
- **PostgreSQL** en `localhost:5432`
- **Backend** en `http://localhost:8082` (con datos de prueba pre-cargados)
- **Frontend** en `http://localhost:5173`

> **✨ Nota**: El seed se ejecuta automáticamente, creando usuarios, productos, clientes y pedidos de prueba.

### 4. Acceder a la aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8082
- **Swagger Docs**: http://localhost:8082/docs

**👤 Usuarios de prueba pre-cargados:**
- Email: `admin@example.com` | Password: `123456`
- Email: `seller@example.com` | Password: `123456`

### 5. Detener los servicios

```bash
# Detener contenedores
docker-compose down

# Detener y eliminar volúmenes (borra datos de BD)
docker-compose down -v
```

## 💻 Local (Sin Docker)

Si prefieres ejecutar sin Docker:

### Requisitos
- PostgreSQL 16 instalado y ejecutándose
- Node.js 20+

### 1. Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar .env con host localhost
cp .env.example .env
# Editar .env: DATABASE_URL="postgresql://postgres:admin@localhost:5432/orders?schema=public"

# Ejecutar migraciones
npx prisma generate
npx prisma migrate dev

# Iniciar servidor
npm run start:dev
```

### 2. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar .env
cp .env.example .env

# Iniciar aplicación
npm run dev
```

## 🧪 Testing

### Backend - Unit Tests
```bash
cd backend
npm run test:unit
```

### Backend - Integration Tests
```bash
cd backend
npm run test:integration
```

## 📚 Documentación API

Una vez iniciado el backend, la documentación interactiva de Swagger está disponible en:

**http://localhost:8082/docs**

### 🔌 Endpoints Principales

#### Autenticación (`/auth`)
- `POST /auth/register` - Registrar nuevo usuario
  ```json
  {
    "email": "usuario@ejemplo.com",
    "password": "password123"
  }
  ```
- `POST /auth/login` - Iniciar sesión
  ```json
  {
    "email": "usuario@ejemplo.com",
    "password": "password123"
  }
  ```
- `GET /auth/me` - Obtener usuario actual (requiere autenticación)
- `POST /auth/logout` - Cerrar sesión

#### Productos (`/products`)
- `POST /products` - Crear producto
- `GET /products` - Listar productos (con filtros, búsqueda, paginación)
  - Query params: `search`, `page`, `limit`, `sortBy`, `order`
- `GET /products/:id` - Obtener producto por ID
- `PATCH /products/:id` - Actualizar producto
- `DELETE /products/:id` - Eliminar producto

#### Clientes (`/customers`)
- `POST /customers` - Crear cliente
- `GET /customers` - Listar clientes (con filtros, búsqueda, paginación)
  - Query params: `search`, `page`, `limit`
- `GET /customers/:id` - Obtener cliente por ID
- `PUT /customers/:id` - Actualizar cliente
- `DELETE /customers/:id` - Eliminar cliente

#### Pedidos (`/orders`)
- `POST /orders` - Crear pedido
  ```json
  {
    "customerId": 1,
    "items": [
      { "productId": 1, "qty": 2 },
      { "productId": 2, "qty": 1 }
    ]
  }
  ```
- `GET /orders` - Listar pedidos (con filtros)
  - Query params: `status`, `customerId`, `page`, `limit`
- `GET /orders/:id` - Obtener pedido por ID
- `POST /orders/:id/confirm` - Confirmar pedido (descuenta stock)

### 👤 Datos de Prueba

**Con Docker, los datos se crean automáticamente** al iniciar por primera vez. Incluyen:

- **3 usuarios** con contraseña `123456`:
  - `admin@example.com`
  - `seller@example.com`
  - `buyer@example.com`
- **10 productos** aleatorios con stock variado
- **5 clientes** con información completa
- **Múltiples pedidos** en diferentes estados (PENDING, CONFIRMED)

#### Seed Manual (Solo si ejecutas sin Docker)

Si ejecutas localmente sin Docker, crea los datos con:

```bash
cd backend
npm run seed
```

#### Ver y Editar Datos con Prisma Studio

Para visualizar y gestionar los datos gráficamente:

```bash
# Con Docker
docker-compose exec backend npx prisma studio

# Sin Docker
cd backend
npx prisma studio
```

Prisma Studio abrirá en http://localhost:5555

## 🗄️ Estructura del Proyecto

```
order-manager/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Esquema de base de datos
│   ├── src/
│   │   ├── auth/                # Módulo de autenticación
│   │   ├── customer/            # Módulo de clientes
│   │   ├── product/             # Módulo de productos
│   │   ├── order/               # Módulo de pedidos
│   │   └── main.ts              # Entry point
│   ├── Dockerfile               # Dockerfile del backend
│   ├── .env.example             # Variables de entorno ejemplo
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # Componentes React
│   │   ├── pages/               # Páginas de la aplicación
│   │   ├── services/            # Servicios API
│   │   ├── contexts/            # Context API (Auth)
│   │   └── utils/               # Utilidades y validaciones
│   ├── Dockerfile               # Dockerfile del frontend
│   ├── .env.example             # Variables de entorno ejemplo
│   └── package.json
├── docker-compose.yml           # Compose para desarrollo
└── README.md                    # Este archivo
```

## 🔐 Credenciales Predeterminadas

### Base de Datos (Docker)
- **Host**: localhost
- **Puerto**: 5432
- **Usuario**: postgres
- **Contraseña**: admin
- **Base de datos**: orders

### Aplicación
Después del primer inicio, puedes registrar un usuario en:
- Registro: http://localhost:5173/register
- Login: http://localhost:5173/login

## 🐳 Docker - Comandos Útiles

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Reconstruir solo un servicio
docker-compose up -d --build backend

# Ejecutar comandos dentro de un contenedor
docker-compose exec backend sh
docker-compose exec frontend sh

# Ver estado de los servicios
docker-compose ps

# Limpiar todo (contenedores, volúmenes, redes)
docker-compose down -v --remove-orphans
```

## 🔧 Comandos Prisma Útiles

```bash
# Generar Prisma Client
npx prisma generate

# Crear una nueva migración
npx prisma migrate dev --name migration_name

# Abrir Prisma Studio (GUI para ver datos)
npx prisma studio

# Resetear base de datos (desarrollo)
npx prisma migrate reset
```

## 📝 Funcionalidades

### ✅ Autenticación
- Registro y login con JWT
- Protección de rutas
- Cookies httpOnly

### ✅ Productos (ABM)
- CRUD completo de productos
- Validación de SKU único
- Control de stock
- Filtros, búsqueda y paginación
- Ordenamiento

### ✅ Clientes (ABM)
- CRUD completo de clientes
- Validación de email único
- Filtros y búsqueda

### ✅ Pedidos
- Crear pedidos con múltiples productos
- Cálculo automático de totales
- Validación de stock disponible
- Confirmación con descuento de stock
- Estados: PENDING, CONFIRMED
- Vista detallada con modales

### ✅ Testing
- Unit tests (totales y stock)
- Integration tests (creación y confirmación)

## 🐛 Troubleshooting

### Error: "Cannot connect to the database"
- Verifica que PostgreSQL esté corriendo
- Revisa que `DATABASE_URL` en `.env` sea correcto
- Si usas Docker, asegúrate que el servicio `db` esté activo: `docker-compose ps`

### Error: "Port 5432 already in use"
- Detén cualquier instancia local de PostgreSQL: `sudo service postgresql stop` (Linux) o detén el servicio en Windows
- O cambia el puerto en `docker-compose.yml`

### Error: "CORS policy"
- Verifica que `FRONTEND_URL` en backend `.env` coincida con la URL del frontend
- Revisa que `VITE_API_URL` en frontend `.env` apunte al backend correcto

### Frontend no se conecta al backend en Docker
- Asegúrate de usar `http://localhost:8082` (no `http://backend:8082`)
- El navegador necesita acceder al backend desde el host, no desde dentro de Docker

## 📦 Tecnologías Utilizadas

- **Backend**: NestJS 11, TypeScript, Prisma ORM 6.19, PostgreSQL 16, JWT, Swagger
- **Frontend**: React 19, Vite 7, TypeScript, Tailwind CSS 3, React Router 7, Zod
- **Testing**: Jest, ts-jest
- **DevOps**: Docker, Docker Compose

## 🤖 Uso de Inteligencia Artificial

Para este proyecto utilice **GitHub Copilot (Claude Sonnet 4.5)** como herramienta de asistencia durante el desarrollo.

### Partes generadas/mejoradas con IA:
- **Análisis inicial del proyecto**: Estructura y arquitectura de la aplicación
- **Documentación (README.md)**: Generación de documentación completa con instrucciones de instalación, configuración y uso
- Configuración de Docker y docker-compose

### Desarrollo manual:
- Toda la lógica de negocio y funcionalidades core
- Implementación de tests unitarios e integración
