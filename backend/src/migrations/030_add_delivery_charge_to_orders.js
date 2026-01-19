'use strict';

exports.up = function (pgm) {
  pgm.addColumns('orders', {
    delivery_charge: {
      type: 'decimal(10,2)',
      default: 0,
      notNull: true,
    },
  });
};

exports.down = function (pgm) {
  pgm.dropColumns('orders', ['delivery_charge']);
};
