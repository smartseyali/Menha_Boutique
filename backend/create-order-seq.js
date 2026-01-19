const pool = require('./src/config/database');

async function migrate() {
  try {
    // Check if sequence exists to avoid error if re-running
    // But create sequence is idempotent with IF NOT EXISTS usually, but pg standard doesn't always support IF NOT EXISTS for CREATE SEQUENCE in older versions.
    // However, we can just try/catch or check.
    
    // Create sequence starting at 1
    await pool.query(`CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;`);
    console.log("Created sequence 'order_number_seq'");

  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    pool.end();
  }
}

migrate();
