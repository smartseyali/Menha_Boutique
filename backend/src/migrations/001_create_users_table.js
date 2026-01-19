'use strict';

var nodePgMigrate = require('node-pg-migrate');

exports.up = function (pgm) {
  pgm.createExtension('uuid-ossp', { ifNotExists: true });
  
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    password_hash: {
      type: 'varchar(255)',
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
    phone_number: {
      type: 'varchar(50)',
    },
    profile_photo: {
      type: 'text',
    },
    description: {
      type: 'text',
    },
    is_active: {
      type: 'boolean',
      default: true,
      notNull: true,
    },
    role: {
      type: 'varchar(50)',
      default: 'customer',
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
  pgm.dropTable('users');
  pgm.dropExtension('uuid-ossp', { ifExists: true });
};

