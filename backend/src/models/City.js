const pool = require('../config/database');

class City {
  static async findByStateId(stateId) {
    const query = `
      SELECT * FROM cities 
      WHERE state_id = $1 AND is_active = true 
      ORDER BY name
    `;
    const result = await pool.query(query, [stateId]);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM cities WHERE id = $1 AND is_active = true';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM cities WHERE is_active = true ORDER BY name';
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = City;

