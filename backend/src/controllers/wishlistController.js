const Wishlist = require('../models/Wishlist');

async function getWishlist(req, res, next) {
  try {
    const wishlistItems = await Wishlist.findByUserId(req.userId);
    res.json({ wishlist: wishlistItems });
  } catch (error) {
    next(error);
  }
}

async function addToWishlist(req, res, next) {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const wishlistItem = await Wishlist.addItem(req.userId, productId);
    if (!wishlistItem) {
      return res.status(409).json({ message: 'Item already in wishlist' });
    }

    res.status(201).json({
      message: 'Item added to wishlist',
      wishlistItem,
    });
  } catch (error) {
    next(error);
  }
}

async function removeFromWishlist(req, res, next) {
  try {
    const { id } = req.params;
    // id is the wishlist_item.id (UUID), not productId
    await Wishlist.removeItemById(req.userId, id);
    res.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};

