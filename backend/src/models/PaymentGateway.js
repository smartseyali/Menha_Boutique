const pool = require('../config/database');

class PaymentGateway {
  static async create(data) {
    const { name, type, isActive, isTestMode, credentials } = data;
    const query = `
      INSERT INTO payment_gateways (name, type, is_active, is_test_mode, credentials)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [name, type, isActive, isTestMode, credentials]);
    return this.transform(result.rows[0]);
  }

  static async find() {
    const query = 'SELECT * FROM payment_gateways ORDER BY created_at DESC';
    const result = await pool.query(query);
    // Transform rows to match key style expected by controller/frontend
    return result.rows.map(row => this.transform(row));
  }

  static async findOne(criteria) {
    const keys = Object.keys(criteria);
    const values = Object.values(criteria);
    
    // Map camcelCase to snake_case for DB columns if needed, but for now assuming caller matches DB or we fix it.
    // The previous code passed { isActive: true }, DB has is_active.
    
    let whereClause = [];
    let paramCount = 1;

    // Simple mapping helper
    const toSnake = (key) => key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

    keys.forEach((key, index) => {
        whereClause.push(`${toSnake(key)} = $${index + 1}`);
    });

    const query = `SELECT * FROM payment_gateways WHERE ${whereClause.join(' AND ')} LIMIT 1`;
    const result = await pool.query(query, values);
    
    if (result.rows[0]) {
       // Convert back to camelCase properties for compatibility with controller?
       // The controller expects .credentials, .name, .isActive (or .is_active)
       // Let's attach a helper or simply return row.
       // The controller uses `gateway.name`, `gateway.credentials`.
       // `isActive` check: `gateway.isActive`. DB returns `is_active`.
       // We should normalize the return object to match Mongoose-like structure used in controller 
       // OR update controller to use snake_case.
       // Updating model to return camelCase is safer for existing controller logic.
       return this.transform(result.rows[0]);
    }
    return null;
  }
  
  static async findByIdAndUpdate(id, updates, options) {
    // updates keys might be camelCase, map to snake_case
    const keys = Object.keys(updates);
    const values = [];
    let setClause = [];
    let paramCount = 1;
    
    const toSnake = (key) => key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

    keys.forEach(key => {
        setClause.push(`${toSnake(key)} = $${paramCount++}`);
        values.push(updates[key]);
    });
    
    values.push(id); // ID is last param

    const query = `
      UPDATE payment_gateways 
      SET ${setClause.join(', ')}, updated_at = current_timestamp
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] ? this.transform(result.rows[0]) : null;
  }

  static async updateMany(criteria, updates) {
    // handle "isActive: false" -> "is_active = false"
    // criteria: { _id: { $ne: id } } or {}
    
    let whereClause = '1=1';
    const values = [];
    let paramCount = 1;

    // Handle specific case from controller: { _id: { $ne: id } }
    if (criteria._id && criteria._id.$ne) {
       whereClause = `id != $${paramCount++}`;
       values.push(criteria._id.$ne);
    } 
    // Handle empty criteria {} -> 1=1 already set

    // Handle updates
    const updateKeys = Object.keys(updates);
    let setClause = [];
    
    const toSnake = (key) => key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

    updateKeys.forEach(key => {
        setClause.push(`${toSnake(key)} = $${paramCount++}`);
        values.push(updates[key]);
    });

    const query = `
      UPDATE payment_gateways 
      SET ${setClause.join(', ')}, updated_at = current_timestamp
      WHERE ${whereClause}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows.map(row => this.transform(row));
  }
  
  static transform(row) {
    if (!row) return null;
    return {
        _id: row.id, // Component expects _id
        id: row.id,
        name: row.name,
        type: row.type,
        isActive: row.is_active,
        isTestMode: row.is_test_mode,
        credentials: row.credentials,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
  }

  // Helper for Mongoose-like "select('+credentials')"
  // Since we fetch * by default, we just mimic the chain if needed, or ignore it since we have the data.
  // The controller calls: await PaymentGateway.find().select('+credentials');
  // We can't easily chain static methods in a simple class without returning a query builder.
  // BUT the controller awaits the result of find().select(). 
  // If we return the array directly from find(), .select() will crash.
  // We need to support the method chaining or update the controller.
  // Updating the controller to not use .select() is cleaner, but this task asked to rewrite model.
  // Let's return a "QueryLike" object from find() ?
  // Or just update the controller? Updating controller is probably better/safer architecture, 
  // but I must fixing the immediate "module mongoose not found" error.
  // If I only fix model, the controller `find().select` will fail.
  // So I WILL rewrite the controller query logic too in a subsequent step. 
  // For now, let's just output the methods.
}

module.exports = PaymentGateway;
