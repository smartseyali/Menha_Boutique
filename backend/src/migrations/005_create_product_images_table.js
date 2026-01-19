'use strict';

exports.up = function (pgm) {
  pgm.createTable('product_images', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    product_id: {
      type: 'uuid',
      references: 'products(id)',
      onDelete: 'CASCADE',
      notNull: true,
    },
    image_url: {
      type: 'text',
      notNull: true,
    },
    is_primary: {
      type: 'boolean',
      default: false,
      notNull: true,
    },
    display_order: {
      type: 'integer',
      default: 0,
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
      notNull: true,
    },
  });
};

exports.down = function (pgm) {
  pgm.dropTable('product_images');
};

