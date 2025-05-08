
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));

// Configurar CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

// Rutas de la API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurantes', require('./routes/restaurantes'));
app.use('/api/menus', require('./routes/menus'));
app.use('/api/resenas', require('./routes/resenas'));
app.use('/api/recomendaciones', require('./routes/recomendaciones'));

// Ruta principal
app.get('/', (req, res) => {
  res.render('index', {
    title: 'API Gastronómica'
  });
});

// Manejo de errores
const errorHandler = require('./middlewares/errorMiddleware');
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).render('error', {
    message: 'Página no encontrada'
  });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
  console.log(`También puedes acceder usando http://localhost:${PORT}`);
});
