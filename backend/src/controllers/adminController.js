const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');

async function getStats(req, res, next) {
  try {
    // Get total counts
    const [totalProducts, totalCategories, totalOrders, totalRevenue] = await Promise.all([
      Product.count(),
      Category.count(),
      Order.count(),
      getTotalRevenue(),
    ]);

    // Get recent orders count (last 7 days)
    const recentOrders = await getRecentOrdersCount(7);

    // Get orders by status
    const ordersByStatus = await getOrdersByStatus();

    res.json({
      stats: {
        totalProducts,
        totalCategories,
        totalOrders,
        totalRevenue,
        recentOrders,
        ordersByStatus,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getTotalRevenue() {
  const pool = require('../config/database');
  const query = `
    SELECT COALESCE(SUM(total_price), 0) as total_revenue
    FROM orders
    WHERE payment_status = 'completed' OR payment_status = 'paid'
  `;
  const result = await pool.query(query);
  return parseFloat(result.rows[0].total_revenue) || 0;
}

async function getRecentOrdersCount(days) {
  const pool = require('../config/database');
  const query = `
    SELECT COUNT(*) as count
    FROM orders
    WHERE created_at >= NOW() - INTERVAL '${days} days'
  `;
  const result = await pool.query(query);
  return parseInt(result.rows[0].count) || 0;
}

async function getOrdersByStatus() {
  const pool = require('../config/database');
  const query = `
    SELECT COALESCE(status, 'pending') as status, COUNT(*) as count
    FROM orders
    GROUP BY status
  `;
  const result = await pool.query(query);
  return result.rows.reduce((acc, row) => {
    acc[row.status] = parseInt(row.count) || 0;
    return acc;
  }, {});
}

async function getUsers(req, res, next) {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const User = require('../models/User');

    const [users, total] = await Promise.all([
      User.findAll({ page, limit, search }),
      User.count({ search }),
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getUserDetails(req, res, next) {
  try {
    const { id } = req.params;
    const User = require('../models/User');
    const Address = require('../models/Address');

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const addresses = await Address.findByUserId(id);

    res.json({
      user,
      addresses
    });
  } catch (error) {
    next(error);
  }
}

async function updateUserStatusAndRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role, is_active } = req.body;
    const User = require('../models/User');

    const updatedUser = await User.updateStatusAndRole(id, { role, is_active });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStats,
  getUsers,
  getUserDetails,
  updateUserStatusAndRole,
};

