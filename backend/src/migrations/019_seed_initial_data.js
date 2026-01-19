'use strict';

exports.up = function (pgm) {
  return new Promise((resolve, reject) => {
    const db = pgm.db;
    
    // Insert categories
    db.query(`
      INSERT INTO categories (name, slug, description) VALUES
      ('Snacks', 'snacks', 'Delicious snacks and chips'),
      ('Juice', 'juice', 'Fresh fruit juices'),
      ('Chips', 'chips', 'Crunchy chips'),
      ('Spices', 'spices', 'Traditional spices'),
      ('Sauces', 'sauces', 'Condiments and sauces'),
      ('Fruit', 'fruit', 'Fresh fruits'),
      ('Vegetable', 'vegetable', 'Fresh vegetables'),
      ('Tuber Root', 'tuber-root', 'Root vegetables'),
      ('Leaves', 'leaves', 'Leafy vegetables')
      ON CONFLICT (name) DO NOTHING
    `, (err) => {
      if (err) return reject(err);
      
      // Insert brands
      db.query(`
        INSERT INTO brands (name, description) VALUES
        ('Bhisma Organics', 'Organic food products'),
        ('Peoples Store', 'Quality products for everyone'),
        ('Darsh Mart', 'Premium grocery items')
        ON CONFLICT (name) DO NOTHING
      `, (err) => {
        if (err) return reject(err);
        
        // Insert sample products
        db.query(`
          INSERT INTO products (title, sku, description, category_id, brand_id, old_price, new_price, weight, stock_quantity, status, sale_tag, location, primary_image, rating) 
          SELECT 
            'Ground Nuts Oil Pack', 'PROD001', 'Premium ground nut oil', 
            (SELECT id FROM categories WHERE name = 'Snacks' LIMIT 1),
            (SELECT id FROM brands WHERE name = 'Bhisma Organics' LIMIT 1),
            22.00, 15.00, '500g', 50, 'In Stock', 'New', 'In Store', '/assets/img/new-product/1.jpg', 3.0
          WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'PROD001')
        `, (err) => {
          if (err) return reject(err);
          
          db.query(`
            INSERT INTO products (title, sku, description, category_id, brand_id, old_price, new_price, weight, stock_quantity, status, sale_tag, location, primary_image, rating) 
            SELECT 
              'Organic Litchi Juice Pack', 'PROD002', 'Fresh litchi juice',
              (SELECT id FROM categories WHERE name = 'Juice' LIMIT 1),
              (SELECT id FROM brands WHERE name = 'Peoples Store' LIMIT 1),
              30.00, 20.00, '100ml', 30, 'Out Of Stock', 'Trend', 'online', '/assets/img/new-product/2.jpg', 4.0
            WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'PROD002')
          `, (err) => {
            if (err) return reject(err);
            
            // Insert testimonials
            db.query(`
              INSERT INTO testimonials (name, title, description, image, rating, is_active, display_order) VALUES
              ('Isabella Oliver', 'Manager', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', '/assets/img/testimonials/1.jpg', 5, true, 1),
              ('Nikki Albart', 'Team Leader', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', '/assets/img/testimonials/2.jpg', 5, true, 2),
              ('Stephen Smith', 'Co Founder', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.', '/assets/img/testimonials/3.jpg', 5, true, 3)
            `, (err) => {
              if (err) return reject(err);
              
              // Insert sample coupons
              db.query(`
                INSERT INTO coupons (code, discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, valid_from, valid_until, is_active) VALUES
                ('SAVE10', 'percentage', 10.00, 0, 100.00, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 year', true),
                ('SAVE20', 'percentage', 20.00, 100.00, 200.00, 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 year', true),
                ('WELCOME', 'fixed', 50.00, 200.00, 50.00, 1000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 year', true)
                ON CONFLICT (code) DO NOTHING
              `, (err) => {
                if (err) return reject(err);
                resolve();
              });
            });
          });
        });
      });
    });
  });
};

exports.down = function (pgm) {
  return new Promise((resolve, reject) => {
    const db = pgm.db;
    db.query('DELETE FROM coupons', (err) => {
      if (err) return reject(err);
      db.query('DELETE FROM testimonials', (err) => {
        if (err) return reject(err);
        db.query('DELETE FROM products', (err) => {
          if (err) return reject(err);
          db.query('DELETE FROM brands', (err) => {
            if (err) return reject(err);
            db.query('DELETE FROM categories', (err) => {
              if (err) return reject(err);
              resolve();
            });
          });
        });
      });
    });
  });
};
