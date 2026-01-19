const pool = require('../config/database');

class ProductTag {
  static async create(tagData) {
    const { productId, tag } = tagData;
    const query = `
      INSERT INTO product_tags (product_id, tag)
      VALUES ($1, $2)
      ON CONFLICT (product_id, tag) DO NOTHING
      RETURNING *
    `;
    const result = await pool.query(query, [productId, tag]);
    return result.rows[0];
  }

  static async findByProductId(productId) {
    const query = 'SELECT * FROM product_tags WHERE product_id = $1';
    const result = await pool.query(query, [productId]);
    return result.rows;
  }

  static async delete(id) {
    const query = 'DELETE FROM product_tags WHERE id = $1';
    await pool.query(query, [id]);
  }

  static async deleteByProductId(productId) {
    const query = 'DELETE FROM product_tags WHERE product_id = $1';
    await pool.query(query, [productId]);
  }
}

module.exports = ProductTag;

