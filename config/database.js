` tags. I will ensure that the indentation, structure, and functionality are preserved. I will pay close attention to including all parts of the original code that were not explicitly changed in the edited snippet. I will replace the original code completely with the edited code since it appears to be a complete replacement with some fixes.

```
<replit_final_file>
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'restaurante_app',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;

async function createDatabase() {
    const connection = await mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password
    });

    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${config.database}`);
    await connection.end();
}

async function initializeDatabase() {
    try {
        await createDatabase();

        pool = mysql.createPool(config);

        const initSqlPath = path.join(__dirname, 'init.sql');
        const initSql = await fs.readFile(initSqlPath, 'utf8');

        const statements = initSql.split(';').filter(stmt => stmt.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                await pool.execute(statement);
            }
        }

        console.log('✅ Base de datos inicializada correctamente');

    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
        throw error;
    }
}

async function testConnection() {
    try {
        if (!pool) {
            await initializeDatabase();
        }

        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();

        console.log('✅ Conexión a base de datos exitosa');
        return true;
    } catch (error) {
        console.error('❌ Error conectando a base de datos:', error);
        throw error;
    }
}

module.exports = {
    execute: async (query, params) => {
        if (!pool) {
            await initializeDatabase();
        }
        return pool.execute(query, params);
    },
    getConnection: async () => {
        if (!pool) {
            await initializeDatabase();
        }
        return pool.getConnection();
    },
    testConnection,
    initializeDatabase
};