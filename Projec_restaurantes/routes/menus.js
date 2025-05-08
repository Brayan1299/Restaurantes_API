
const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, menuController.crearMenu);
router.get('/restaurante/:restauranteId', menuController.obtenerMenusPorRestaurante);

module.exports = router;
