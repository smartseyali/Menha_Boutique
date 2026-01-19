'use strict';

exports.up = function (pgm) {
  console.log('Running up migration for sequence');
  pgm.addColumns('products', {
    sequence: {
      type: 'integer',
      default: 0,
    },
  });
  pgm.addColumns('categories', {
    sequence: {
      type: 'integer',
      default: 0,
    },
  });
};

exports.down = function (pgm) {
  pgm.dropColumns('products', ['sequence']);
  pgm.dropColumns('categories', ['sequence']);
};
