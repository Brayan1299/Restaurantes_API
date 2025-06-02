const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value
        }));

        return errorResponse(res, 'Errores de validación', 400, {
            errors: errorMessages
        });
    }

    next();
};

module.exports = {
    handleValidationErrors
};