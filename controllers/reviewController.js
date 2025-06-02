const Review = require('../models/Review');
const { successResponse, errorResponse } = require('../utils/response');

class ReviewController {
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, restaurant_id, user_id, rating } = req.query;
            const offset = (page - 1) * limit;

            const filters = {};
            if (restaurant_id) filters.restaurant_id = restaurant_id;
            if (user_id) filters.user_id = user_id;
            if (rating) filters.rating = rating;

            const reviews = await Review.findWithFilters({ ...filters, limit, offset });
            const total = await Review.count(filters);

            return successResponse(res, {
                reviews,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error obteniendo reseñas:', error);
            return errorResponse(res, 'Error interno del servidor', 500);
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const review = await Review.findById(parseInt(id));

            if (!review) {
                return errorResponse(res, 'Reseña no encontrada', 404);
            }

            return successResponse(res, { review });
        } catch (error) {
            console.error('Error obteniendo reseña:', error);
            return errorResponse(res, 'Error interno del servidor', 500);
        }
    }

    async getByRestaurant(req, res) {
        try {
            const { restaurant_id } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const reviews = await Review.findByRestaurant(parseInt(restaurant_id), { limit, offset });
            const total = await Review.count({ restaurant_id });

            return successResponse(res, {
                reviews,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error obteniendo reseñas del restaurante:', error);
            return errorResponse(res, 'Error interno del servidor', 500);
        }
    }

    async getByUser(req, res) {
        try {
            const { user_id } = req.params;
            const userId = user_id || req.user.id;
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const reviews = await Review.findByUser(parseInt(userId), { limit, offset });
            const total = await Review.count({ user_id: userId });

            return successResponse(res, {
                reviews,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error obteniendo reseñas del usuario:', error);
            return errorResponse(res, 'Error interno del servidor', 500);
        }
    }

    async getMyReviews(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const reviews = await Review.findByUser(req.user.id, { limit, offset });
            const total = await Review.count({ user_id: req.user.id });

            return successResponse(res, {
                reviews,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error obteniendo mis reseñas:', error);
            return errorResponse(res, 'Error interno del servidor', 500);
        }
    }

    async create(req, res) {
        try {
            const { restaurant_id, rating, comment } = req.body;

            const existingReview = await Review.findByUserAndRestaurant(req.user.id, restaurant_id);
            if (existingReview) {
                return errorResponse(res, 'Ya has escrito una reseña para este restaurante', 400);
            }

            const reviewData = {
                user_id: req.user.id,
                restaurant_id: parseInt(restaurant_id),
                rating: parseInt(rating),
                comment: comment?.trim() || null
            };

            const reviewId = await Review.create(reviewData);
            const newReview = await Review.findById(reviewId);

            return successResponse(res, { review: newReview }, 'Reseña creada exitosamente', 201);
        } catch (error) {
            console.error('Error creando reseña:', error);
            return errorResponse(res, 'Error interno del servidor', 500);
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { rating, comment } = req.body;

            const existingReview = await Review.findById(parseInt(id));
            if (!existingReview) {
                return errorResponse(res, 'Reseña no encontrada', 404);
            }

            if (existingReview.user_id !== req.user.id) {
                return errorResponse(res, 'No tienes permiso para editar esta reseña', 403);
            }

            const updateData = {};
            if (rating !== undefined) updateData.rating = parseInt(rating);
            if (comment !== undefined) updateData.comment = comment?.trim() || null;

            await Review.update(parseInt(id), updateData);
            const updatedReview = await Review.findById(parseInt(id));

            return successResponse(res, { review: updatedReview }, 'Reseña actualizada exitosamente');
        } catch (error) {
            console.error('Error actualizando reseña:', error);
            return errorResponse(res, 'Error interno del servidor', 500);
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;

            const existingReview = await Review.findById(parseInt(id));
            if (!existingReview) {
                return errorResponse(res, 'Reseña no encontrada', 404);
            }

            if (existingReview.user_id !== req.user.id) {
                return errorResponse(res, 'No tienes permiso para eliminar esta reseña', 403);
            }

            await Review.delete(parseInt(id));

            return successResponse(res, null, 'Reseña eliminada exitosamente');
        } catch (error) {
            console.error('Error eliminando reseña:', error);
            return errorResponse(res, 'Error interno del servidor', 500);
        }
    }

    async getStats(req, res) {
        try {
            const stats = await Review.getStats();
            return successResponse(res, { stats });
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return errorResponse(res, 'Error interno del servidor', 500);
        }
    }

    async getMostHelpful(req, res) {
        try {
            const { limit = 10 } = req.query;
            const reviews = await Review.getMostHelpful(parseInt(limit));
            return successResponse(res, { reviews });
        } catch (error) {
            console.error('Error obteniendo reseñas más útiles:', error);
            return errorResponse(res, 'Error interno del servidor', 500);
        }
    }

    async canUserReview(req, res) {
        try {
            const { restaurant_id } = req.params;
            const existingReview = await Review.findByUserAndRestaurant(req.user.id, restaurant_id);

            return successResponse(res, { 
                canReview: !existingReview,
                hasExistingReview: !!existingReview
            });
        } catch (error) {
            console.error('Error verificando si puede reseñar:', error);
            return errorResponse(res, 'Error interno del servidor', 500);
        }
    }
}

module.exports = new ReviewController();