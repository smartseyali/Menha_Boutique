'use strict';

exports.up = function (pgm) {
  pgm.createTable('coupon_usage', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    coupon_id: {
      type: 'uuid',
      references: 'coupons(id)',
      onDelete: 'CASCADE',
      notNull: true,
    },
    user_id: {
      type: 'uuid',
      references: 'users(id)',
      onDelete: 'CASCADE',
      notNull: true,
    },
    order_id: {
      type: 'uuid',
      references: 'orders(id)',
      onDelete: 'CASCADE',
      notNull: true,
    },
    discount_applied: {
      type: 'decimal(10,2)',
      notNull: true,
    },
    used_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
      notNull: true,
    },
  });
};

exports.down = function (pgm) {
  pgm.dropTable('coupon_usage');
};

