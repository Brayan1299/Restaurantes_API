
const Recomendacion = require('../models/Recomendacion');

exports.crearRecomendacion = async (req, res) => {
  try {
    const { restauranteId, titulo, descripcion } = req.body;
    const usuarioId = req.userData.userId;
    const result = await Recomendacion.create(usuarioId, restauranteId, titulo, descripcion);
    res.status(201).json({ message: 'Recomendación creada exitosamente', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerRecomendaciones = async (req, res) => {
  try {
    const recomendaciones = await Recomendacion.findAll();
    res.json(recomendaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
