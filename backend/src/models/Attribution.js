const pool = require('../config/database');

class Attribution {
  static async create(attributionData) {
    const {
      visitorId,
      firstTouchSource,
      firstTouchMedium,
      firstTouchCampaign,
      lastTouchSource,
      lastTouchMedium,
      lastTouchCampaign,
      landingPage,
      referrer,
    } = attributionData;

    const query = `
      INSERT INTO visitor_attribution (visitor_id, first_touch_source, first_touch_medium, 
                                      first_touch_campaign, last_touch_source, last_touch_medium, 
                                      last_touch_campaign, landing_page, referrer)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (visitor_id) 
      DO UPDATE SET 
        last_touch_source = EXCLUDED.last_touch_source,
        last_touch_medium = EXCLUDED.last_touch_medium,
        last_touch_campaign = EXCLUDED.last_touch_campaign,
        updated_at = current_timestamp
      RETURNING *
    `;
    const values = [
      visitorId,
      firstTouchSource,
      firstTouchMedium,
      firstTouchCampaign,
      lastTouchSource,
      lastTouchMedium,
      lastTouchCampaign,
      landingPage,
      referrer,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByVisitorId(visitorId) {
    const query = 'SELECT * FROM visitor_attribution WHERE visitor_id = $1';
    const result = await pool.query(query, [visitorId]);
    return result.rows[0];
  }

  static async getStats(options = {}) {
    const { startDate, endDate } = options;
    let query = `
      SELECT 
        first_touch_source as source,
        first_touch_medium as medium,
        COUNT(*) as visitors,
        COUNT(DISTINCT CASE WHEN c.visitor_id IS NOT NULL THEN va.visitor_id END) as conversions
      FROM visitor_attribution va
      LEFT JOIN conversions c ON va.visitor_id = c.visitor_id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (startDate) {
      query += ` AND va.created_at >= $${paramCount++}`;
      values.push(startDate);
    }

    if (endDate) {
      query += ` AND va.created_at <= $${paramCount++}`;
      values.push(endDate);
    }

    query += `
      GROUP BY first_touch_source, first_touch_medium
      ORDER BY visitors DESC
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }
}

module.exports = Attribution;

