const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 30000,
});

async function run() {
  try {
    console.log('Using config:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
    });
    
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('Connected!');
    try {
        console.log('Creating sequence...');
        await client.query("CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;");
        console.log('Sequence created successfully.');
    } finally {
        client.release();
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

run();
