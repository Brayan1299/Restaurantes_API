**API de Restaurantes**

 **Características principales**

   1. Gestión de usuarios

   2. CRUD de restaurantes

   3. Administración de menús

   4. Sistema de reseñas y calificaciones

   5. Recomendaciones personalizadas

      
 **Tecnologías usadas**

   1. **Node.js** + **Express** para el servidor
   2. **MySQL** como base de datos relacional
   3. **EJS** para renderizar vistas (aunque la mayor parte es API)
   4. **JWT** para el manejo seguro de sesiones
   5. Estructura basada en MVC para mantener todo ordenado


   **Cómo arrancar el proyecto**

   1. **Clona este repositorio**


      git clone https://github.com/Brayan1299/Restaurantes_API.git
      cd Restaurantes_API/Projec_restaurantes
      

   2. **Instala dependencias**


      npm install


   3. **Configura tus variables de entorno**
      Crea un archivo `.env` en la raíz con estos datos (ajústalos a tu entorno):


      DB_HOST=localhost
      DB_USER=root
      DB_PASSWORD=
      DB_NAME=restaurantes_db
      JWT_SECRET=tu_secreto


   4. **Inicia el servidor**

      npm start

      Por defecto quedará en `http://localhost:3000`.


   **Licencia**

   MIT – Puedes usarlo libremente si te sirve.
