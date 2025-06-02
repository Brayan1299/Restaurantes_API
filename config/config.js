const validateConfig = () => {
    const requiredVars = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_NAME'];
    const missing = requiredVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        console.warn(`⚠ Variables de entorno faltantes: ${missing.join(', ')}`);
    }
};

const dotenv = require('dotenv');
dotenv.config();
validateConfig();

const config = {
    database: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'restaurant_db',
        connectionLimit: 10,
        acquireTimeout: 60000,
        timeout: 60000
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'gastro-api-secret-dev-key-2024',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    server: {
        port: process.env.PORT || 5000,
        host: '0.0.0.0'
    },
    email: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER || '',
            pass: process.env.EMAIL_PASS || ''
        }
    },
    mercadoPago: {
        accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-YOUR-ACCESS-TOKEN',
        publicKey: process.env.MP_PUBLIC_KEY || 'TEST-YOUR-PUBLIC-KEY'
    }
};

module.exports = config;