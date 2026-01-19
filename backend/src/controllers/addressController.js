const Address = require('../models/Address');

async function getUserAddresses(req, res, next) {
  try {
    const addresses = await Address.findByUserId(req.userId);
    res.json({ addresses });
  } catch (error) {
    next(error);
  }
}

async function createAddress(req, res, next) {
  try {
    const addressData = {
      ...req.body,
      userId: req.userId || null,
    };

    const address = await Address.create(addressData);
    res.status(201).json({
      message: 'Address created successfully',
      address,
    });
  } catch (error) {
    next(error);
  }
}

async function updateAddress(req, res, next) {
  try {
    const { id } = req.params;
    const addressData = req.body;

    // Check if address belongs to user
    const address = await Address.findById(id);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (address.user_id !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedAddress = await Address.update(id, addressData);
    res.json({
      message: 'Address updated successfully',
      address: updatedAddress,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteAddress(req, res, next) {
  try {
    const { id } = req.params;

    // Check if address belongs to user
    const address = await Address.findById(id);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (address.user_id !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Address.delete(id);
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};

