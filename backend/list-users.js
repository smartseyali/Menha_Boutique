require('dotenv').config();
const { Pool } = require('pg');
const config = require('./src/config/config');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

async function listUsers() {
  try {
    const res = await pool.query('SELECT phone_number, email, role FROM users LIMIT 10');
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

listUsers();
