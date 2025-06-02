const database = require('../config/database');

class User {
    // Crear nuevo usuario
    static async create(userData) {
        try {
            const sql = `
                INSERT INTO users (name, email, password, phone, preferences, role)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            const result = await database.query(sql, [
                userData.name,
                userData.email,
                userData.password,
                userData.phone || null,
                JSON.stringify(userData.preferences || {}),
                userData.role || 'user'
            ]);

            return result.insertId;
        } catch (error) {
            console.error('Error creando usuario:', error);
            throw error;
        }
    }

    // Buscar usuario por ID
    static async findById(id) {
        try {
            const sql = `
                SELECT id, name, email, phone, preferences, role, created_at, updated_at, last_login
                FROM users 
                WHERE id = ?
            `;

            const result = await database.query(sql, [id]);

            if (result.length === 0) {
                return null;
            }

            const user = result[0];

            // Parsear preferences JSON
            if (user.preferences) {
                try {
                    user.preferences = JSON.parse(user.preferences);
                } catch (e) {
                    user.preferences = {};
                }
            } else {
                user.preferences = {};
            }

            return user;
        } catch (error) {
            console.error('Error buscando usuario por ID:', error);
            throw error;
        }
    }

    // Buscar usuario por email
    static async findByEmail(email) {
        try {
            const sql = `
                SELECT id, name, email, password, phone, preferences, role, created_at, updated_at, last_login
                FROM users 
                WHERE email = ?
            `;

            const result = await database.query(sql, [email]);

            if (result.length === 0) {
                return null;
            }

            const user = result[0];

            // Parsear preferences JSON
            if (user.preferences) {
                try {
                    user.preferences = JSON.parse(user.preferences);
                } catch (e) {
                    user.preferences = {};
                }
            } else {
                user.preferences = {};
            }

            return user;
        } catch (error) {
            console.error('Error buscando usuario por email:', error);
            throw error;
        }
    }

    // Actualizar usuario
    static async update(id, updateData) {
        try {
            const fields = [];
            const values = [];

            // Construir consulta dinámicamente
            if (updateData.name !== undefined) {
                fields.push('name = ?');
                values.push(updateData.name);
            }
            if (updateData.email !== undefined) {
                fields.push('email = ?');
                values.push(updateData.email);
            }
            if (updateData.password !== undefined) {
                fields.push('password = ?');
                values.push(updateData.password);
            }
            if (updateData.phone !== undefined) {
                fields.push('phone = ?');
                values.push(updateData.phone);
            }
            if (updateData.preferences !== undefined) {
                fields.push('preferences = ?');
                values.push(JSON.stringify(updateData.preferences));
            }
            if (updateData.role !== undefined) {
                fields.push('role = ?');
                values.push(updateData.role);
            }

            if (fields.length === 0) {
                throw new Error('No hay campos para actualizar');
            }

            fields.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id);

            const sql = `
                UPDATE users 
                SET ${fields.join(', ')}
                WHERE id = ?
            `;

            await database.query(sql, values);
            return true;
        } catch (error) {
            console.error('Error actualizando usuario:', error);
            throw error;
        }
    }

    // Actualizar último login
    static async updateLastLogin(id) {
        try {
            const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
            await database.query(sql, [id]);
            return true;
        } catch (error) {
            console.error('Error actualizando último login:', error);
            throw error;
        }
    }

    // Verificar si el email ya existe
    static async emailExists(email, excludeUserId = null) {
        try {
            let sql = 'SELECT id FROM users WHERE email = ?';
            const params = [email];

            if (excludeUserId) {
                sql += ' AND id != ?';
                params.push(excludeUserId);
            }

            const result = await database.query(sql, params);
            return result.length > 0;
        } catch (error) {
            console.error('Error verificando email:', error);
            throw error;
        }
    }

    // Eliminar usuario
    static async delete(id) {
        try {
            const sql = 'DELETE FROM users WHERE id = ?';
            await database.query(sql, [id]);
            return true;
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            throw error;
        }
    }

    // Obtener todos los usuarios con paginación
    static async findAll(pagination = {}, filters = {}) {
        try {
            let whereClause = '';
            const whereParams = [];

            // Filtros
            const conditions = [];

            if (filters.search) {
                conditions.push('(name LIKE ? OR email LIKE ?)');
                const searchTerm = `%${filters.search}%`;
                whereParams.push(searchTerm, searchTerm);
            }

            if (filters.role) {
                conditions.push('role = ?');
                whereParams.push(filters.role);
            }

            if (conditions.length > 0) {
                whereClause = 'WHERE ' + conditions.join(' AND ');
            }

            // Consulta para contar total
            const countSql = `SELECT COUNT(*) as total FROM users ${whereClause}`;
            const countResult = await database.query(countSql, whereParams);
            const total = countResult[0].total;

            // Consulta principal con paginación
            let sql = `
                SELECT id, name, email, phone, preferences, role, created_at, updated_at, last_login
                FROM users 
                ${whereClause}
                ORDER BY created_at DESC
            `;

            const queryParams = [...whereParams];

            if (pagination.limit) {
                sql += ' LIMIT ?';
                queryParams.push(pagination.limit);
            }

            if (pagination.offset) {
                sql += ' OFFSET ?';
                queryParams.push(pagination.offset);
            }

            const users = await database.query(sql, queryParams);

            // Parsear preferences para cada usuario
            users.forEach(user => {
                if (user.preferences) {
                    try {
                        user.preferences = JSON.parse(user.preferences);
                    } catch (e) {
                        user.preferences = {};
                    }
                } else {
                    user.preferences = {};
                }
            });

            return { users, total };
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            throw error;
        }
    }

    // Obtener estadísticas de usuarios
    static async getStats() {
        try {
            const sql = `
                SELECT 
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
                    COUNT(CASE WHEN role = 'restaurant_owner' THEN 1 END) as owner_count,
                    COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_count,
                    COUNT(CASE WHEN last_login > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as active_month,
                    COUNT(CASE WHEN created_at > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_month
                FROM users
            `;

            const result = await database.query(sql);
            return result[0];
        } catch (error) {
            console.error('Error obteniendo estadísticas de usuarios:', error);
            throw error;
        }
    }
}

module.exports = User;