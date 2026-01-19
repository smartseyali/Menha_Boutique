const pool = require('../config/database');

class Banner {
  static async create(data) {
    const { title, subtitle, imageUrl, image_url, link, type = 'main', sequence = 0, isActive, is_active } = data;
    
    // Handle both camelCase and snake_case
    const finalImageUrl = imageUrl || image_url;
    const finalIsActive = isActive !== undefined ? isActive : (is_active !== undefined ? is_active : true);

    const query = `
      INSERT INTO banners (title, subtitle, image_url, link, type, sequence, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [title, subtitle, finalImageUrl, link, type, sequence, finalIsActive];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(options = {}) {
    const { type, activeOnly } = options;
    let query = 'SELECT * FROM banners WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (type) {
      query += ` AND type = $${paramCount++}`;
      values.push(type);
    }

    if (activeOnly) {
      query += ` AND is_active = true`;
    }

    query += ' ORDER BY sequence ASC, created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM banners WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, data) {
    const { title, subtitle, imageUrl, image_url, link, type, sequence, isActive, is_active } = data;
    
    const finalImageUrl = imageUrl !== undefined ? imageUrl : (image_url !== undefined ? image_url : null);
    const finalIsActive = isActive !== undefined ? isActive : (is_active !== undefined ? is_active : null);

    const query = `
      UPDATE banners
      SET title = COALESCE($1, title),
          subtitle = COALESCE($2, subtitle),
          image_url = COALESCE($3, image_url),
          link = COALESCE($4, link),
          type = COALESCE($5, type),
          sequence = COALESCE($6, sequence),
          is_active = COALESCE($7, is_active),
          updated_at = current_timestamp
      WHERE id = $8
      RETURNING *
    `;
    // Note: We use null defaults so COALESCE uses the existing value if the field wasn't provided
    const values = [
      title || null, 
      subtitle || null, 
      finalImageUrl, 
      link || null, 
      type || null, 
      sequence !== undefined ? sequence : null, 
      finalIsActive, 
      id
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM banners WHERE id = $1';
    await pool.query(query, [id]);
  }
}

module.exports = Banner;
