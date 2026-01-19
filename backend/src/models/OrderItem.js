const pool = require('../config/database');

class OrderItem {
  static async create(itemData) {
    const { orderId, productId, quantity, unitPrice, totalPrice } = itemData;
    const query = `
      INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [orderId, productId, quantity, unitPrice, totalPrice];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async createBulk(items) {
    if (items.length === 0) return [];
    
    const values = [];
    const placeholders = [];
    items.forEach((item, index) => {
      const base = index * 5;
      placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`);
      values.push(item.orderId, item.productId, item.quantity, item.unitPrice, item.totalPrice);
    });

    const query = `
      INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
      VALUES ${placeholders.join(', ')}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findByOrderId(orderId) {
    const query = `
      SELECT oi.*, p.title, p.primary_image, p.sku
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `;
    const result = await pool.query(query, [orderId]);
    return result.rows;
  }
}

module.exports = OrderItem;

