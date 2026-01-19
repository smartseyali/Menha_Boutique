const pool = require('../config/database');

class Cart {
  static async findByUserId(userId) {
    const query = `
      SELECT ci.*, p.title, p.new_price, p.old_price, p.primary_image, 
             p.status as product_status, p.stock_quantity, p.item_left
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = $1
      ORDER BY ci.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async addItem(userId, productId, quantity = 1) {
    const query = `
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id) 
      DO UPDATE SET quantity = cart_items.quantity + $3, updated_at = current_timestamp
      RETURNING *
    `;
    const result = await pool.query(query, [userId, productId, quantity]);
    return result.rows[0];
  }

  static async updateQuantity(userId, cartItemId, quantity) {
    const query = `
      UPDATE cart_items 
      SET quantity = $1, updated_at = current_timestamp
      WHERE user_id = $2 AND id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [quantity, userId, cartItemId]);
    return result.rows[0];
  }

  static async removeItem(userId, cartItemId) {
    const query = 'DELETE FROM cart_items WHERE user_id = $1 AND id = $2';
    await pool.query(query, [userId, cartItemId]);
  }

  static async clear(userId) {
    const query = 'DELETE FROM cart_items WHERE user_id = $1';
    await pool.query(query, [userId]);
  }
}

module.exports = Cart;

