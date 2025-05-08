
const db = require('../config/database');

class Restaurante {
  static async create(nombre, direccion, telefono, categoria) {
    const [result] = await db.execute(
      'INSERT INTO restaurantes (nombre, direccion, telefono, categoria) VALUES (?, ?, ?, ?)',
      [nombre, direccion, telefono, categoria]
    );
    return result;
  }

  static async findAll(categoria, ubicacion, precioMin, precioMax, calificacionMin) {
    let query = `
      SELECT r.*, AVG(res.calificacion) as calificacion_promedio 
      FROM restaurantes r 
      LEFT JOIN resenas res ON r.id = res.restaurante_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (categoria) {
      conditions.push('r.categoria = ?');
      params.push(categoria);
    }
    
    if (ubicacion) {
      conditions.push('r.direccion LIKE ?');
      params.push(`%${ubicacion}%`);
    }
    
    if (precioMin) {
      conditions.push('r.precio_promedio >= ?');
      params.push(precioMin);
    }
    
    if (precioMax) {
      conditions.push('r.precio_promedio <= ?');
      params.push(precioMax);
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY r.id';
    
    if (calificacionMin) {
      query += ' HAVING calificacion_promedio >= ?';
      params.push(calificacionMin);
    }
    
    const [restaurantes] = await db.execute(query, params);
    return restaurantes;
  }

  static async findById(id) {
    const [restaurantes] = await db.execute('SELECT * FROM restaurantes WHERE id = ?', [id]);
    return restaurantes[0];
  }
}

module.exports = Restaurante;
