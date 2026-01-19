'use strict';

exports.up = function (pgm) {
  pgm.createTable('orders', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    order_number: {
      type: 'varchar(100)',
      notNull: true,
      unique: true,
    },
    user_id: {
      type: 'uuid',
      references: 'users(id)',
      onDelete: 'SET NULL',
    },
    shipping_address_id: {
      type: 'uuid',
      references: 'addresses(id)',
      onDelete: 'SET NULL',
    },
    billing_address_id: {
      type: 'uuid',
      references: 'addresses(id)',
      onDelete: 'SET NULL',
    },
    shipping_method: {
      type: 'varchar(100)',
      default: 'free',
      notNull: true,
    },
    total_items: {
      type: 'integer',
      default: 0,
      notNull: true,
    },
    subtotal: {
      type: 'decimal(10,2)',
      notNull: true,
    },
    discount_amount: {
      type: 'decimal(10,2)',
      default: 0,
      notNull: true,
    },
    vat: {
      type: 'decimal(10,2)',
      default: 0,
      notNull: true,
    },
    total_price: {
      type: 'decimal(10,2)',
      notNull: true,
    },
    coupon_code: {
      type: 'varchar(100)',
    },
    status: {
      type: 'varchar(50)',
      default: 'pending',
      notNull: true,
    },
    payment_method: {
      type: 'varchar(100)',
    },
    payment_status: {
      type: 'varchar(50)',
      default: 'pending',
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
  pgm.dropTable('orders');
};

