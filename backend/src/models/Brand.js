const pool = require('../config/database');

class Brand {
  static async create(brandData) {
    const { name, logo, description } = brandData;
    const query = `
      INSERT INTO brands (name, logo, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [name, logo, description];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM brands ORDER BY name';
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM brands WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, brandData) {
    const { name, logo, description } = brandData;
    const query = `
      UPDATE brands 
      SET name = COALESCE($1, name),
          logo = COALESCE($2, logo),
          description = COALESCE($3, description),
          updated_at = current_timestamp
      WHERE id = $4
      RETURNING *
    `;
    const values = [name, logo, description, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM brands WHERE id = $1';
    await pool.query(query, [id]);
  }
}

module.exports = Brand;

