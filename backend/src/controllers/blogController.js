const Blog = require('../models/Blog');

async function getAllBlogs(req, res, next) {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const options = {
      limit: parseInt(limit),
      offset,
      category,
      publishedOnly: true,
    };

    const blogs = await Blog.findAll(options);
    const total = await Blog.count(options);

    res.json({
      blogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getBlogById(req, res, next) {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Only return published blogs unless admin
    if (!blog.is_published && req.user?.role !== 'admin') {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({ blog });
  } catch (error) {
    next(error);
  }
}

async function getBlogsByCategory(req, res, next) {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const options = {
      limit: parseInt(limit),
      offset,
      category,
      publishedOnly: true,
    };

    const blogs = await Blog.findAll(options);
    const total = await Blog.count(options);

    res.json({
      blogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function createBlog(req, res, next) {
  try {
    const blogData = {
      ...req.body,
      authorId: req.userId,
      isPublished: req.body.isPublished || false,
      publishedAt: req.body.isPublished ? new Date() : null,
    };

    const blog = await Blog.create(blogData);
    res.status(201).json({
      message: 'Blog created successfully',
      blog,
    });
  } catch (error) {
    next(error);
  }
}

async function updateBlog(req, res, next) {
  try {
    const { id } = req.params;
    const blogData = req.body;

    // Check if user is admin or author
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.author_id !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedBlog = await Blog.update(id, blogData);
    res.json({
      message: 'Blog updated successfully',
      blog: updatedBlog,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllBlogs,
  getBlogById,
  getBlogsByCategory,
  createBlog,
  updateBlog,
};

