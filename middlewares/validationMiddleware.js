
const { body, param, query, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
        });
    }
    next();
};

// Validación de ID
const validateId = [
    param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
    handleValidationErrors
];

// Validación para crear/actualizar restaurante
const validateRestaurant = [
    body('nombre')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
    
    body('descripcion')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('La descripción no puede exceder 1000 caracteres'),
    
    body('direccion')
        .trim()
        .isLength({ min: 5, max: 500 })
        .withMessage('La dirección debe tener entre 5 y 500 caracteres'),
    
    body('telefono')
        .optional()
        .trim()
        .matches(/^[+]?[0-9\s\-()]+$/)
        .withMessage('Formato de teléfono inválido'),
    
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Email inválido'),
    
    body('categoria')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('La categoría debe tener entre 2 y 100 caracteres'),
    
    body('precio_promedio')
        .isIn(['$', '$$', '$$$', '$$$$'])
        .withMessage('El rango de precio debe ser $, $$, $$$ o $$$$'),
    
    handleValidationErrors
];

// Validación para búsqueda
const validateSearch = [
    query('q')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('El término de búsqueda debe tener al menos 2 caracteres'),
    handleValidationErrors
];

// Validación para reseñas
const validateReview = [
    body('calificacion')
        .isInt({ min: 1, max: 5 })
        .withMessage('La calificación debe ser un número entre 1 y 5'),
    
    body('comentario')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('El comentario no puede exceder 1000 caracteres'),
    
    body('restaurante_id')
        .isInt({ min: 1 })
        .withMessage('ID del restaurante debe ser un número entero positivo'),
    
    handleValidationErrors
];

// Validación para menús
const validateMenu = [
    body('nombre')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
    
    body('descripcion')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres'),
    
    body('precio')
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser un número positivo'),
    
    body('categoria')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('La categoría debe tener entre 2 y 100 caracteres'),
    
    body('restaurante_id')
        .isInt({ min: 1 })
        .withMessage('ID del restaurante debe ser un número entero positivo'),
    
    handleValidationErrors
];

// Validación para eventos
const validateEvent = [
    body('nombre')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
    
    body('descripcion')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('La descripción no puede exceder 1000 caracteres'),
    
    body('fecha_evento')
        .isISO8601()
        .withMessage('Fecha del evento debe ser válida'),
    
    body('precio')
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser un número positivo'),
    
    body('capacidad_maxima')
        .isInt({ min: 1 })
        .withMessage('La capacidad máxima debe ser un número entero positivo'),
    
    handleValidationErrors
];

// Validación de paginación
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número entero positivo'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser un número entre 1 y 100'),
    
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateId,
    validateRestaurant,
    validateSearch,
    validateReview,
    validateMenu,
    validateEvent,
    validatePagination
};
