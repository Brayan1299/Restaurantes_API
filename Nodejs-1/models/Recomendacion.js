
const db = require('../config/database');

class Recomendacion {
  static async create(usuarioId, restauranteId, titulo, descripcion) {
    const [result] = await db.execute(
      'INSERT INTO recomendaciones (usuario_id, restaurante_id, titulo, descripcion) VALUES (?, ?, ?, ?)',
      [usuarioId, restauranteId, titulo, descripcion]
    );
    return result;
  }

  static async findAll() {
    const [recomendaciones] = await db.execute(
      'SELECT r.*, u.nombre as usuario_nombre, res.nombre as restaurante_nombre FROM recomendaciones r JOIN usuarios u ON r.usuario_id = u.id JOIN restaurantes res ON r.restaurante_id = res.id'
    );
    return recomendaciones;
  }
}

module.exports = Recomendacion;
const db = require('../config/database');

class Recomendacion {
  static async create(usuarioId, restauranteId, titulo, descripcion) {
    const [result] = await db.execute(
      'INSERT INTO recomendaciones (usuario_id, restaurante_id, titulo, descripcion) VALUES (?, ?, ?, ?)',
      [usuarioId, restauranteId, titulo, descripcion]
    );
    return result;
  }

  static async findAll() {
    const [recomendaciones] = await db.execute(
      `SELECT r.*, u.nombre as usuario_nombre, res.nombre as restaurante_nombre
       FROM recomendaciones r 
       JOIN usuarios u ON r.usuario_id = u.id
       JOIN restaurantes res ON r.restaurante_id = res.id
       ORDER BY r.created_at DESC`
    );
    return recomendaciones;
  }
}

module.exports = Recomendacion;
