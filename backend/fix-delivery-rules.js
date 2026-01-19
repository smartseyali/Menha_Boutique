const pool = require('./src/config/database');

async function migrate() {
  try {
    console.log("Starting migration to fix delivery_rules.state_id type...");

    // Drop the table to minimize conflict with existing invalid data types
    // Since this is a new feature, data loss in this table should be acceptable/expected during dev.
    await pool.query(`DROP TABLE IF EXISTS delivery_rules;`);
    console.log("Dropped delivery_rules table.");

    // Recreate with correct types
    await pool.query(`
      CREATE TABLE delivery_rules (
        id SERIAL PRIMARY KEY,
        state_id UUID UNIQUE, 
        base_weight_grams INTEGER DEFAULT 1000,
        base_cost DECIMAL(10,2) DEFAULT 40.00,
        tier1_limit_grams INTEGER DEFAULT 5000,
        tier1_per_kg_cost DECIMAL(10,2) DEFAULT 40.00,
        tier2_per_kg_cost DECIMAL(10,2) DEFAULT 25.00,
        tiers JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Recreated delivery_rules table with state_id as UUID and tiers as JSONB.");

  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    pool.end();
  }
}

migrate();
