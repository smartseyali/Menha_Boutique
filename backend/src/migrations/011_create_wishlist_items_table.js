'use strict';

exports.up = function (pgm) {
  pgm.createTable('wishlist_items', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    user_id: {
      type: 'uuid',
      references: 'users(id)',
      onDelete: 'CASCADE',
      notNull: true,
    },
    product_id: {
      type: 'uuid',
      references: 'products(id)',
      onDelete: 'CASCADE',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
      notNull: true,
    },
  });
  
  pgm.addConstraint('wishlist_items', 'wishlist_items_user_id_product_id_unique', {
    unique: ['user_id', 'product_id'],
  });
};

exports.down = function (pgm) {
  pgm.dropTable('wishlist_items');
};

