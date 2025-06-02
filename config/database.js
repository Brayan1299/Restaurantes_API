const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'restaurante_app',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    multipleStatements: true
};

// Pool de conexiones
let pool;

const createConnection = async () => {
    try {
        // Crear conexión inicial sin especificar base de datos
        const initialConnection = await mysql.createConnection({
            host: config.host,
            user: config.user,
            password: config.password,
            port: config.port,
            multipleStatements: true
        });

        console.log('📡 Conectado a MySQL');
        return initialConnection;
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error.message);
        throw error;
    }
};

const initializeDatabase = async () => {
    let connection;
    try {
        connection = await createConnection();

        // Leer y ejecutar el script de inicialización
        const initSqlPath = path.join(__dirname, 'init.sql');
        const initSql = await fs.readFile(initSqlPath, 'utf8');

        console.log('🔄 Ejecutando script de inicialización de base de datos...');
        await connection.execute(initSql);
        console.log('✅ Base de datos inicializada correctamente');

        // Cerrar conexión inicial
        await connection.end();

        // Crear pool de conexiones con la base de datos específica
        pool = mysql.createPool(config);

        // Probar la conexión del pool
        const testConnection = await pool.getConnection();
        console.log('✅ Pool de conexiones creado exitosamente');
        testConnection.release();

        return pool;
    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
        if (connection) {
            await connection.end();
        }
        throw error;
    }
};

const query = async (sql, params = []) => {
    try {
        if (!pool) {
            throw new Error('Pool de conexiones no inicializado');
        }

        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('❌ Error ejecutando consulta:', error);
        console.error('SQL:', sql);
        console.error('Parámetros:', params);
        throw error;
    }
};

const getConnection = async () => {
    if (!pool) {
        throw new Error('Pool de conexiones no inicializado');
    }
    return await pool.getConnection();
};

const closePool = async () => {
    if (pool) {
        await pool.end();
        console.log('🔌 Pool de conexiones cerrado');
    }
};

// Manejo de errores de conexión
process.on('SIGINT', async () => {
    console.log('🔄 Cerrando conexiones de base de datos...');
    await closePool();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('🔄 Cerrando conexiones de base de datos...');
    await closePool();
    process.exit(0);
});

module.exports = {
    initializeDatabase,
    query,
    getConnection,
    closePool,
    pool: () => pool
};