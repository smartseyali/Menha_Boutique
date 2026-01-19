'use strict';

exports.up = function (pgm) {
  // Visitor attribution table
  pgm.createTable('visitor_attribution', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    visitor_id: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    first_touch_source: {
      type: 'varchar(255)',
      notNull: true,
    },
    first_touch_medium: {
      type: 'varchar(255)',
      notNull: true,
    },
    first_touch_campaign: {
      type: 'varchar(255)',
    },
    last_touch_source: {
      type: 'varchar(255)',
      notNull: true,
    },
    last_touch_medium: {
      type: 'varchar(255)',
      notNull: true,
    },
    last_touch_campaign: {
      type: 'varchar(255)',
    },
    landing_page: {
      type: 'varchar(500)',
    },
    referrer: {
      type: 'text',
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

  // Conversions table
  pgm.createTable('conversions', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    visitor_id: {
      type: 'varchar(255)',
      notNull: true,
    },
    order_id: {
      type: 'varchar(255)',
      notNull: true,
    },
    source: {
      type: 'varchar(255)',
      notNull: true,
    },
    medium: {
      type: 'varchar(255)',
      notNull: true,
    },
    campaign: {
      type: 'varchar(255)',
    },
    conversion_value: {
      type: 'decimal(10,2)',
      notNull: true,
    },
    converted_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
      notNull: true,
    },
  });
  
  // Unique constraint on visitor_id and order_id
  pgm.addConstraint('conversions', 'conversions_visitor_order_unique', {
    unique: ['visitor_id', 'order_id'],
  });

  // Indexes
  pgm.createIndex('visitor_attribution', 'visitor_id', { unique: true });
  pgm.createIndex('visitor_attribution', 'first_touch_source');
  pgm.createIndex('visitor_attribution', 'last_touch_source');
  pgm.createIndex('conversions', 'visitor_id');
  pgm.createIndex('conversions', 'order_id');
  pgm.createIndex('conversions', 'source');
  pgm.createIndex('conversions', 'converted_at');
};

exports.down = function (pgm) {
  pgm.dropTable('conversions');
  pgm.dropTable('visitor_attribution');
};

