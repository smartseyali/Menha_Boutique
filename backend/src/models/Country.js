const pool = require('../config/database');

class Country {
  static async findAll() {
    const query = 'SELECT * FROM countries WHERE is_active = true ORDER BY name';
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM countries WHERE id = $1 AND is_active = true';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByCode(code) {
    const query = 'SELECT * FROM countries WHERE code = $1 AND is_active = true';
    const result = await pool.query(query, [code]);
    return result.rows[0];
  }
}

module.exports = Country;

