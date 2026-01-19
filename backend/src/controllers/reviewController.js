const Review = require('../models/Review');

async function getProductReviews(req, res, next) {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const options = {
      limit: parseInt(limit),
      offset,
      approvedOnly: true,
    };

    const reviews = await Review.findByProductId(productId, options);
    res.json({ reviews });
  } catch (error) {
    next(error);
  }
}

async function createReview(req, res, next) {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'Product ID, rating, and comment are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const user = req.user;
    const reviewData = {
      productId,
      userId: req.userId,
      rating: parseInt(rating),
      comment,
      avatarUrl: user.profile_photo || null,
    };

    const review = await Review.create(reviewData);
    res.status(201).json({
      message: 'Review created successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
}

async function updateReview(req, res, next) {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Check if review exists and belongs to user
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user_id !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const reviewData = { rating, comment };
    const updatedReview = await Review.update(id, reviewData);

    res.json({
      message: 'Review updated successfully',
      review: updatedReview,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteReview(req, res, next) {
  try {
    const { id } = req.params;

    // Check if review exists and belongs to user
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user_id !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Review.delete(id);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
};

