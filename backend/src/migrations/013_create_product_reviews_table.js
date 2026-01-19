'use strict';

exports.up = function (pgm) {
  pgm.createTable('product_reviews', {
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
    user_id: {
      type: 'uuid',
      references: 'users(id)',
      onDelete: 'CASCADE',
      notNull: true,
    },
    rating: {
      type: 'integer',
      notNull: true,
      check: 'rating >= 1 AND rating <= 5',
    },
    comment: {
      type: 'text',
      notNull: true,
    },
    avatar_url: {
      type: 'text',
    },
    is_approved: {
      type: 'boolean',
      default: false,
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
      notNull: true,
    },
    updated_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
      notNull: true,
    },
  });
};

exports.down = function (pgm) {
  pgm.dropTable('product_reviews');
};

