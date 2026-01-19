const pool = require('../config/database');

class State {
  static async findByCountryId(countryId) {
    const query = `
      SELECT * FROM states 
      WHERE country_id = $1 AND is_active = true 
      ORDER BY name
    `;
    const result = await pool.query(query, [countryId]);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM states WHERE id = $1 AND is_active = true';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM states WHERE is_active = true ORDER BY name';
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = State;

