
const { errorResponse } = require('../utils/response');

// Middleware para manejar errores
const errorHandler = (err, req, res, next) => {
    console.error('❌ Error capturado:', err);

    // Error de validación de Mongoose/MySQL
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(error => error.message);
        return errorResponse(res, 'Errores de validación', 400, errors);
    }

    // Error de duplicado de MySQL
    if (err.code === 'ER_DUP_ENTRY') {
        return errorResponse(res, 'El registro ya existe', 409);
    }

    // Error de clave foránea de MySQL
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return errorResponse(res, 'Referencia inválida en los datos', 400);
    }

    // Error de conexión a base de datos
    if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        return errorResponse(res, 'Error de conexión a la base de datos', 503);
    }

    // Error de JWT
    if (err.name === 'JsonWebTokenError') {
        return errorResponse(res, 'Token inválido', 401);
    }

    if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token expirado', 401);
    }

    // Error de límite de tamaño de archivo
    if (err.code === 'LIMIT_FILE_SIZE') {
        return errorResponse(res, 'El archivo es demasiado grande', 413);
    }

    // Error de sintaxis JSON
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return errorResponse(res, 'JSON inválido en el cuerpo de la petición', 400);
    }

    // Error personalizado con statusCode
    if (err.statusCode) {
        return errorResponse(res, err.message, err.statusCode);
    }

    // Error interno del servidor (por defecto)
    return errorResponse(res, 'Error interno del servidor', 500);
};

// Middleware para manejar rutas no encontradas
const notFoundHandler = (req, res, next) => {
    const message = `Ruta ${req.method} ${req.originalUrl} no encontrada`;
    return errorResponse(res, message, 404);
};

// Middleware para logging de errores
const errorLogger = (err, req, res, next) => {
    const errorLog = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        error: {
            name: err.name,
            message: err.message,
            stack: err.stack
        }
    };

    console.error('📝 Error Log:', JSON.stringify(errorLog, null, 2));
    next(err);
};

module.exports = {
    errorHandler,
    notFoundHandler,
    errorLogger
};
