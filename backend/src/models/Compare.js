const pool = require('../config/database');

class Compare {
  static async findByUserId(userId) {
    const query = `
      SELECT c.*, p.title, p.new_price, p.old_price, p.primary_image, 
             p.status, p.stock_quantity, p.rating, p.weight, p.description
      FROM compare_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async addItem(userId, productId) {
    const query = `
      INSERT INTO compare_items (user_id, product_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, product_id) DO NOTHING
      RETURNING *
    `;
    const result = await pool.query(query, [userId, productId]);
    return result.rows[0];
  }

  static async removeItem(userId, productId) {
    const query = 'DELETE FROM compare_items WHERE user_id = $1 AND product_id = $2';
    await pool.query(query, [userId, productId]);
  }

  static async clear(userId) {
    const query = 'DELETE FROM compare_items WHERE user_id = $1';
    await pool.query(query, [userId]);
  }
}

module.exports = Compare;

