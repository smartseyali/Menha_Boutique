'use strict';

exports.up = function (pgm) {
  pgm.createTable('order_items', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    order_id: {
      type: 'uuid',
      references: 'orders(id)',
      onDelete: 'CASCADE',
      notNull: true,
    },
    product_id: {
      type: 'uuid',
      references: 'products(id)',
      onDelete: 'SET NULL',
      notNull: true,
    },
    quantity: {
      type: 'integer',
      notNull: true,
    },
    unit_price: {
      type: 'decimal(10,2)',
      notNull: true,
    },
    total_price: {
      type: 'decimal(10,2)',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
      notNull: true,
    },
  });
};

exports.down = function (pgm) {
  pgm.dropTable('order_items');
};

