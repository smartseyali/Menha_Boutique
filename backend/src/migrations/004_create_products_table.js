'use strict';

exports.up = function (pgm) {
  pgm.createTable('products', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    title: {
      type: 'varchar(500)',
      notNull: true,
    },
    sku: {
      type: 'varchar(100)',
      notNull: true,
      unique: true,
    },
    description: {
      type: 'text',
    },
    category_id: {
      type: 'uuid',
      references: 'categories(id)',
      onDelete: 'SET NULL',
    },
    brand_id: {
      type: 'uuid',
      references: 'brands(id)',
      onDelete: 'SET NULL',
    },
    old_price: {
      type: 'decimal(10,2)',
    },
    new_price: {
      type: 'decimal(10,2)',
      notNull: true,
    },
    weight: {
      type: 'varchar(50)',
    },
    stock_quantity: {
      type: 'integer',
      default: 0,
      notNull: true,
    },
    item_left: {
      type: 'varchar(50)',
    },
    status: {
      type: 'varchar(50)',
      default: 'In Stock',
      notNull: true,
    },
    sale_tag: {
      type: 'varchar(50)',
    },
    location: {
      type: 'varchar(100)',
    },
    rating: {
      type: 'decimal(2,1)',
      default: 0,
      notNull: true,
    },
    primary_image: {
      type: 'text',
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
};

exports.down = function (pgm) {
  pgm.dropTable('products');
};

