const pool = require('../config/database');

class Product {
  static async create(productData) {
    const {
      title, sku, description, detailedDescription, productDetails, productInformation,
      categoryId, brandId, oldPrice, newPrice, weight, stockQuantity, itemLeft, 
      status, saleTag, location, primaryImage, isSpecial, isCombo, sequence
    } = productData;
    
    // Check if new columns exist by querying information_schema
    let hasNewColumns = false;
    try {
      const checkQuery = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name IN ('detailed_description', 'is_special', 'sequence')
      `);
      // Check if critical new columns exist
      hasNewColumns = checkQuery.rows.length >= 1;
    } catch (e) {
      console.warn('Error checking for new product columns:', e.message);
      hasNewColumns = false;
    }
    
    let query, values;
    
    if (hasNewColumns) {
      // Use query with all new columns including is_special/is_combo
      query = `
        INSERT INTO products (
          title, sku, description, detailed_description, product_details, product_information,
          category_id, brand_id, old_price, new_price, weight, stock_quantity, item_left,
          status, sale_tag, location, primary_image, is_special, is_combo, sequence
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING *
      `;
      values = [
        title, sku, description, detailedDescription || null, 
        typeof productDetails === 'object' ? JSON.stringify(productDetails) : (productDetails || null),
        typeof productInformation === 'object' ? JSON.stringify(productInformation) : (productInformation || null),
        categoryId, brandId, oldPrice, newPrice, weight, stockQuantity, itemLeft,
        status || 'In Stock', saleTag, location, primaryImage, isSpecial || false, isCombo || false, sequence || 0
      ];
    } else {
      // Use query without new columns (for backward compatibility)
      query = `
        INSERT INTO products (
          title, sku, description, category_id, brand_id, old_price, new_price, 
          weight, stock_quantity, item_left, status, sale_tag, location, primary_image
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `;
      values = [
        title, sku, description, categoryId, brandId, oldPrice, newPrice, 
        weight, stockQuantity, itemLeft, status || 'In Stock', saleTag, location, primaryImage
      ];
    }
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(options = {}) {
    const { limit = 50, offset = 0, categoryId, status, search } = options;
    let query = `
      SELECT p.*, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (categoryId) {
      query += ` AND p.category_id = $${paramCount++}`;
      values.push(categoryId);
    }

    if (status) {
      query += ` AND p.status = $${paramCount++}`;
      values.push(status);
    }

    if (search) {
      query += ` AND (p.title ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY p.sequence ASC, p.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    // Parse JSON fields for all products (if they exist)
    return result.rows.map(product => {
      // Only try to parse if the field exists and is not null
      if (product.product_details && typeof product.product_details === 'string') {
        try {
          product.product_details = JSON.parse(product.product_details);
        } catch (e) {
          // If parsing fails, keep as string
        }
      }
      if (product.product_information && typeof product.product_information === 'string') {
        try {
          product.product_information = JSON.parse(product.product_information);
        } catch (e) {
          // If parsing fails, keep as string
        }
      }
      return product;
    });
  }

  static async findById(id) {
    const query = `
      SELECT p.*, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows[0]) {
      // Parse JSON fields if they exist and are strings
      const product = result.rows[0];
      if (product.product_details && typeof product.product_details === 'string') {
        try {
          product.product_details = JSON.parse(product.product_details);
        } catch (e) {
          // If parsing fails, keep as string
        }
      }
      if (product.product_information && typeof product.product_information === 'string') {
        try {
          product.product_information = JSON.parse(product.product_information);
        } catch (e) {
          // If parsing fails, keep as string
        }
      }
    }
    return result.rows[0];
  }

  static async count(options = {}) {
    const { categoryId, status, search } = options;
    let query = 'SELECT COUNT(*) as count FROM products WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (categoryId) {
      query += ` AND category_id = $${paramCount++}`;
      values.push(categoryId);
    }

    if (status) {
      query += ` AND status = $${paramCount++}`;
      values.push(status);
    }

    if (search) {
      query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      values.push(`%${search}%`);
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count);
  }

  static async update(id, productData) {
    const {
      title, sku, description, detailedDescription, productDetails, productInformation,
      categoryId, brandId, oldPrice, newPrice, weight, stockQuantity, itemLeft,
      status, saleTag, location, primaryImage, isSpecial, isCombo, sequence
    } = productData;
    
    // Check if new columns exist
    let hasNewColumns = false;
    try {
      const checkQuery = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name IN ('detailed_description', 'is_special', 'sequence')
      `);
      // Check if at least one column exists
      hasNewColumns = checkQuery.rows.length >= 1;
    } catch (e) {
      console.warn('Error checking for new product columns:', e.message);
      hasNewColumns = false;
    }
    
    // Handle JSON fields
    const productDetailsStr = productDetails !== undefined 
      ? (typeof productDetails === 'object' ? JSON.stringify(productDetails) : productDetails)
      : undefined;
    const productInformationStr = productInformation !== undefined
      ? (typeof productInformation === 'object' ? JSON.stringify(productInformation) : productInformation)
      : undefined;
    
    let query, values;
    
    try {
      if (hasNewColumns) {
        // Use query with new columns including is_special/is_combo
        query = `
          UPDATE products 
          SET title = COALESCE($1, title),
              sku = COALESCE($2, sku),
              description = COALESCE($3, description),
              detailed_description = COALESCE($4, detailed_description),
              product_details = COALESCE($5, product_details),
              product_information = COALESCE($6, product_information),
              category_id = COALESCE($7, category_id),
              brand_id = COALESCE($8, brand_id),
              old_price = COALESCE($9, old_price),
              new_price = COALESCE($10, new_price),
              weight = COALESCE($11, weight),
              stock_quantity = COALESCE($12, stock_quantity),
              item_left = COALESCE($13, item_left),
              status = COALESCE($14, status),
              sale_tag = COALESCE($15, sale_tag),
              location = COALESCE($16, location),
              primary_image = COALESCE($17, primary_image),
              is_special = COALESCE($18, is_special),
              is_combo = COALESCE($19, is_combo),
              sequence = COALESCE($20, sequence),
              updated_at = current_timestamp
          WHERE id = $21
          RETURNING *
        `;
        values = [
          title, sku, description, detailedDescription, productDetailsStr, productInformationStr,
          categoryId, brandId, oldPrice, newPrice, weight, stockQuantity, itemLeft,
          status, saleTag, location, primaryImage, isSpecial, isCombo, sequence, id
        ];
      } else {
        // Use query without new columns (for backward compatibility)
        query = `
          UPDATE products 
          SET title = COALESCE($1, title),
              sku = COALESCE($2, sku),
              description = COALESCE($3, description),
              category_id = COALESCE($4, category_id),
              brand_id = COALESCE($5, brand_id),
              old_price = COALESCE($6, old_price),
              new_price = COALESCE($7, new_price),
              weight = COALESCE($8, weight),
              stock_quantity = COALESCE($9, stock_quantity),
              item_left = COALESCE($10, item_left),
              status = COALESCE($11, status),
              sale_tag = COALESCE($12, sale_tag),
              location = COALESCE($13, location),
              primary_image = COALESCE($14, primary_image),
              updated_at = current_timestamp
          WHERE id = $15
          RETURNING *
        `;
        values = [
          title, sku, description, categoryId, brandId, oldPrice, newPrice, 
          weight, stockQuantity, itemLeft, status, saleTag, location, primaryImage, id
        ];
      }
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      // If update fails with column error, try without new columns
      if (error.code === '42703' || error.message.includes('column') || error.message.includes('does not exist')) {
        console.warn('Column error during update, retrying without new columns:', error.message);
        // Retry without new columns (only update fields that exist)
        query = `
          UPDATE products 
          SET title = COALESCE($1, title),
              sku = COALESCE($2, sku),
              description = COALESCE($3, description),
              category_id = COALESCE($4, category_id),
              brand_id = COALESCE($5, brand_id),
              old_price = COALESCE($6, old_price),
              new_price = COALESCE($7, new_price),
              weight = COALESCE($8, weight),
              stock_quantity = COALESCE($9, stock_quantity),
              item_left = COALESCE($10, item_left),
              status = COALESCE($11, status),
              sale_tag = COALESCE($12, sale_tag),
              location = COALESCE($13, location),
              primary_image = COALESCE($14, primary_image),
              updated_at = current_timestamp
          WHERE id = $15
          RETURNING *
        `;
        values = [
          title, sku, description, categoryId, brandId, oldPrice, newPrice, 
          weight, stockQuantity, itemLeft, status, saleTag, location, primaryImage, id
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
      }
      // Re-throw if it's a different error
      throw error;
    }
  }

  static async delete(id) {
    const query = 'DELETE FROM products WHERE id = $1';
    await pool.query(query, [id]);
  }

  static async updateRating(id) {
    const query = `
      UPDATE products 
      SET rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM product_reviews
        WHERE product_id = $1 AND is_approved = true
      ),
      updated_at = current_timestamp
      WHERE id = $1
      RETURNING rating
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0]?.rating || 0;
  }

  static async findBestSelling(limit = 10) {
    const query = `
      SELECT p.*, c.name as category_name, b.name as brand_name, 
             COALESCE(SUM(oi.quantity), 0) as total_sold
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE (o.id IS NULL OR (o.status != 'cancelled' AND o.status != 'failed'))
      GROUP BY p.id, c.id, b.id
      HAVING SUM(oi.quantity) > 0
      ORDER BY total_sold DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    
    // Parse JSON fields
    return result.rows.map(product => {
      // Only try to parse if the field exists and is not null
      if (product.product_details && typeof product.product_details === 'string') {
        try {
          product.product_details = JSON.parse(product.product_details);
        } catch (e) {
          // If parsing fails, keep as string
        }
      }
      if (product.product_information && typeof product.product_information === 'string') {
        try {
          product.product_information = JSON.parse(product.product_information);
        } catch (e) {
          // If parsing fails, keep as string
        }
      }
      return product;
    });
  }
}

module.exports = Product;

