const pool = require('../config/database');

class Conversion {
  static async create(conversionData) {
    const {
      visitorId,
      orderId,
      source,
      medium,
      campaign,
      conversionValue,
    } = conversionData;

    const query = `
      INSERT INTO conversions (visitor_id, order_id, source, medium, campaign, conversion_value)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [visitorId, orderId, source, medium, campaign, conversionValue];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByOrderId(orderId) {
    const query = 'SELECT * FROM conversions WHERE order_id = $1';
    const result = await pool.query(query, [orderId]);
    return result.rows[0];
  }

  static async findByVisitorId(visitorId) {
    const query = 'SELECT * FROM conversions WHERE visitor_id = $1 ORDER BY converted_at DESC';
    const result = await pool.query(query, [visitorId]);
    return result.rows;
  }

  static async getStatsBySource(options = {}) {
    const { startDate, endDate } = options;
    let query = `
      SELECT 
        source,
        medium,
        campaign,
        COUNT(*) as conversions,
        SUM(conversion_value) as total_value,
        AVG(conversion_value) as avg_value
      FROM conversions
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND converted_at >= $${paramCount++}`;
      values.push(startDate);
    }

    if (endDate) {
      query += ` AND converted_at <= $${paramCount++}`;
      values.push(endDate);
    }

    query += `
      GROUP BY source, medium, campaign
      ORDER BY conversions DESC
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }
}

module.exports = Conversion;

