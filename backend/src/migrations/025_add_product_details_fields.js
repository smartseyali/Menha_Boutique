'use strict';

exports.up = function (pgm) {
  // Add detailed description field (longer text for full product description)
  pgm.addColumn('products', {
    detailed_description: {
      type: 'text',
    },
  });

  // Add product details field (JSON or text for specifications, features, etc.)
  pgm.addColumn('products', {
    product_details: {
      type: 'text',
      // Will store JSON string with details like: {"specifications": {...}, "features": [...]}
    },
  });

  // Add product information field (additional info like care instructions, usage, etc.)
  pgm.addColumn('products', {
    product_information: {
      type: 'text',
      // Will store JSON string with information
    },
  });
};

exports.down = function (pgm) {
  pgm.dropColumn('products', 'detailed_description');
  pgm.dropColumn('products', 'product_details');
  pgm.dropColumn('products', 'product_information');
};

