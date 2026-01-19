const Cart = require('../models/Cart');

async function getCart(req, res, next) {
  try {
    const cartItems = await Cart.findByUserId(req.userId);
    res.json({ cart: cartItems });
  } catch (error) {
    next(error);
  }
}

async function addToCart(req, res, next) {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const cartItem = await Cart.addItem(req.userId, productId, quantity || 1);
    res.status(201).json({
      message: 'Item added to cart',
      cartItem,
    });
  } catch (error) {
    next(error);
  }
}

async function updateCartItem(req, res, next) {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    // id is the cart_item id (UUID)
    const cartItem = await Cart.updateQuantity(req.userId, id, quantity);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({
      message: 'Cart item updated',
      cartItem,
    });
  } catch (error) {
    next(error);
  }
}

async function removeFromCart(req, res, next) {
  try {
    const { id } = req.params;
    // id is the cart_item id (UUID)
    await Cart.removeItem(req.userId, id);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
}

async function clearCart(req, res, next) {
  try {
    await Cart.clear(req.userId);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};

