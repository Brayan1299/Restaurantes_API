
const Resena = require('../models/Resena');

exports.crearResena = async (req, res) => {
  try {
    const { restauranteId, calificacion, comentario } = req.body;
    const usuarioId = req.userData.userId;
    const result = await Resena.create(usuarioId, restauranteId, calificacion, comentario);
    res.status(201).json({ message: 'Reseña creada exitosamente', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerResenasPorRestaurante = async (req, res) => {
  try {
    const { restauranteId } = req.params;
    const resenas = await Resena.findByRestaurante(restauranteId);
    res.json(resenas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
