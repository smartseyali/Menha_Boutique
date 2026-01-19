const pool = require('../config/database');

class Wishlist {
  static async findByUserId(userId) {
    const query = `
      SELECT w.*, p.title, p.new_price, p.old_price, p.primary_image, 
             p.status, p.stock_quantity, p.rating, p.sale_tag
      FROM wishlist_items w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async addItem(userId, productId) {
    const query = `
      INSERT INTO wishlist_items (user_id, product_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, product_id) DO NOTHING
      RETURNING *
    `;
    const result = await pool.query(query, [userId, productId]);
    return result.rows[0];
  }

  static async removeItem(userId, productId) {
    const query = 'DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2';
    await pool.query(query, [userId, productId]);
  }

  static async removeItemById(userId, wishlistItemId) {
    const query = 'DELETE FROM wishlist_items WHERE user_id = $1 AND id = $2';
    await pool.query(query, [userId, wishlistItemId]);
  }

  static async isInWishlist(userId, productId) {
    const query = 'SELECT * FROM wishlist_items WHERE user_id = $1 AND product_id = $2';
    const result = await pool.query(query, [userId, productId]);
    return result.rows.length > 0;
  }
}

module.exports = Wishlist;

