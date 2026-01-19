require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB');

    // Check if delivery_tariffs table exists
    const res = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'delivery_tariffs'
      );
    `);
    
    if (res.rows[0].exists) {
        console.log('Table delivery_tariffs EXISTS.');
        
        // Check for tariff_type column
        const colRes = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'delivery_tariffs' 
            AND column_name = 'tariff_type';
        `);
        
        if (colRes.rows.length > 0) {
            console.log('Column tariff_type EXISTS.');
        } else {
            console.log('Column tariff_type MISSING. Adding it...');
            await client.query(`ALTER TABLE delivery_tariffs ADD COLUMN tariff_type VARCHAR(20) NOT NULL DEFAULT 'WEIGHT';`);
            console.log('Column tariff_type ADDED.');
            
            await client.query(`CREATE INDEX ON delivery_tariffs (tariff_type, max_weight);`);
            console.log('Index created.');
        }

    } else {
        console.log('Table delivery_tariffs MISSING. Creating it...');
        await client.query(`
            CREATE TABLE delivery_tariffs (
                id SERIAL PRIMARY KEY,
                max_weight INTEGER NOT NULL,
                prices JSONB NOT NULL,
                tariff_type VARCHAR(20) NOT NULL DEFAULT 'WEIGHT',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Table delivery_tariffs CREATED.');

        // Seed data
        const tariffs = [
            { max: 750, prices: { TN: 40, SOUTH: 55, REST: 110, NE: 120 } },
            { max: 1700, prices: { TN: 50, SOUTH: 95, REST: 160, NE: 200 } },
            { max: 2700, prices: { TN: 70, SOUTH: 110, REST: 180, NE: 300 } },
            { max: 3700, prices: { TN: 90, SOUTH: 120, REST: 240, NE: 0 } },
            // ... truncated for brevity, standard set
             { max: 20000, prices: { TN: 300, SOUTH: 600, REST: 900, NE: 0 } },
        ];
        
        for (const t of tariffs) {
             await client.query('INSERT INTO delivery_tariffs (max_weight, prices, tariff_type) VALUES ($1, $2, $3)', [t.max, JSON.stringify(t.prices), 'WEIGHT']);
        }
        console.log('Seeded initial WEIGHT tariffs.');
    }
    
    // Check zone column in states
    const zoneRes = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'states' 
        AND column_name = 'zone';
    `);
    
    if (zoneRes.rows.length === 0) {
        console.log('Column zone MISSING in states. Adding it...');
        await client.query(`ALTER TABLE states ADD COLUMN zone VARCHAR(50) NOT NULL DEFAULT 'REST';`);
        
        // Update zones
        await client.query(`UPDATE states SET zone = 'TN' WHERE name = 'Tamil Nadu'`);
        await client.query(`UPDATE states SET zone = 'SOUTH' WHERE name IN ('Andhra Pradesh', 'Karnataka', 'Kerala', 'Puducherry', 'Telangana')`);
        await client.query(`UPDATE states SET zone = 'NE' WHERE name IN ('Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura')`);
        console.log('States zones updated.');
    } else {
        console.log('Column zone EXISTS in states.');
    }


  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
