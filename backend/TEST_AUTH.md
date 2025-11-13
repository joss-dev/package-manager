# Pruebas de Autenticación

## ✅ Implementado

### 1. Registro de Usuario
```bash
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Validaciones:**
- ✅ Email único (en schema Prisma + validación en servicio)
- ✅ Password mínimo 8 caracteres
- ✅ Hash con bcrypt
- ✅ Retorna JWT en cookies y response

**Respuestas:**
- 201: Usuario creado exitosamente
- 409: Email ya registrado (ConflictException)
- 400: Validación fallida

---

### 2. Login
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Validaciones:**
- ✅ Verifica email existe
- ✅ Compara password hasheado
- ✅ Retorna JWT en cookies y response

**Respuestas:**
- 200: Login exitoso
- 401: Credenciales inválidas

---

### 3. Usuario Actual (NUEVO ✨)
```bash
GET http://localhost:3000/auth/me
Cookie: access_token=<jwt_token>
```

**Funcionamiento:**
- ✅ Protegido con JwtAuthGuard
- ✅ Extrae userId del token JWT
- ✅ Retorna datos del usuario sin passwordHash

**Respuestas:**
- 200: Datos del usuario
  ```json
  {
    "id": 1,
    "email": "test@example.com",
    "createdAt": "2025-11-13T..."
  }
  ```
- 401: Token inválido o expirado
- 404: Usuario no encontrado

---

### 4. Logout
```bash
POST http://localhost:3000/auth/logout
```

**Funcionamiento:**
- ✅ Limpia cookies access_token y refresh_token

**Respuestas:**
- 200: Sesión cerrada correctamente

---

## 🔐 Flujo de Autenticación

1. **Registro** → Crea usuario + retorna JWT
2. **Login** → Valida credenciales + retorna JWT
3. **Usar JWT** → Se envía automáticamente en cookies
4. **GET /auth/me** → Obtiene usuario actual con JWT
5. **Rutas protegidas** → Usar `@UseGuards(JwtAuthGuard)` + `@GetUser()`
6. **Logout** → Limpia cookies

---

## 📝 Notas de Implementación

### Validación de Email Único
1. **Nivel Schema (Prisma)**: `@unique` en el campo email
2. **Nivel Servicio**: Verificación manual antes de crear usuario
3. **Excepción**: ConflictException con mensaje claro

### JWT Strategy
- Extrae token de cookies (`access_token`)
- Valida con JWT_SECRET
- Retorna payload: `{ userId, email }`

### Decorador GetUser
- Soporta extracción completa: `@GetUser()`
- Soporta campo específico: `@GetUser('userId')`
- Tipado con TypeScript

### Hash de Contraseñas
- Usa bcrypt
- Salt rounds configurable via env (default: 10)
- Variable: `BCRYPT_SALT_ROUNDS`
