'use strict';

exports.up = function (pgm) {
  pgm.createTable('coupons', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    code: {
      type: 'varchar(100)',
      notNull: true,
      unique: true,
    },
    discount_type: {
      type: 'varchar(50)',
      notNull: true,
    },
    discount_value: {
      type: 'decimal(10,2)',
      notNull: true,
    },
    min_purchase_amount: {
      type: 'decimal(10,2)',
    },
    max_discount_amount: {
      type: 'decimal(10,2)',
    },
    usage_limit: {
      type: 'integer',
    },
    used_count: {
      type: 'integer',
      default: 0,
      notNull: true,
    },
    valid_from: {
      type: 'timestamp',
      notNull: true,
    },
    valid_until: {
      type: 'timestamp',
      notNull: true,
    },
    is_active: {
      type: 'boolean',
      default: true,
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
  pgm.dropTable('coupons');
};

