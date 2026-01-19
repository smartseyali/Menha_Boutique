const pool = require('../config/database');

class Address {
  static async create(addressData) {
    const {
      userId, firstName, lastName, addressLine, city, postalCode,
      state, stateName, country, countryName, isDefault, addressType
    } = addressData;
    
    // If this is set as default, unset other defaults
    if (isDefault) {
      await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
    }

    const query = `
      INSERT INTO addresses (user_id, first_name, last_name, address_line, city, postal_code,
                            state, state_name, country, country_name, is_default, address_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const values = [userId, firstName, lastName, addressLine, city, postalCode,
                   state, stateName, country, countryName, isDefault || false, addressType];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC';
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM addresses WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, addressData) {
    const {
      firstName, lastName, addressLine, city, postalCode,
      state, stateName, country, countryName, isDefault, addressType
    } = addressData;
    
    // If this is set as default, unset other defaults
    if (isDefault) {
      const address = await this.findById(id);
      if (address) {
        await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1 AND id != $2', 
                        [address.user_id, id]);
      }
    }

    const query = `
      UPDATE addresses 
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          address_line = COALESCE($3, address_line),
          city = COALESCE($4, city),
          postal_code = COALESCE($5, postal_code),
          state = COALESCE($6, state),
          state_name = COALESCE($7, state_name),
          country = COALESCE($8, country),
          country_name = COALESCE($9, country_name),
          is_default = COALESCE($10, is_default),
          address_type = COALESCE($11, address_type),
          updated_at = current_timestamp
      WHERE id = $12
      RETURNING *
    `;
    const values = [firstName, lastName, addressLine, city, postalCode,
                   state, stateName, country, countryName, isDefault, addressType, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM addresses WHERE id = $1';
    await pool.query(query, [id]);
  }
}

module.exports = Address;

