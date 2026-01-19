const pool = require('../config/database');

class Testimonial {
  static async create(testimonialData) {
    const { name, title, description, image, rating, isActive, displayOrder } = testimonialData;
    const query = `
      INSERT INTO testimonials (name, title, description, image, rating, is_active, display_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [name, title, description, image, rating, isActive !== undefined ? isActive : true, displayOrder || 0];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(activeOnly = true) {
    let query = 'SELECT * FROM testimonials';
    if (activeOnly) {
      query += ' WHERE is_active = true';
    }
    query += ' ORDER BY display_order, created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM testimonials WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, testimonialData) {
    const { name, title, description, image, rating, isActive, displayOrder } = testimonialData;
    const query = `
      UPDATE testimonials 
      SET name = COALESCE($1, name),
          title = COALESCE($2, title),
          description = COALESCE($3, description),
          image = COALESCE($4, image),
          rating = COALESCE($5, rating),
          is_active = COALESCE($6, is_active),
          display_order = COALESCE($7, display_order),
          updated_at = current_timestamp
      WHERE id = $8
      RETURNING *
    `;
    const values = [name, title, description, image, rating, isActive, displayOrder, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM testimonials WHERE id = $1';
    await pool.query(query, [id]);
  }
}

module.exports = Testimonial;

