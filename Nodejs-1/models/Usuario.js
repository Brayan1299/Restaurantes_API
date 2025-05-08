
const db = require('../config/database');
const bcrypt = require('bcrypt');

class Usuario {
  static async create(nombre, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
      [nombre, email, hashedPassword]
    );
    return result;
  }

  static async findByEmail(email) {
    const [users] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    return users[0];
  }
}

module.exports = Usuario;
