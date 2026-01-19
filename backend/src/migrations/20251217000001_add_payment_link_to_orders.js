'use strict';

exports.up = function (pgm) {
  pgm.addColumns('orders', {
    payment_link: {
      type: 'text',
      default: null,
    },
  });
};

exports.down = function (pgm) {
  pgm.dropColumns('orders', ['payment_link']);
};
