const database = require('../config/database');

class Review {
    static async create(reviewData) {
        try {
            const sql = `
                INSERT INTO resenas (user_id, restaurant_id, rating, comment)
                VALUES (?, ?, ?, ?)
            `;

            const result = await database.query(sql, [
                reviewData.user_id,
                reviewData.restaurant_id,
                reviewData.rating,
                reviewData.comment
            ]);

            return result.insertId;
        } catch (error) {
            console.error('Error creando reseña:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const sql = `
                SELECT r.*, u.name as user_name, rt.name as restaurant_name
                FROM resenas r
                JOIN usuarios u ON r.user_id = u.id
                JOIN restaurantes rt ON r.restaurant_id = rt.id
                WHERE r.id = ?
            `;

            const result = await database.query(sql, [id]);
            return result[0] || null;
        } catch (error) {
            console.error('Error obteniendo reseña:', error);
            throw error;
        }
    }

    static async findByRestaurant(restaurantId, options = {}) {
        try {
            const { limit = 10, offset = 0 } = options;
            const sql = `
                SELECT r.*, u.name as user_name
                FROM resenas r
                JOIN usuarios u ON r.user_id = u.id
                WHERE r.restaurant_id = ?
                ORDER BY r.created_at DESC
                LIMIT ? OFFSET ?
            `;

            const result = await database.query(sql, [restaurantId, limit, offset]);
            return result;
        } catch (error) {
            console.error('Error obteniendo reseñas del restaurante:', error);
            throw error;
        }
    }

    static async findByUser(userId, options = {}) {
        try {
            const { limit = 10, offset = 0 } = options;
            const sql = `
                SELECT r.*, rt.name as restaurant_name
                FROM resenas r
                JOIN restaurantes rt ON r.restaurant_id = rt.id
                WHERE r.user_id = ?
                ORDER BY r.created_at DESC
                LIMIT ? OFFSET ?
            `;

            const result = await database.query(sql, [userId, limit, offset]);
            return result;
        } catch (error) {
            console.error('Error obteniendo reseñas del usuario:', error);
            throw error;
        }
    }

    static async findByUserAndRestaurant(userId, restaurantId) {
        try {
            const sql = `
                SELECT * FROM resenas
                WHERE user_id = ? AND restaurant_id = ?
            `;

            const result = await database.query(sql, [userId, restaurantId]);
            return result[0] || null;
        } catch (error) {
            console.error('Error obteniendo reseña específica:', error);
            throw error;
        }
    }

    static async findWithFilters(filters = {}) {
        try {
            let sql = `
                SELECT r.*, u.name as user_name, rt.name as restaurant_name
                FROM resenas r
                JOIN usuarios u ON r.user_id = u.id
                JOIN restaurantes rt ON r.restaurant_id = rt.id
                WHERE 1=1
            `;
            const params = [];

            if (filters.restaurant_id) {
                sql += ' AND r.restaurant_id = ?';
                params.push(filters.restaurant_id);
            }

            if (filters.user_id) {
                sql += ' AND r.user_id = ?';
                params.push(filters.user_id);
            }

            if (filters.rating) {
                sql += ' AND r.rating = ?';
                params.push(filters.rating);
            }

            sql += ' ORDER BY r.created_at DESC';

            if (filters.limit) {
                sql += ' LIMIT ?';
                params.push(filters.limit);
            }

            if (filters.offset) {
                sql += ' OFFSET ?';
                params.push(filters.offset);
            }

            const result = await database.query(sql, params);
            return result;
        } catch (error) {
            console.error('Error obteniendo reseñas con filtros:', error);
            throw error;
        }
    }

    static async update(id, updateData) {
        try {
            const fields = [];
            const values = [];

            if (updateData.rating !== undefined) {
                fields.push('rating = ?');
                values.push(updateData.rating);
            }

            if (updateData.comment !== undefined) {
                fields.push('comment = ?');
                values.push(updateData.comment);
            }

            if (fields.length === 0) {
                throw new Error('No hay campos para actualizar');
            }

            values.push(id);

            const sql = `UPDATE resenas SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
            await database.query(sql, values);

            return true;
        } catch (error) {
            console.error('Error actualizando reseña:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const sql = 'DELETE FROM resenas WHERE id = ?';
            await database.query(sql, [id]);
            return true;
        } catch (error) {
            console.error('Error eliminando reseña:', error);
            throw error;
        }
    }

    static async count(filters = {}) {
        try {
            let sql = 'SELECT COUNT(*) as total FROM resenas WHERE 1=1';
            const params = [];

            if (filters.restaurant_id) {
                sql += ' AND restaurant_id = ?';
                params.push(filters.restaurant_id);
            }

            if (filters.user_id) {
                sql += ' AND user_id = ?';
                params.push(filters.user_id);
            }

            if (filters.rating) {
                sql += ' AND rating = ?';
                params.push(filters.rating);
            }

            const result = await database.query(sql, params);
            return result[0].total;
        } catch (error) {
            console.error('Error contando reseñas:', error);
            throw error;
        }
    }

    static async getStats() {
        try {
            const sql = `
                SELECT 
                    COUNT(*) as total_reviews,
                    AVG(rating) as average_rating,
                    MIN(rating) as min_rating,
                    MAX(rating) as max_rating,
                    COUNT(DISTINCT user_id) as unique_users,
                    COUNT(DISTINCT restaurant_id) as reviewed_restaurants
                FROM resenas
            `;

            const result = await database.query(sql);
            return result[0];
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw error;
        }
    }

    static async getMostHelpful(limit = 10) {
        try {
            const sql = `
                SELECT r.*, u.name as user_name, rt.name as restaurant_name
                FROM resenas r
                JOIN usuarios u ON r.user_id = u.id
                JOIN restaurantes rt ON r.restaurant_id = rt.id
                WHERE r.comment IS NOT NULL AND LENGTH(r.comment) > 50
                ORDER BY r.rating DESC, LENGTH(r.comment) DESC
                LIMIT ?
            `;

            const result = await database.query(sql, [limit]);
            return result;
        } catch (error) {
            console.error('Error obteniendo reseñas más útiles:', error);
            throw error;
        }
    }
}

module.exports = Review;