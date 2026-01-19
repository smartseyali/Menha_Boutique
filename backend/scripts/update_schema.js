const db = require('../src/config/database');

async function updateSchema() {
  try {
    console.log('Starting schema update...');

    // 1. Add zone column to states table if not exists
    await db.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='states' AND column_name='zone') THEN 
          ALTER TABLE states ADD COLUMN zone VARCHAR(50) DEFAULT 'REST'; 
        END IF; 
      END $$;
    `);
    console.log('Added zone column to states.');

    // 2. Create delivery_tariffs table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS delivery_tariffs (
        id SERIAL PRIMARY KEY,
        max_weight INTEGER NOT NULL,
        prices JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created delivery_tariffs table.');

    // 3. Update zones
    await db.query(`UPDATE states SET zone = 'TN' WHERE name = 'Tamil Nadu'`);
    await db.query(`UPDATE states SET zone = 'SOUTH' WHERE name IN ('Andhra Pradesh', 'Karnataka', 'Kerala', 'Puducherry', 'Telangana')`);
    await db.query(`UPDATE states SET zone = 'NE' WHERE name IN ('Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura')`);
    console.log('Updated zones.');

    // 4. Seed Tariffs (Clear old ones to avoid duplicates if re-run, or check existence)
    // Verify if data exists
    const check = await db.query('SELECT count(*) FROM delivery_tariffs');
    if (parseInt(check.rows[0].count) === 0) {
        const tariffs = [
            { max: 750, prices: { TN: 40, SOUTH: 55, REST: 110, NE: 120 } },
            { max: 1700, prices: { TN: 50, SOUTH: 95, REST: 160, NE: 200 } },
            { max: 2700, prices: { TN: 70, SOUTH: 110, REST: 180, NE: 300 } },
            { max: 3700, prices: { TN: 90, SOUTH: 120, REST: 240, NE: 0 } },
            { max: 4700, prices: { TN: 110, SOUTH: 150, REST: 250, NE: 0 } },
            { max: 5700, prices: { TN: 120, SOUTH: 180, REST: 300, NE: 0 } },
            { max: 6700, prices: { TN: 140, SOUTH: 210, REST: 350, NE: 0 } },
            { max: 7700, prices: { TN: 160, SOUTH: 240, REST: 400, NE: 0 } },
            { max: 8700, prices: { TN: 180, SOUTH: 270, REST: 450, NE: 0 } },
            { max: 9700, prices: { TN: 200, SOUTH: 300, REST: 500, NE: 0 } },
            { max: 12000, prices: { TN: 220, SOUTH: 360, REST: 600, NE: 0 } },
            { max: 15000, prices: { TN: 240, SOUTH: 450, REST: 750, NE: 0 } },
            { max: 20000, prices: { TN: 300, SOUTH: 600, REST: 900, NE: 0 } },
        ];

        for (const t of tariffs) {
            await db.query('INSERT INTO delivery_tariffs (max_weight, prices) VALUES ($1, $2)', [t.max, t.prices]);
        }
        console.log('Seeded tariffs.');
    } else {
        console.log('Tariffs already exist, skipping seed.');
    }

    console.log('Schema update complete.');
    process.exit(0);
  } catch (error) {
    console.error('Schema update failed:', error);
    process.exit(1);
  }
}

updateSchema();
