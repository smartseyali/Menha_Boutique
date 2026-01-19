'use strict';

exports.up = function (pgm) {
  pgm.createTable('addresses', {
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
    first_name: {
      type: 'varchar(255)',
      notNull: true,
    },
    last_name: {
      type: 'varchar(255)',
      notNull: true,
    },
    address_line: {
      type: 'varchar(500)',
      notNull: true,
    },
    city: {
      type: 'varchar(255)',
      notNull: true,
    },
    postal_code: {
      type: 'varchar(50)',
      notNull: true,
    },
    state: {
      type: 'varchar(100)',
    },
    state_name: {
      type: 'varchar(255)',
    },
    country: {
      type: 'varchar(100)',
      notNull: true,
    },
    country_name: {
      type: 'varchar(255)',
    },
    is_default: {
      type: 'boolean',
      default: false,
      notNull: true,
    },
    address_type: {
      type: 'varchar(50)',
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
  pgm.dropTable('addresses');
};

