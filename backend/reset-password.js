require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const config = require('./src/config/config');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

async function resetPassword(phoneNumber, newPassword) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    
    await pool.query('UPDATE users SET password_hash = $1 WHERE phone_number = $2', [hash, phoneNumber]);
    console.log(`Password updated for ${phoneNumber}`);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

const phoneNumber = process.argv[2];
const newPass = process.argv[3];

if (phoneNumber && newPass) {
    resetPassword(phoneNumber, newPass);
} else {
    console.log("Usage: node reset-password.js <phone> <pass>");
}
