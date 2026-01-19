const pool = require('../config/database');

class Coupon {
  static async create(couponData) {
    const {
      code, discountType, discountValue, minPurchaseAmount,
      maxDiscountAmount, usageLimit, validFrom, validUntil, isActive
    } = couponData;
    const query = `
      INSERT INTO coupons (code, discount_type, discount_value, min_purchase_amount,
                          max_discount_amount, usage_limit, valid_from, valid_until, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [code, discountType, discountValue, minPurchaseAmount,
                   maxDiscountAmount, usageLimit, validFrom, validUntil, isActive !== undefined ? isActive : true];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByCode(code) {
    const query = 'SELECT * FROM coupons WHERE code = $1';
    const result = await pool.query(query, [code]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM coupons WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAll(activeOnly = true) {
    let query = 'SELECT * FROM coupons';
    if (activeOnly) {
      query += ' WHERE is_active = true';
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  static async validate(code, userId, orderAmount) {
    const coupon = await this.findByCode(code);
    
    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code' };
    }

    if (!coupon.is_active) {
      return { valid: false, message: 'Coupon is not active' };
    }

    const now = new Date();
    if (new Date(coupon.valid_from) > now) {
      return { valid: false, message: 'Coupon is not yet valid' };
    }

    if (new Date(coupon.valid_until) < now) {
      return { valid: false, message: 'Coupon has expired' };
    }

    if (coupon.min_purchase_amount && orderAmount < parseFloat(coupon.min_purchase_amount)) {
      return { valid: false, message: `Minimum purchase amount of ${coupon.min_purchase_amount} required` };
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }

    // Check if user has already used this coupon
    const usageQuery = 'SELECT COUNT(*) as count FROM coupon_usage WHERE coupon_id = $1 AND user_id = $2';
    const usageResult = await pool.query(usageQuery, [coupon.id, userId]);
    if (parseInt(usageResult.rows[0].count) > 0) {
      return { valid: false, message: 'You have already used this coupon' };
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (orderAmount * parseFloat(coupon.discount_value)) / 100;
      if (coupon.max_discount_amount && discountAmount > parseFloat(coupon.max_discount_amount)) {
        discountAmount = parseFloat(coupon.max_discount_amount);
      }
    } else {
      discountAmount = parseFloat(coupon.discount_value);
    }

    return {
      valid: true,
      coupon: coupon,
      discountAmount: discountAmount
    };
  }

  static async recordUsage(couponId, userId, orderId, discountApplied) {
    const query = `
      INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_applied)
      VALUES ($1, $2, $3, $4)
    `;
    await pool.query(query, [couponId, userId, orderId, discountApplied]);
    
    // Update coupon used count
    await pool.query(
      'UPDATE coupons SET used_count = used_count + 1, updated_at = current_timestamp WHERE id = $1',
      [couponId]
    );
  }

  static async update(id, couponData) {
    const {
      code, discountType, discountValue, minPurchaseAmount,
      maxDiscountAmount, usageLimit, validFrom, validUntil, isActive
    } = couponData;
    const query = `
      UPDATE coupons 
      SET code = COALESCE($1, code),
          discount_type = COALESCE($2, discount_type),
          discount_value = COALESCE($3, discount_value),
          min_purchase_amount = COALESCE($4, min_purchase_amount),
          max_discount_amount = COALESCE($5, max_discount_amount),
          usage_limit = COALESCE($6, usage_limit),
          valid_from = COALESCE($7, valid_from),
          valid_until = COALESCE($8, valid_until),
          is_active = COALESCE($9, is_active),
          updated_at = current_timestamp
      WHERE id = $10
      RETURNING *
    `;
    const values = [code, discountType, discountValue, minPurchaseAmount,
                   maxDiscountAmount, usageLimit, validFrom, validUntil, isActive, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM coupons WHERE id = $1';
    await pool.query(query, [id]);
  }
}

module.exports = Coupon;

