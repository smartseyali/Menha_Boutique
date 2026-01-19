const Compare = require('../models/Compare');

async function getCompare(req, res, next) {
  try {
    const compareItems = await Compare.findByUserId(req.userId);
    res.json({ compare: compareItems });
  } catch (error) {
    next(error);
  }
}

async function addToCompare(req, res, next) {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const compareItem = await Compare.addItem(req.userId, productId);
    if (!compareItem) {
      return res.status(409).json({ message: 'Item already in compare list' });
    }

    res.status(201).json({
      message: 'Item added to compare',
      compareItem,
    });
  } catch (error) {
    next(error);
  }
}

async function removeFromCompare(req, res, next) {
  try {
    const { id } = req.params;
    await Compare.removeItem(req.userId, id);
    res.json({ message: 'Item removed from compare' });
  } catch (error) {
    next(error);
  }
}

async function clearCompare(req, res, next) {
  try {
    await Compare.clear(req.userId);
    res.json({ message: 'Compare list cleared' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCompare,
  addToCompare,
  removeFromCompare,
  clearCompare,
};

