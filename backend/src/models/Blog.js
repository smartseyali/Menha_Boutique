const pool = require('../config/database');

class Blog {
  static async create(blogData) {
    const { category, title, description, image, content, authorId, slug, isPublished, publishedAt } = blogData;
    const query = `
      INSERT INTO blogs (category, title, description, image, content, author_id, slug, is_published, published_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [category, title, description, image, content, authorId, slug, isPublished || false, publishedAt];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(options = {}) {
    const { limit = 10, offset = 0, category, publishedOnly = true } = options;
    let query = `
      SELECT b.*, u.first_name as author_first_name, u.last_name as author_last_name
      FROM blogs b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (publishedOnly) {
      query += ` AND b.is_published = true`;
    }

    if (category) {
      query += ` AND b.category = $${paramCount++}`;
      values.push(category);
    }

    query += ` ORDER BY b.published_at DESC NULLS LAST, b.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT b.*, u.first_name as author_first_name, u.last_name as author_last_name
      FROM blogs b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findBySlug(slug) {
    const query = `
      SELECT b.*, u.first_name as author_first_name, u.last_name as author_last_name
      FROM blogs b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.slug = $1
    `;
    const result = await pool.query(query, [slug]);
    return result.rows[0];
  }

  static async count(options = {}) {
    const { category, publishedOnly = true } = options;
    let query = 'SELECT COUNT(*) as count FROM blogs WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (publishedOnly) {
      query += ` AND is_published = true`;
    }

    if (category) {
      query += ` AND category = $${paramCount++}`;
      values.push(category);
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count);
  }

  static async update(id, blogData) {
    const { category, title, description, image, content, slug, isPublished, publishedAt } = blogData;
    const query = `
      UPDATE blogs 
      SET category = COALESCE($1, category),
          title = COALESCE($2, title),
          description = COALESCE($3, description),
          image = COALESCE($4, image),
          content = COALESCE($5, content),
          slug = COALESCE($6, slug),
          is_published = COALESCE($7, is_published),
          published_at = COALESCE($8, published_at),
          updated_at = current_timestamp
      WHERE id = $9
      RETURNING *
    `;
    const values = [category, title, description, image, content, slug, isPublished, publishedAt, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM blogs WHERE id = $1';
    await pool.query(query, [id]);
  }
}

module.exports = Blog;

