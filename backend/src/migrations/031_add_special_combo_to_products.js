'use strict';

exports.up = function (pgm) {
  pgm.addColumns('products', {
    is_special: {
      type: 'boolean',
      default: false,
    },
    is_combo: {
      type: 'boolean',
      default: false,
    },
  });
};

exports.down = function (pgm) {
  pgm.dropColumns('products', ['is_special', 'is_combo']);
};
