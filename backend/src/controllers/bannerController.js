const Banner = require('../models/Banner');

async function getAllBanners(req, res, next) {
  try {
    const { type, activeOnly } = req.query;
    const banners = await Banner.findAll({ 
      type, 
      activeOnly: activeOnly === 'true' 
    });
    res.json(banners);
  } catch (error) {
    next(error);
  }
}

async function createBanner(req, res, next) {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json(banner);
  } catch (error) {
    next(error);
  }
}

async function updateBanner(req, res, next) {
  try {
    const { id } = req.params;
    const banner = await Banner.update(id, req.body);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json(banner);
  } catch (error) {
    next(error);
  }
}

async function deleteBanner(req, res, next) {
  try {
    const { id } = req.params;
    await Banner.delete(id);
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner
};
