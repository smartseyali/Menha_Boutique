const pool = require('../config/database');

class ProductAttribute {
  static async create(attributeData) {
    const {
      productId, attributeType, attributeValue, price, oldPrice,
      stockQuantity, skuSuffix, isDefault, displayOrder
    } = attributeData;
    const query = `
      INSERT INTO product_attributes (
        product_id, attribute_type, attribute_value, price, old_price,
        stock_quantity, sku_suffix, is_default, display_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      productId, attributeType || 'weight', attributeValue, price, oldPrice,
      stockQuantity || 0, skuSuffix, isDefault || false, displayOrder || 0
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByProductId(productId, attributeType = null) {
    // Check if table exists first
    try {
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'product_attributes'
        )
      `);
      
      if (!tableCheck.rows[0].exists) {
        // Table doesn't exist, return empty array
        return [];
      }
    } catch (error) {
      // If check fails, assume table doesn't exist
      return [];
    }
    
    let query = `
      SELECT * FROM product_attributes
      WHERE product_id = $1
    `;
    const values = [productId];
    
    if (attributeType) {
      query += ` AND attribute_type = $2`;
      values.push(attributeType);
    }
    
    query += ` ORDER BY display_order ASC, attribute_value ASC`;
    
    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      // If query fails (table might not exist), return empty array
      console.warn('Error fetching product attributes:', error.message);
      return [];
    }
  }

  static async findById(id) {
    const query = 'SELECT * FROM product_attributes WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, attributeData) {
    const {
      attributeValue, price, oldPrice, stockQuantity, skuSuffix, isDefault, displayOrder
    } = attributeData;
    const query = `
      UPDATE product_attributes 
      SET attribute_value = COALESCE($1, attribute_value),
          price = COALESCE($2, price),
          old_price = COALESCE($3, old_price),
          stock_quantity = COALESCE($4, stock_quantity),
          sku_suffix = COALESCE($5, sku_suffix),
          is_default = COALESCE($6, is_default),
          display_order = COALESCE($7, display_order),
          updated_at = current_timestamp
      WHERE id = $8
      RETURNING *
    `;
    const values = [
      attributeValue, price, oldPrice, stockQuantity, skuSuffix, isDefault, displayOrder, id
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM product_attributes WHERE id = $1';
    await pool.query(query, [id]);
  }

  static async deleteByProductId(productId) {
    const query = 'DELETE FROM product_attributes WHERE product_id = $1';
    await pool.query(query, [productId]);
  }

  static async setDefault(productId, attributeId, attributeType) {
    // First, unset all defaults for this product and attribute type
    await pool.query(
      'UPDATE product_attributes SET is_default = false WHERE product_id = $1 AND attribute_type = $2',
      [productId, attributeType]
    );
    
    // Then set the specified attribute as default
    const query = `
      UPDATE product_attributes 
      SET is_default = true, updated_at = current_timestamp
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [attributeId]);
    return result.rows[0];
  }
}

module.exports = ProductAttribute;

