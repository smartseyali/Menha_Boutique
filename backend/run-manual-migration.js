require('dotenv').config();
const { Client } = require('pg');

// Use config from environment variables
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function migrate() {
  try {
    await client.connect();
    console.log('Connected to DB');
    
    // Add payment_link column
    const query = `
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS payment_link TEXT DEFAULT NULL;
    `;
    
    await client.query(query);
    console.log('Migration successful: Added payment_link to orders');
    
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
