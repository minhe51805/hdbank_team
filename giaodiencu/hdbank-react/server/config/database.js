// PostgreSQL Database Configuration
// Based on docker-compose.yml settings

const { Pool } = require('pg');

// Database configuration from docker-compose.yml
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5435,
  database: process.env.DB_NAME || 'db_fin_customer',
  user: process.env.DB_USER || 'HiepData',
  password: process.env.DB_PASSWORD || '123456',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Export pool for use in other modules
module.exports = pool;
