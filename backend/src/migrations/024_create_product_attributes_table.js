'use strict';

exports.up = function (pgm) {
  pgm.createTable('product_attributes', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    product_id: {
      type: 'uuid',
      references: 'products(id)',
      onDelete: 'CASCADE',
      notNull: true,
    },
    attribute_type: {
      type: 'varchar(50)',
      notNull: true,
      default: 'weight', // Can be extended to other attributes like size, color, etc.
    },
    attribute_value: {
      type: 'varchar(100)',
      notNull: true, // e.g., "250g", "500g", "1kg"
    },
    price: {
      type: 'decimal(10,2)',
      notNull: true,
    },
    old_price: {
      type: 'decimal(10,2)',
    },
    stock_quantity: {
      type: 'integer',
      default: 0,
      notNull: true,
    },
    sku_suffix: {
      type: 'varchar(50)',
      // Optional: e.g., "-250g" to append to main SKU
    },
    is_default: {
      type: 'boolean',
      default: false,
      notNull: true,
    },
    display_order: {
      type: 'integer',
      default: 0,
      notNull: true,
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

  // Create index for faster lookups
  pgm.createIndex('product_attributes', 'product_id');
  pgm.createIndex('product_attributes', ['product_id', 'attribute_type']);
  
  // Ensure only one default attribute per product per type
  pgm.sql(`
    CREATE UNIQUE INDEX product_attributes_unique_default 
    ON product_attributes (product_id, attribute_type) 
    WHERE is_default = true
  `);
};

exports.down = function (pgm) {
  pgm.dropTable('product_attributes');
};

