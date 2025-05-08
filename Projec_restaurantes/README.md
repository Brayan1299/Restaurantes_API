
# API de Restaurantes

API REST para la gestión de restaurantes, menús, reseñas y recomendaciones.

## Características

- Gestión de usuarios (registro, autenticación)
- CRUD de restaurantes
- Gestión de menús por restaurante
- Sistema de reseñas y calificaciones
- Sistema de recomendaciones
- Filtrado por categoría, ubicación y precio

## Tecnologías

- Node.js
- Express
- MySQL
- EJS (para las vistas)
- JWT (autenticación)

## Estructura del Proyecto

```
├── config/         # Configuración de la base de datos
├── controllers/    # Controladores de la aplicación
├── middlewares/   # Middlewares personalizados
├── models/        # Modelos de datos
├── public/        # Archivos estáticos
├── routes/        # Rutas de la API
├── utils/         # Utilidades y helpers
└── views/         # Vistas EJS
```

## Instalación

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno en `.env`:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=restaurantes_db
   JWT_SECRET=tu_secreto
   ```
4. Iniciar el servidor: `npm start`

## Endpoints de la API

### Autenticación
- POST /api/auth/register - Registro de usuario
- POST /api/auth/login - Inicio de sesión

### Restaurantes
- GET /api/restaurantes - Listar restaurantes
- POST /api/restaurantes - Crear restaurante
- PUT /api/restaurantes/:id - Actualizar restaurante
- DELETE /api/restaurantes/:id - Eliminar restaurante

### Menús
- GET /api/menus/restaurante/:id - Obtener menús por restaurante
- POST /api/menus - Crear menú
- PUT /api/menus/:id - Actualizar menú
- DELETE /api/menus/:id - Eliminar menú

### Reseñas
- GET /api/resenas/restaurante/:id - Obtener reseñas por restaurante
- POST /api/resenas - Crear reseña

### Recomendaciones
- GET /api/recomendaciones - Obtener recomendaciones
- POST /api/recomendaciones - Crear recomendación

## Licencia

MIT
