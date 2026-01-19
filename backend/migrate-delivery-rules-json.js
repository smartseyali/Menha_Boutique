const pool = require('./src/config/database');

async function migrate() {
  try {
    // 1. Ensure table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS delivery_rules (
        id SERIAL PRIMARY KEY,
        state_id INTEGER UNIQUE,
        base_weight_grams INTEGER DEFAULT 1000,
        base_cost DECIMAL(10,2) DEFAULT 40.00,
        tier1_limit_grams INTEGER DEFAULT 5000,
        tier1_per_kg_cost DECIMAL(10,2) DEFAULT 40.00,
        tier2_per_kg_cost DECIMAL(10,2) DEFAULT 25.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'delivery_rules' check/create completed.");

    // 2. Add 'tiers' column
    // Check if column exists first
    const checkCol = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='delivery_rules' AND column_name='tiers';
    `);

    if (checkCol.rows.length === 0) {
      await pool.query(`ALTER TABLE delivery_rules ADD COLUMN tiers TEXT DEFAULT '[]'`);
      console.log("Column 'tiers' added.");
    } else {
      console.log("Column 'tiers' already exists.");
    }

  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    pool.end();
  }
}

migrate();
