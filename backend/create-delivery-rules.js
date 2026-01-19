const pool = require('./src/config/database');

async function createTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS delivery_rules (
        id SERIAL PRIMARY KEY,
        state_id INTEGER REFERENCES states(id) UNIQUE,
        base_weight_grams INTEGER NOT NULL DEFAULT 1000,
        base_cost DECIMAL(10,2) NOT NULL DEFAULT 40.00,
        tier1_limit_grams INTEGER NOT NULL DEFAULT 5000,
        tier1_per_kg_cost DECIMAL(10,2) NOT NULL DEFAULT 40.00,
        tier2_per_kg_cost DECIMAL(10,2) NOT NULL DEFAULT 25.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("delivery_rules table created successfully");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    pool.end();
  }
}

createTable();
