const { validationResult, param, query } = require('express-validator');

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

const validateIdParam = () => {
    return [
        param('id')
            .isInt({ min: 1 })
            .withMessage('El ID debe ser un número entero positivo'),
        handleValidationErrors
    ];
};

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
    validateIdParam,
    validatePagination
};