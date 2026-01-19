'use strict';

exports.up = function (pgm) {
  pgm.addColumns('orders', {
    payment_transaction_id: {
      type: 'varchar(255)',
    },
    payment_gateway: {
      type: 'varchar(50)',
    },
    payment_signature: {
      type: 'text',
    },
  });
};

exports.down = function (pgm) {
  pgm.dropColumns('orders', ['payment_transaction_id', 'payment_gateway', 'payment_signature']);
};

