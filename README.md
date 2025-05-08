API de Restaurantes

Características principales

Gestión de usuarios

CRUD de restaurantes

Administración de menús

Sistema de reseñas y calificaciones

Recomendaciones personalizadas

Tecnologías usadas

Node.js + Express para el servidor
MySQL como base de datos relacional
EJS para renderizar vistas (aunque la mayor parte es API)
JWT para el manejo seguro de sesiones
Estructura basada en MVC para mantener todo ordenado
Cómo arrancar el proyecto

Clona este repositorio

git clone https://github.com/Brayan1299/Restaurantes_API.git cd Restaurantes_API/Projec_restaurantes

Instala dependencias

npm install

Configura tus variables de entorno Crea un archivo .env en la raíz con estos datos (ajústalos a tu entorno):

DB_HOST=localhost DB_USER=root DB_PASSWORD= DB_NAME=restaurantes_db JWT_SECRET=tu_secreto

Inicia el servidor

npm start

Por defecto quedará en http://localhost:3000.

Licencia

MIT – Puedes usarlo libremente si te sirve.
