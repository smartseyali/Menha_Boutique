'use strict';

exports.up = function (pgm) {
  pgm.createTable('delivery_charges', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    state_id: {
      type: 'uuid',
      references: 'states(id)',
      onDelete: 'CASCADE',
      notNull: true,
    },
    attribute_value: {
      type: 'varchar(100)',
      notNull: true, // e.g., "250g", "500g", "1kg"
    },
    amount: {
      type: 'decimal(10,2)',
      notNull: true,
      default: 0,
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
      notNull: true,
    },
    updated_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
      notNull: true,
    },
  });

  // Create indexes
  pgm.createIndex('delivery_charges', 'state_id');
  pgm.createIndex('delivery_charges', ['state_id', 'attribute_value'], { unique: true });
};

exports.down = function (pgm) {
  pgm.dropTable('delivery_charges');
};
