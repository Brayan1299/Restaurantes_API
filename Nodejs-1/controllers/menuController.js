
const Menu = require('../models/Menu');

exports.crearMenu = async (req, res) => {
  try {
    const { restauranteId, nombre, descripcion, precio } = req.body;
    const result = await Menu.create(restauranteId, nombre, descripcion, precio);
    res.status(201).json({ message: 'Menú creado exitosamente', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerMenusPorRestaurante = async (req, res) => {
  try {
    const { restauranteId } = req.params;
    const menus = await Menu.findByRestaurante(restauranteId);
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const Menu = require('../models/Menu');

exports.crearMenu = async (req, res) => {
  try {
    const { restauranteId, nombre, descripcion, precio } = req.body;
    const result = await Menu.create(restauranteId, nombre, descripcion, precio);
    res.status(201).json({ message: 'Menú creado exitosamente', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerMenusPorRestaurante = async (req, res) => {
  try {
    const { restauranteId } = req.params;
    const menus = await Menu.findByRestaurante(restauranteId);
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.actualizarMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio } = req.body;
    await Menu.update(id, nombre, descripcion, precio);
    res.json({ message: 'Menú actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.eliminarMenu = async (req, res) => {
  try {
    const { id } = req.params;
    await Menu.delete(id);
    res.json({ message: 'Menú eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
