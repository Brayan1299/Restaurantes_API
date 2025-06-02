const db = require('../config/database');

class Restaurant {
    static async findAll(pagination = {}, filters = {}) {
        try {
            let query = `
                SELECT r.*, 
                       COALESCE(AVG(rv.rating), 0) as average_rating,
                       COUNT(rv.id) as total_reviews
                FROM restaurantes r
                LEFT JOIN resenas rv ON r.id = rv.restaurante_id
                WHERE 1=1
            `;

            const params = [];

            if (filters.search) {
                query += ` AND (r.nombre LIKE ? OR r.descripcion LIKE ?)`;
                params.push(`%${filters.search}%`, `%${filters.search}%`);
            }

            if (filters.cuisine_type) {
                query += ` AND r.tipo_cocina = ?`;
                params.push(filters.cuisine_type);
            }

            if (filters.city) {
                query += ` AND r.ciudad = ?`;
                params.push(filters.city);
            }

            if (filters.price_range) {
                query += ` AND r.rango_precio = ?`;
                params.push(filters.price_range);
            }

            query += ` GROUP BY r.id`;

            if (filters.min_rating) {
                query += ` HAVING average_rating >= ?`;
                params.push(filters.min_rating);
            }

            query += ` ORDER BY r.fecha_creacion DESC`;

            if (pagination.limit) {
                query += ` LIMIT ? OFFSET ?`;
                params.push(pagination.limit, pagination.offset || 0);
            }

            const [restaurants] = await db.execute(query, params);

            let countQuery = `
                SELECT COUNT(DISTINCT r.id) as total
                FROM restaurantes r
                LEFT JOIN resenas rv ON r.id = rv.restaurante_id
                WHERE 1=1
            `;

            const countParams = [];

            if (filters.search) {
                countQuery += ` AND (r.nombre LIKE ? OR r.descripcion LIKE ?)`;
                countParams.push(`%${filters.search}%`, `%${filters.search}%`);
            }

            if (filters.cuisine_type) {
                countQuery += ` AND r.tipo_cocina = ?`;
                countParams.push(filters.cuisine_type);
            }

            if (filters.city) {
                countQuery += ` AND r.ciudad = ?`;
                countParams.push(filters.city);
            }

            if (filters.price_range) {
                countQuery += ` AND r.rango_precio = ?`;
                countParams.push(filters.price_range);
            }

            const [countResult] = await db.execute(countQuery, countParams);

            return {
                restaurants: restaurants.map(r => ({
                    id: r.id,
                    name: r.nombre,
                    description: r.descripcion,
                    cuisine_type: r.tipo_cocina,
                    address: r.direccion,
                    city: r.ciudad,
                    price_range: r.rango_precio,
                    phone: r.telefono,
                    email: r.email,
                    website: r.sitio_web,
                    average_rating: parseFloat(r.average_rating),
                    total_reviews: parseInt(r.total_reviews),
                    created_at: r.fecha_creacion
                })),
                total: countResult[0].total
            };

        } catch (error) {
            console.error('Error en Restaurant.findAll:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const query = `
                SELECT r.*, 
                       COALESCE(AVG(rv.rating), 0) as average_rating,
                       COUNT(rv.id) as total_reviews
                FROM restaurantes r
                LEFT JOIN resenas rv ON r.id = rv.restaurante_id
                WHERE r.id = ?
                GROUP BY r.id
            `;

            const [rows] = await db.execute(query, [id]);

            if (rows.length === 0) {
                return null;
            }

            const restaurant = rows[0];
            return {
                id: restaurant.id,
                name: restaurant.nombre,
                description: restaurant.descripcion,
                cuisine_type: restaurant.tipo_cocina,
                address: restaurant.direccion,
                city: restaurant.ciudad,
                price_range: restaurant.rango_precio,
                phone: restaurant.telefono,
                email: restaurant.email,
                website: restaurant.sitio_web,
                average_rating: parseFloat(restaurant.average_rating),
                total_reviews: parseInt(restaurant.total_reviews),
                created_at: restaurant.fecha_creacion
            };

        } catch (error) {
            console.error('Error en Restaurant.findById:', error);
            throw error;
        }
    }

    static async create(data) {
        try {
            const query = `
                INSERT INTO restaurantes (nombre, descripcion, tipo_cocina, direccion, ciudad, rango_precio, telefono, email, sitio_web)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await db.execute(query, [
                data.name,
                data.description,
                data.cuisine_type,
                data.address,
                data.city,
                data.price_range,
                data.phone,
                data.email,
                data.website
            ]);

            return result.insertId;

        } catch (error) {
            console.error('Error en Restaurant.create:', error);
            throw error;
        }
    }

    static async update(id, data) {
        try {
            const query = `
                UPDATE restaurantes 
                SET nombre = ?, descripcion = ?, tipo_cocina = ?, direccion = ?, 
                    ciudad = ?, rango_precio = ?, telefono = ?, email = ?, sitio_web = ?
                WHERE id = ?
            `;

            const [result] = await db.execute(query, [
                data.name,
                data.description,
                data.cuisine_type,
                data.address,
                data.city,
                data.price_range,
                data.phone,
                data.email,
                data.website,
                id
            ]);

            return result.affectedRows > 0;

        } catch (error) {
            console.error('Error en Restaurant.update:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const query = `DELETE FROM restaurantes WHERE id = ?`;
            const [result] = await db.execute(query, [id]);
            return result.affectedRows > 0;

        } catch (error) {
            console.error('Error en Restaurant.delete:', error);
            throw error;
        }
    }

    static async search(searchTerm, pagination = {}) {
        try {
            const query = `
                SELECT r.*, 
                       COALESCE(AVG(rv.rating), 0) as average_rating,
                       COUNT(rv.id) as total_reviews
                FROM restaurantes r
                LEFT JOIN resenas rv ON r.id = rv.restaurante_id
                WHERE r.nombre LIKE ? OR r.descripcion LIKE ? OR r.tipo_cocina LIKE ?
                GROUP BY r.id
                ORDER BY r.nombre
                LIMIT ? OFFSET ?
            `;

            const searchPattern = `%${searchTerm}%`;
            const [restaurants] = await db.execute(query, [
                searchPattern, searchPattern, searchPattern,
                pagination.limit || 10, pagination.offset || 0
            ]);

            const countQuery = `
                SELECT COUNT(DISTINCT r.id) as total
                FROM restaurantes r
                WHERE r.nombre LIKE ? OR r.descripcion LIKE ? OR r.tipo_cocina LIKE ?
            `;

            const [countResult] = await db.execute(countQuery, [searchPattern, searchPattern, searchPattern]);

            return {
                restaurants: restaurants.map(r => ({
                    id: r.id,
                    name: r.nombre,
                    description: r.descripcion,
                    cuisine_type: r.tipo_cocina,
                    address: r.direccion,
                    city: r.ciudad,
                    price_range: r.rango_precio,
                    phone: r.telefono,
                    email: r.email,
                    website: r.sitio_web,
                    average_rating: parseFloat(r.average_rating),
                    total_reviews: parseInt(r.total_reviews),
                    created_at: r.fecha_creacion
                })),
                total: countResult[0].total
            };

        } catch (error) {
            console.error('Error en Restaurant.search:', error);
            throw error;
        }
    }

    static async getStats() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_restaurants,
                    COUNT(DISTINCT tipo_cocina) as total_cuisine_types,
                    COUNT(DISTINCT ciudad) as total_cities,
                    AVG(
                        (SELECT AVG(rating) FROM resenas WHERE restaurante_id = restaurantes.id)
                    ) as overall_average_rating
                FROM restaurantes
            `;

            const [rows] = await db.execute(query);
            return rows[0];

        } catch (error) {
            console.error('Error en Restaurant.getStats:', error);
            throw error;
        }
    }

    static async getTopRated(limit = 10) {
        try {
            const query = `
                SELECT r.*, 
                       COALESCE(AVG(rv.rating), 0) as average_rating,
                       COUNT(rv.id) as total_reviews
                FROM restaurantes r
                LEFT JOIN resenas rv ON r.id = rv.restaurante_id
                GROUP BY r.id
                HAVING COUNT(rv.id) > 0
                ORDER BY average_rating DESC, total_reviews DESC
                LIMIT ?
            `;

            const [restaurants] = await db.execute(query, [limit]);

            return restaurants.map(r => ({
                id: r.id,
                name: r.nombre,
                description: r.descripcion,
                cuisine_type: r.tipo_cocina,
                address: r.direccion,
                city: r.ciudad,
                price_range: r.rango_precio,
                phone: r.telefono,
                email: r.email,
                website: r.sitio_web,
                average_rating: parseFloat(r.average_rating),
                total_reviews: parseInt(r.total_reviews),
                created_at: r.fecha_creacion
            }));

        } catch (error) {
            console.error('Error en Restaurant.getTopRated:', error);
            throw error;
        }
    }

    static async getCuisineTypes() {
        try {
            const query = `SELECT DISTINCT tipo_cocina FROM restaurantes ORDER BY tipo_cocina`;
            const [rows] = await db.execute(query);
            return rows.map(row => row.tipo_cocina);

        } catch (error) {
            console.error('Error en Restaurant.getCuisineTypes:', error);
            throw error;
        }
    }

    static async getCities() {
        try {
            const query = `SELECT DISTINCT ciudad FROM restaurantes ORDER BY ciudad`;
            const [rows] = await db.execute(query);
            return rows.map(row => row.ciudad);

        } catch (error) {
            console.error('Error en Restaurant.getCities:', error);
            throw error;
        }
    }

    static async getByPriceRange(priceRange, pagination = {}) {
        try {
            const query = `
                SELECT r.*, 
                       COALESCE(AVG(rv.rating), 0) as average_rating,
                       COUNT(rv.id) as total_reviews
                FROM restaurantes r
                LEFT JOIN resenas rv ON r.id = rv.restaurante_id
                WHERE r.rango_precio = ?
                GROUP BY r.id
                ORDER BY r.nombre
                LIMIT ? OFFSET ?
            `;

            const [restaurants] = await db.execute(query, [
                priceRange,
                pagination.limit || 10,
                pagination.offset || 0
            ]);

            const countQuery = `SELECT COUNT(*) as total FROM restaurantes WHERE rango_precio = ?`;
            const [countResult] = await db.execute(countQuery, [priceRange]);

            return {
                restaurants: restaurants.map(r => ({
                    id: r.id,
                    name: r.nombre,
                    description: r.descripcion,
                    cuisine_type: r.tipo_cocina,
                    address: r.direccion,
                    city: r.ciudad,
                    price_range: r.rango_precio,
                    phone: r.telefono,
                    email: r.email,
                    website: r.sitio_web,
                    average_rating: parseFloat(r.average_rating),
                    total_reviews: parseInt(r.total_reviews),
                    created_at: r.fecha_creacion
                })),
                total: countResult[0].total
            };

        } catch (error) {
            console.error('Error en Restaurant.getByPriceRange:', error);
            throw error;
        }
    }
}

module.exports = Restaurant;