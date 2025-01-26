import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({
    max: process.env.DB_CONNECTION_LIMIT,
    host: process.env.CHAT_DB_HOST,
    user: process.env.CHAT_DB_USER,
    password: process.env.CHAT_DB_PASSWORD,
    database: process.env.CHAT_DB_DATABASE,
    port: process.env.CHAT_DB_PORT,
    ssl: {
        rejectUnauthorized: false // Disable server certificate validation for SSL
    }
});


export default pool;
