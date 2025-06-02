const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        // También verificar cookie
        const cookieToken = req.cookies.token;
        const finalToken = token || cookieToken;

        if (!finalToken) {
            return res.status(401).json({
                success: false,
                message: 'Token de acceso requerido'
            });
        }

        const decoded = jwt.verify(finalToken, config.jwt.secret);

        // Verificar que el usuario todavía existe
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || 'user'
        };

        next();
    } catch (error) {
        console.error('Error en autenticación:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Middleware para verificar roles
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const userRole = req.user.role || 'user';

        if (!roles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para realizar esta acción'
            });
        }

        next();
    };
};

// Middleware opcional de autenticación (para rutas que pueden funcionar con o sin auth)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const cookieToken = req.cookies.token;
        const finalToken = token || cookieToken;

        if (finalToken) {
            const decoded = jwt.verify(finalToken, config.jwt.secret);
            const user = await User.findById(decoded.id);

            if (user) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role || 'user'
                };
            }
        }

        next();
    } catch (error) {
        // En caso de error, simplemente continuar sin usuario
        next();
    }
};

module.exports = {
    authenticateToken,
    requireRole,
    optionalAuth
};