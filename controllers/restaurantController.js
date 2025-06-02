
const Restaurant = require('../models/Restaurant');
const { successResponse, errorResponse } = require('../utils/response');

class RestaurantController {
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search, cuisine_type, city, price_range, min_rating } = req.query;

            const filters = {};
            if (search) filters.search = search;
            if (cuisine_type) filters.cuisine_type = cuisine_type;
            if (city) filters.city = city;
            if (price_range) filters.price_range = price_range;
            if (min_rating) filters.min_rating = parseFloat(min_rating);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit)
            };

            const result = await Restaurant.findAll(pagination, filters);

            return successResponse(res, {
                restaurants: result.restaurants,
                pagination: {
                    current_page: pagination.page,
                    total_pages: Math.ceil(result.total / pagination.limit),
                    total_items: result.total,
                    items_per_page: pagination.limit
                }
            }, 'Restaurantes obtenidos exitosamente');

        } catch (error) {
            console.error('Error obteniendo restaurantes:', error);
            return errorResponse(res, 'Error interno del servidor', 500);
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const restaurant = await Restaurant.findById(id);

            if (!restaurant) {
                return errorResponse(res, 'Restaurante no encontrado', 404);
            }

            return successResponse(res, { restaurant }, 'Restaurante obtenido exitosamente');

        } catch (error) {
            console.error('Error obteniendo restaurante:', error);
            return errorResponse(res, 'Error interno del servidor', 500);
        }
    }

    async create(req, res) {
        try {
            const restaurantData = req.body;
            const restaurantId = await Restaurant.create(restaurantData);
            const newRestaurant = await Restaurant.findById(restaurantId);

            return successResponse(res, { restaurant: newRestaurant }, 'Restaurante creado exitosamente', 201);

        } catch (error) {
            console.error('Error creando restaurante:', error);
            return errorResponse(res, 'Error interno del servidor', 500);
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const restaurant = await Restaurant.findById(id);
            if (!restaurant) {
                return errorResponse(res, 'Restaurante no encontrado', 404);
            }

            await Restaurant.update(id, updateData);
            const updatedRestaurant = await Restaurant.findById(id);

            return successResponse(res, { restaurant: updatedRestaurant }, 'Restaurante actualizado exitosamente');

        } catch (error) {
            console.error('Error actualizando restaurante:', error);
            return errorResponse(res, 'Error interno del servidor', 500);
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;

            const restaurant = await Restaurant.findById(id);
            if (!restaurant) {
                return errorResponse(res, 'Restaurante no encontrado', 404);
            }

            await Restaurant.delete(id);
            return successResponse(res, null, 'Restaurante eliminado exitosamente');

        } catch (error) {
            console.error('Error eliminando restaurante:', error);
            return errorResponse(res, 'Error interno del servidor', 500);
        }
    }

    async search(req, res) {
        try {
            const { q, page = 1, limit = 10 } = req.query;
            
            if (!q) {
                return errorResponse(res, 'Término de búsqueda requerido', 400);
            }

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit)
            };

            const result = await Restaurant.search(q, pagination);

            return successResponse(res, {
                restaurants: result.restaurants,
                pagination: {
                    current_page: pagination.page,
                    total_pages: Math.ceil(result.total / pagination.limit),
                    total_items: result.total,
                    items_per_page: pagination.limit
                }
            }, 'Búsqueda completada exitosamente');

        } catch (error) {
            console.error('Error en búsqueda:', error);
            return errorResponse(res, 'Error interno del servidor', 500);
        }
    }

    async getStats(req, res) {
        try {
            const stats = await Restaurant.getStats();
            return successResponse(res, { stats }, 'Estadísticas obtenidas exitosamente');

        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return errorResponse(res, 'Error interno del servidor', 500);
        }
    }

    async getTopRated(req, res) {
        try {
            const { limit = 10 } = req.query;
            const restaurants = await Restaurant.getTopRated(parseInt(limit));
            return successResponse(res, { restaurants }, 'Restaurantes mejor calificados obtenidos exitosamente');

        } catch (error) {
            console.error('Error obteniendo restaurantes mejor calificados:', error);
            return errorResponse(res, 'Error interno del servidor', 500);
        }
    }

    async getCuisineTypes(req, res) {
        try {
            const cuisineTypes = await Restaurant.getCuisineTypes();
            return successResponse(res, { cuisine_types: cuisineTypes }, 'Tipos de cocina obtenidos exitosamente');

        } catch (error) {
            console.error('Error obteniendo tipos de cocina:', error);
            return errorResponse(res, 'Error interno del servidor', 500);
        }
    }

    async getCities(req, res) {
        try {
            const cities = await Restaurant.getCities();
            return successResponse(res, { cities }, 'Ciudades obtenidas exitosamente');

        } catch (error) {
            console.error('Error obteniendo ciudades:', error);
            return errorResponse(res, 'Error interno del servidor', 500);
        }
    }

    async getByPriceRange(req, res) {
        try {
            const { price_range } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit)
            };

            const result = await Restaurant.getByPriceRange(price_range, pagination);

            return successResponse(res, {
                restaurants: result.restaurants,
                pagination: {
                    current_page: pagination.page,
                    total_pages: Math.ceil(result.total / pagination.limit),
                    total_items: result.total,
                    items_per_page: pagination.limit
                }
            }, `Restaurantes con rango de precio ${price_range} obtenidos exitosamente`);

        } catch (error) {
            console.error('Error obteniendo restaurantes por rango de precio:', error);
            return errorResponse(res, 'Error interno del servidor', 500);
        }
    }
}

module.exports = new RestaurantController();
