const pool = require('../config/database');

class User {
  static async create(userData) {
    const { email, passwordHash, firstName, lastName, phoneNumber, profilePhoto, description, role } = userData;
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, phone_number, profile_photo, description, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, first_name, last_name, phone_number, profile_photo, description, is_active, role, created_at, updated_at
    `;
    const values = [email, passwordHash, firstName, lastName, phoneNumber, profilePhoto, description, role || 'customer'];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findByPhoneNumber(phoneNumber) {
    const query = 'SELECT * FROM users WHERE phone_number = $1';
    const result = await pool.query(query, [phoneNumber]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, email, first_name, last_name, phone_number, profile_photo, description, is_active, role, created_at, updated_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, userData) {
    const { firstName, lastName, phoneNumber, profilePhoto, description } = userData;
    const query = `
      UPDATE users 
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          phone_number = COALESCE($3, phone_number),
          profile_photo = COALESCE($4, profile_photo),
          description = COALESCE($5, description),
          updated_at = current_timestamp
      WHERE id = $6
      RETURNING id, email, first_name, last_name, phone_number, profile_photo, description, is_active, role, created_at, updated_at
    `;
    const values = [firstName, lastName, phoneNumber, profilePhoto, description, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updatePassword(id, passwordHash) {
    const query = `
      UPDATE users 
      SET password_hash = $1, updated_at = current_timestamp
      WHERE id = $2
    `;
    await pool.query(query, [passwordHash, id]);
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1';
    await pool.query(query, [id]);
  }

  static async updateStatusAndRole(id, { role, is_active }) {
    const query = `
      UPDATE users 
      SET role = COALESCE($1, role),
          is_active = COALESCE($2, is_active),
          updated_at = current_timestamp
      WHERE id = $3
      RETURNING id, email, first_name, last_name, phone_number, profile_photo, description, is_active, role, created_at, updated_at
    `;
    const result = await pool.query(query, [role, is_active, id]);
    return result.rows[0];
  }

  static async findAll(options = {}) {
    const { page = 1, limit = 50, search } = options;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const values = [];
    let paramCount = 1;
    let whereConditions = [];

    if (search) {
      const searchTerm = `%${search}%`;
      whereConditions.push(`(
        first_name ILIKE $${paramCount} OR 
        last_name ILIKE $${paramCount} OR 
        email ILIKE $${paramCount} OR 
        phone_number ILIKE $${paramCount}
      )`);
      values.push(searchTerm);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
      SELECT id, email, first_name, last_name, phone_number, profile_photo, description, is_active, role, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount++} OFFSET $${paramCount}
    `;
    values.push(parseInt(limit), offset);
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async count(options = {}) {
    const { search } = options;
    const values = [];
    let paramCount = 1;
    let whereConditions = [];

    if (search) {
      const searchTerm = `%${search}%`;
      whereConditions.push(`(
        first_name ILIKE $${paramCount} OR 
        last_name ILIKE $${paramCount} OR 
        email ILIKE $${paramCount} OR 
        phone_number ILIKE $${paramCount}
      )`);
      values.push(searchTerm);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const result = await pool.query(query, values);
    return parseInt(result.rows[0].total);
  }
}

module.exports = User;

