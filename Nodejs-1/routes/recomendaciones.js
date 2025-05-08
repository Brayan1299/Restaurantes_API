
const express = require('express');
const router = express.Router();
const recomendacionController = require('../controllers/recomendacionController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, recomendacionController.crearRecomendacion);
router.get('/', recomendacionController.obtenerRecomendaciones);

module.exports = router;
