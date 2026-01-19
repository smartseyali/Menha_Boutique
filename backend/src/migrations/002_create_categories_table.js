'use strict';

exports.up = function (pgm) {
  pgm.createTable('categories', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    slug: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    description: {
      type: 'text',
    },
    image: {
      type: 'text',
    },
    parent_id: {
      type: 'uuid',
      references: 'categories(id)',
      onDelete: 'SET NULL',
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
  pgm.dropTable('categories');
};

