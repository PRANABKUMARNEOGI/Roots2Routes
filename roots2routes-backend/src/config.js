require('dotenv').config();
const { Pool } = require('pg');
const redis = require('redis');

// PostgreSQL Connection
const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 50,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000 // Increased from 2000 to allow Neon to wake up
});

// Redis Connection (Upstash)
const cache = redis.createClient({ url: process.env.REDIS_URL });

cache.on('error', (err) => console.error('Redis Client Error:', err));
cache.connect().then(() => console.log('Connected to Redis'));

module.exports = { db, cache };