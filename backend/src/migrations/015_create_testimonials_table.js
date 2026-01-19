'use strict';

exports.up = function (pgm) {
  pgm.createTable('testimonials', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    title: {
      type: 'varchar(255)',
    },
    description: {
      type: 'text',
      notNull: true,
    },
    image: {
      type: 'text',
    },
    rating: {
      type: 'integer',
    },
    is_active: {
      type: 'boolean',
      default: true,
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
    updated_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
      notNull: true,
    },
  });
};

exports.down = function (pgm) {
  pgm.dropTable('testimonials');
};

