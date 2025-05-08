
const express = require('express');
const router = express.Router();
const resenaController = require('../controllers/resenaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, resenaController.crearResena);
router.get('/restaurante/:restauranteId', resenaController.obtenerResenasPorRestaurante);

module.exports = router;
