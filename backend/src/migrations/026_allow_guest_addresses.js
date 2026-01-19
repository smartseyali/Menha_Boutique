'use strict';

exports.up = function (pgm) {
  // Make user_id nullable in addresses table to support guest checkout
  pgm.alterColumn('addresses', 'user_id', {
    notNull: false,
  });
};

exports.down = function (pgm) {
  // Revert user_id to not null (warning: this will fail if there are records with null user_id)
  pgm.alterColumn('addresses', 'user_id', {
    notNull: true,
  });
};
