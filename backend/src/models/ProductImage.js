const pool = require('../config/database');

class ProductImage {
  static async create(imageData) {
    const { productId, imageUrl, isPrimary, displayOrder } = imageData;
    const query = `
      INSERT INTO product_images (product_id, image_url, is_primary, display_order)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [productId, imageUrl, isPrimary || false, displayOrder || 0];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByProductId(productId) {
    const query = 'SELECT * FROM product_images WHERE product_id = $1 ORDER BY display_order, created_at';
    const result = await pool.query(query, [productId]);
    return result.rows;
  }

  static async delete(id) {
    const query = 'DELETE FROM product_images WHERE id = $1';
    await pool.query(query, [id]);
  }

  static async deleteByProductId(productId) {
    const query = 'DELETE FROM product_images WHERE product_id = $1';
    await pool.query(query, [productId]);
  }
}

module.exports = ProductImage;

