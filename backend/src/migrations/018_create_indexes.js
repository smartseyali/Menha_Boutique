'use strict';

exports.up = function (pgm) {
  // Users indexes
  pgm.createIndex('users', 'email', { unique: true });
  
  // Products indexes
  pgm.createIndex('products', 'category_id');
  pgm.createIndex('products', 'brand_id');
  pgm.createIndex('products', 'status');
  pgm.createIndex('products', 'sku', { unique: true });
  
  // Orders indexes
  pgm.createIndex('orders', 'user_id');
  pgm.createIndex('orders', 'order_number', { unique: true });
  pgm.createIndex('orders', 'status');
  
  // Order items indexes
  pgm.createIndex('order_items', 'order_id');
  pgm.createIndex('order_items', 'product_id');
  
  // Cart items indexes
  pgm.createIndex('cart_items', 'user_id');
  pgm.createIndex('cart_items', 'product_id');
  
  // Wishlist items indexes
  pgm.createIndex('wishlist_items', 'user_id');
  pgm.createIndex('wishlist_items', 'product_id');
  
  // Compare items indexes
  pgm.createIndex('compare_items', 'user_id');
  pgm.createIndex('compare_items', 'product_id');
  
  // Product reviews indexes
  pgm.createIndex('product_reviews', 'product_id');
  pgm.createIndex('product_reviews', 'user_id');
  pgm.createIndex('product_reviews', 'is_approved');
  
  // Blogs indexes
  pgm.createIndex('blogs', 'is_published');
  pgm.createIndex('blogs', 'category');
  pgm.createIndex('blogs', 'slug', { unique: true });
  
  // Addresses indexes
  pgm.createIndex('addresses', 'user_id');
  
  // Product images indexes
  pgm.createIndex('product_images', 'product_id');
  
  // Product tags indexes
  pgm.createIndex('product_tags', 'product_id');
  pgm.createIndex('product_tags', 'tag');
  
  // Coupons indexes
  pgm.createIndex('coupons', 'code', { unique: true });
  pgm.createIndex('coupons', 'is_active');
  
  // Coupon usage indexes
  pgm.createIndex('coupon_usage', 'coupon_id');
  pgm.createIndex('coupon_usage', 'user_id');
  pgm.createIndex('coupon_usage', 'order_id');
};

exports.down = function (pgm) {
  pgm.dropIndex('users', 'email');
  pgm.dropIndex('products', 'category_id');
  pgm.dropIndex('products', 'brand_id');
  pgm.dropIndex('products', 'status');
  pgm.dropIndex('products', 'sku');
  pgm.dropIndex('orders', 'user_id');
  pgm.dropIndex('orders', 'order_number');
  pgm.dropIndex('orders', 'status');
  pgm.dropIndex('order_items', 'order_id');
  pgm.dropIndex('order_items', 'product_id');
  pgm.dropIndex('cart_items', 'user_id');
  pgm.dropIndex('cart_items', 'product_id');
  pgm.dropIndex('wishlist_items', 'user_id');
  pgm.dropIndex('wishlist_items', 'product_id');
  pgm.dropIndex('compare_items', 'user_id');
  pgm.dropIndex('compare_items', 'product_id');
  pgm.dropIndex('product_reviews', 'product_id');
  pgm.dropIndex('product_reviews', 'user_id');
  pgm.dropIndex('product_reviews', 'is_approved');
  pgm.dropIndex('blogs', 'is_published');
  pgm.dropIndex('blogs', 'category');
  pgm.dropIndex('blogs', 'slug');
  pgm.dropIndex('addresses', 'user_id');
  pgm.dropIndex('product_images', 'product_id');
  pgm.dropIndex('product_tags', 'product_id');
  pgm.dropIndex('product_tags', 'tag');
  pgm.dropIndex('coupons', 'code');
  pgm.dropIndex('coupons', 'is_active');
  pgm.dropIndex('coupon_usage', 'coupon_id');
  pgm.dropIndex('coupon_usage', 'user_id');
  pgm.dropIndex('coupon_usage', 'order_id');
};

