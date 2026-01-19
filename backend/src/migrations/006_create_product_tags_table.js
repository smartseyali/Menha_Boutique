'use strict';

exports.up = function (pgm) {
  pgm.createTable('product_tags', {
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
    tag: {
      type: 'varchar(255)',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
      notNull: true,
    },
  });
  
  pgm.addConstraint('product_tags', 'product_tags_product_id_tag_unique', {
    unique: ['product_id', 'tag'],
  });
};

exports.down = function (pgm) {
  pgm.dropTable('product_tags');
};

