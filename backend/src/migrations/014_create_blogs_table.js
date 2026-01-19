'use strict';

exports.up = function (pgm) {
  pgm.createTable('blogs', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    category: {
      type: 'varchar(255)',
      notNull: true,
    },
    title: {
      type: 'varchar(500)',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: true,
    },
    image: {
      type: 'text',
    },
    content: {
      type: 'text',
    },
    author_id: {
      type: 'uuid',
      references: 'users(id)',
      onDelete: 'SET NULL',
    },
    slug: {
      type: 'varchar(500)',
      notNull: true,
      unique: true,
    },
    is_published: {
      type: 'boolean',
      default: false,
      notNull: true,
    },
    published_at: {
      type: 'timestamp',
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
  pgm.dropTable('blogs');
};

