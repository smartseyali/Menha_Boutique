/* eslint-disable camelcase */

exports.up = (pgm) => {
  // 1. Add zone column to states table
  pgm.addColumns('states', {
    zone: { type: 'varchar(50)', notNull: true, default: 'REST' },
  });

  // 2. Create delivery_tariffs table
  pgm.createTable('delivery_tariffs', {
    id: 'id',
    max_weight: { type: 'integer', notNull: true }, // in grams
    prices: { type: 'jsonb', notNull: true }, // { "TN": 40, "SOUTH": 55, ... }
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // 3. Update zones for specific states
  // TN
  pgm.sql(`UPDATE states SET zone = 'TN' WHERE name = 'Tamil Nadu'`);
  
  // SOUTH
  pgm.sql(`UPDATE states SET zone = 'SOUTH' WHERE name IN ('Andhra Pradesh', 'Karnataka', 'Kerala', 'Puducherry', 'Telangana')`);
  
  // NE
  pgm.sql(`UPDATE states SET zone = 'NE' WHERE name IN ('Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura')`);

  // 4. Seed Tariff Data
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

  const values = tariffs.map(t => `(${t.max}, '${JSON.stringify(t.prices)}')`).join(',');
  pgm.sql(`INSERT INTO delivery_tariffs (max_weight, prices) VALUES ${values}`);
};

exports.down = (pgm) => {
  pgm.dropTable('delivery_tariffs');
  pgm.dropColumns('states', ['zone']);
};
