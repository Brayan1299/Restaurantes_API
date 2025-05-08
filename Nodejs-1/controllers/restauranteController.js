
const Restaurante = require('../models/Restaurante');

exports.crearRestaurante = async (req, res) => {
  try {
    const { nombre, direccion, telefono, categoria, precio_promedio } = req.body;
    const result = await Restaurante.create(nombre, direccion, telefono, categoria, precio_promedio);
    res.status(201).json({ message: 'Restaurante creado exitosamente', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerRestaurantes = async (req, res) => {
  try {
    const { categoria, ubicacion, precioMin, precioMax, calificacionMin } = req.query;
    const restaurantes = await Restaurante.findAll(categoria, ubicacion, precioMin, precioMax, calificacionMin);
    res.json(restaurantes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.actualizarRestaurante = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, direccion, telefono, categoria } = req.body;
    await Restaurante.update(id, nombre, direccion, telefono, categoria);
    res.json({ message: 'Restaurante actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.eliminarRestaurante = async (req, res) => {
  try {
    const { id } = req.params;
    await Restaurante.delete(id);
    res.json({ message: 'Restaurante eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
