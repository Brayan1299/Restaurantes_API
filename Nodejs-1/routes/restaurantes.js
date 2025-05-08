
const express = require('express');
const router = express.Router();
const restauranteController = require('../controllers/restauranteController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, restauranteController.crearRestaurante);
router.get('/', restauranteController.obtenerRestaurantes);
router.put('/:id', authMiddleware, restauranteController.actualizarRestaurante);
router.delete('/:id', authMiddleware, restauranteController.eliminarRestaurante);

module.exports = router;
