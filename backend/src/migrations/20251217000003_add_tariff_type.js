/* eslint-disable camelcase */

exports.up = (pgm) => {
  // Add tariff_type column to delivery_tariffs table with default 'WEIGHT'
  pgm.addColumns('delivery_tariffs', {
    tariff_type: { type: 'varchar(20)', notNull: true, default: 'WEIGHT' },
  });

  // Create an index for faster lookups
  pgm.createIndex('delivery_tariffs', ['tariff_type', 'max_weight']);
};

exports.down = (pgm) => {
  pgm.dropIndex('delivery_tariffs', ['tariff_type', 'max_weight']);
  pgm.dropColumns('delivery_tariffs', ['tariff_type']);
};
