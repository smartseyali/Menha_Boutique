'use strict';

exports.up = function (pgm) {
  // Make user_id nullable in coupon_usage table to support guest checkout with coupons
  pgm.alterColumn('coupon_usage', 'user_id', {
    notNull: false,
  });
};

exports.down = function (pgm) {
  // Revert user_id to not null
  pgm.alterColumn('coupon_usage', 'user_id', {
    notNull: true,
  });
};
