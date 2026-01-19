const pool = require('../config/database');

class Order {
  static async create(orderData) {
    const {
      userId, shippingAddressId, billingAddressId, shippingMethod,
      totalItems, subtotal, discountAmount, vat, totalPrice, couponCode,
      paymentMethod, paymentStatus, email
    } = orderData;
    
    // Generate unique order number using sequence
    const seqResult = await pool.query("SELECT nextval('order_number_seq')");
    const nextVal = seqResult.rows[0].nextval;
    const orderNumber = `PK-${nextVal.toString().padStart(3, '0')}`;
    
    const query = `
      INSERT INTO orders (order_number, user_id, shipping_address_id, billing_address_id,
                         shipping_method, total_items, subtotal, discount_amount, vat,
                         total_price, coupon_code, payment_method, payment_status, delivery_charge, email)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    const values = [orderNumber, userId, shippingAddressId, billingAddressId,
                   shippingMethod || 'free', totalItems, subtotal, discountAmount || 0,
                   vat || 0, totalPrice, couponCode, paymentMethod, paymentStatus || 'pending',
                   orderData.deliveryCharge || 0, email];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT o.*, 
             sa.first_name as shipping_first_name, sa.last_name as shipping_last_name,
             sa.address_line as shipping_address, sa.city as shipping_city,
             sa.postal_code as shipping_postal_code, sa.country as shipping_country,
             ba.first_name as billing_first_name, ba.last_name as billing_last_name,
             ba.address_line as billing_address, ba.city as billing_city,
             ba.postal_code as billing_postal_code, ba.country as billing_country
      FROM orders o
      LEFT JOIN addresses sa ON o.shipping_address_id = sa.id
      LEFT JOIN addresses ba ON o.billing_address_id = ba.id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT o.*, 
             sa.first_name as shipping_first_name, sa.last_name as shipping_last_name,
             sa.address_line as shipping_address, sa.city as shipping_city,
             sa.postal_code as shipping_postal_code, sa.country as shipping_country,
             ba.first_name as billing_first_name, ba.last_name as billing_last_name,
             ba.address_line as billing_address, ba.city as billing_city,
             ba.postal_code as billing_postal_code, ba.country as billing_country
      FROM orders o
      LEFT JOIN addresses sa ON o.shipping_address_id = sa.id
      LEFT JOIN addresses ba ON o.billing_address_id = ba.id
      WHERE o.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByOrderNumber(orderNumber) {
    const query = 'SELECT * FROM orders WHERE order_number = $1';
    const result = await pool.query(query, [orderNumber]);
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE orders 
      SET status = $1, updated_at = current_timestamp
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }

  static async updatePaymentStatus(id, paymentStatus) {
    const query = `
      UPDATE orders 
      SET payment_status = $1, updated_at = current_timestamp
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [paymentStatus, id]);
    return result.rows[0];
  }

  static async updatePaymentInfo(id, paymentInfo) {
    const { payment_gateway, payment_transaction_id, payment_signature } = paymentInfo;
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (payment_gateway !== undefined) {
      updates.push(`payment_gateway = $${paramCount++}`);
      values.push(payment_gateway);
    }
    if (payment_transaction_id !== undefined) {
      updates.push(`payment_transaction_id = $${paramCount++}`);
      values.push(payment_transaction_id);
    }
    if (payment_signature !== undefined) {
      updates.push(`payment_signature = $${paramCount++}`);
      values.push(payment_signature);
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE orders 
      SET ${updates.join(', ')}, updated_at = current_timestamp
      WHERE id = $${paramCount}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updatePaymentLink(id, link) {
    const query = `
      UPDATE orders 
      SET payment_link = $1, updated_at = current_timestamp
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [link, id]);
    return result.rows[0];
  }

  static async findByPaymentTransactionId(transactionId) {
    const query = 'SELECT * FROM orders WHERE payment_transaction_id = $1';
    const result = await pool.query(query, [transactionId]);
    return result.rows;
  }

  static async findAll(options = {}) {
    const { page = 1, limit = 50, status, fromDate, toDate, search } = options;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const values = [];
    let paramCount = 1;
    let whereConditions = [];

    if (status) {
      whereConditions.push(`o.status = $${paramCount++}`);
      values.push(status);
    }

    if (fromDate) {
      whereConditions.push(`o.created_at::date >= $${paramCount++}`);
      values.push(fromDate);
    }

    if (toDate) {
      whereConditions.push(`o.created_at::date <= $${paramCount++}`);
      values.push(toDate);
    }

    if (search) {
      const searchTerm = `%${search}%`;
      whereConditions.push(`(
        o.order_number ILIKE $${paramCount} OR 
        u.first_name ILIKE $${paramCount} OR 
        u.last_name ILIKE $${paramCount} OR 
        u.phone_number ILIKE $${paramCount} OR 
        u.email ILIKE $${paramCount} OR 
        sa.first_name ILIKE $${paramCount} OR 
        sa.last_name ILIKE $${paramCount}
      )`);
      values.push(searchTerm);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
      SELECT o.*, 
             sa.first_name as shipping_first_name, sa.last_name as shipping_last_name,
             sa.address_line as shipping_address, sa.city as shipping_city,
             sa.postal_code as shipping_postal_code, sa.country as shipping_country,
             ba.first_name as billing_first_name, ba.last_name as billing_last_name,
             ba.address_line as billing_address, ba.city as billing_city,
             ba.postal_code as billing_postal_code, ba.country as billing_country,
             u.email as user_email, u.first_name as user_first_name, u.last_name as user_last_name, u.phone_number as user_phone
      FROM orders o
      LEFT JOIN addresses sa ON o.shipping_address_id = sa.id
      LEFT JOIN addresses ba ON o.billing_address_id = ba.id
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${paramCount++} OFFSET $${paramCount}
    `;
    values.push(parseInt(limit), offset);
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async count(options = {}) {
    const { status,Vk, fromDate, toDate, search } = options;
    const values = [];
    let paramCount = 1;
    let whereConditions = [];

    if (status) {
        whereConditions.push(`o.status = $${paramCount++}`);
        values.push(status);
    }
  
    if (fromDate) {
        whereConditions.push(`o.created_at::date >= $${paramCount++}`);
        values.push(fromDate);
    }
  
    if (toDate) {
        whereConditions.push(`o.created_at::date <= $${paramCount++}`);
        values.push(toDate);
    }
  
    if (search) {
        const searchTerm = `%${search}%`;
        whereConditions.push(`(
          o.order_number ILIKE $${paramCount} OR 
          u.first_name ILIKE $${paramCount} OR 
          u.last_name ILIKE $${paramCount} OR 
          u.phone_number ILIKE $${paramCount} OR 
          u.email ILIKE $${paramCount} OR 
          sa.first_name ILIKE $${paramCount} OR 
          sa.last_name ILIKE $${paramCount}
        )`);
        values.push(searchTerm);
        paramCount++;
    }
  
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Need joins for search to work on user/address fields
    const query = `
        SELECT COUNT(*) as total 
        FROM orders o 
        LEFT JOIN addresses sa ON o.shipping_address_id = sa.id
        LEFT JOIN users u ON o.user_id = u.id
        ${whereClause}
    `;
    const result = await pool.query(query, values);
    return parseInt(result.rows[0].total);
  }
}

module.exports = Order;

