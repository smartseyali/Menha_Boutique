'use strict';

exports.up = function (pgm) {
  // Create countries table
  pgm.createTable('countries', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    code: {
      type: 'varchar(10)',
      notNull: true,
      unique: true,
    },
    is_active: {
      type: 'boolean',
      default: true,
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

  // Create states table
  pgm.createTable('states', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    country_id: {
      type: 'uuid',
      references: 'countries(id)',
      onDelete: 'CASCADE',
      notNull: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    code: {
      type: 'varchar(10)',
    },
    is_active: {
      type: 'boolean',
      default: true,
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

  // Create cities table
  pgm.createTable('cities', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    state_id: {
      type: 'uuid',
      references: 'states(id)',
      onDelete: 'CASCADE',
      notNull: true,
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    is_active: {
      type: 'boolean',
      default: true,
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

  // Create indexes
  pgm.createIndex('states', 'country_id');
  pgm.createIndex('cities', 'state_id');
  pgm.createIndex('countries', 'code');
  pgm.createIndex('countries', 'is_active');
  pgm.createIndex('states', 'is_active');
  pgm.createIndex('cities', 'is_active');
};

exports.down = function (pgm) {
  pgm.dropTable('cities');
  pgm.dropTable('states');
  pgm.dropTable('countries');
};

