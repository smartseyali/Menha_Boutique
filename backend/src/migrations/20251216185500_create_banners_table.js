/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('banners', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    title: {
      type: 'text',
      notNull: true,
    },
    subtitle: {
      type: 'text',
    },
    image_url: {
      type: 'text',
      notNull: true,
    },
    link: {
      type: 'text',
    },
    type: {
      type: 'varchar(50)',
      default: 'main',
      notNull: true,
    },
    sequence: {
      type: 'integer',
      default: 0,
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
  }, {
    ifNotExists: true
  });
};

exports.down = pgm => {
  pgm.dropTable('banners');
};
