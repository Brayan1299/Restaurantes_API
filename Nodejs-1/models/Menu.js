
const db = require('../config/database');

class Menu {
  static async create(restauranteId, nombre, descripcion, precio) {
    const [result] = await db.execute(
      'INSERT INTO menus (restaurante_id, nombre, descripcion, precio) VALUES (?, ?, ?, ?)',
      [restauranteId, nombre, descripcion, precio]
    );
    return result;
  }

  static async findByRestaurante(restauranteId) {
    const [menus] = await db.execute('SELECT * FROM menus WHERE restaurante_id = ?', [restauranteId]);
    return menus;
  }
}

module.exports = Menu;
const db = require('../config/database');

class Menu {
  static async create(restauranteId, nombre, descripcion, precio) {
    const [result] = await db.execute(
      'INSERT INTO menus (restaurante_id, nombre, descripcion, precio) VALUES (?, ?, ?, ?)',
      [restauranteId, nombre, descripcion, precio]
    );
    return result;
  }

  static async findByRestaurante(restauranteId) {
    const [menus] = await db.execute(
      'SELECT * FROM menus WHERE restaurante_id = ?',
      [restauranteId]
    );
    return menus;
  }

  static async update(id, nombre, descripcion, precio) {
    const [result] = await db.execute(
      'UPDATE menus SET nombre = ?, descripcion = ?, precio = ? WHERE id = ?',
      [nombre, descripcion, precio, id]
    );
    return result;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM menus WHERE id = ?', [id]);
    return result;
  }
}

module.exports = Menu;
