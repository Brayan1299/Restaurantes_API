
const db = require('../config/database');

class Resena {
  static async create(usuarioId, restauranteId, calificacion, comentario) {
    const [result] = await db.execute(
      'INSERT INTO resenas (usuario_id, restaurante_id, calificacion, comentario) VALUES (?, ?, ?, ?)',
      [usuarioId, restauranteId, calificacion, comentario]
    );
    return result;
  }

  static async findByRestaurante(restauranteId) {
    const [resenas] = await db.execute(
      'SELECT r.*, u.nombre as usuario_nombre FROM resenas r JOIN usuarios u ON r.usuario_id = u.id WHERE r.restaurante_id = ?',
      [restauranteId]
    );
    return resenas;
  }
}

module.exports = Resena;
const db = require('../config/database');

class Resena {
  static async create(usuarioId, restauranteId, calificacion, comentario) {
    const [result] = await db.execute(
      'INSERT INTO resenas (usuario_id, restaurante_id, calificacion, comentario) VALUES (?, ?, ?, ?)',
      [usuarioId, restauranteId, calificacion, comentario]
    );
    return result;
  }

  static async findByRestaurante(restauranteId) {
    const [resenas] = await db.execute(
      `SELECT r.*, u.nombre as usuario_nombre 
       FROM resenas r 
       JOIN usuarios u ON r.usuario_id = u.id 
       WHERE r.restaurante_id = ?`,
      [restauranteId]
    );
    return resenas;
  }
}

module.exports = Resena;
