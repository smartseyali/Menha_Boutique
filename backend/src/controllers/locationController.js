const Country = require('../models/Country');
const State = require('../models/State');
const City = require('../models/City');

async function getCountries(req, res, next) {
  try {
    const countries = await Country.findAll();
    res.json({ countries });
  } catch (error) {
    next(error);
  }
}

async function getStates(req, res, next) {
  try {
    const { countryId } = req.query;
    
    if (!countryId) {
      return res.status(400).json({ message: 'Country ID is required' });
    }

    const states = await State.findByCountryId(countryId);
    res.json({ states });
  } catch (error) {
    next(error);
  }
}

async function getCities(req, res, next) {
  try {
    const { stateId } = req.query;
    
    if (!stateId) {
      return res.status(400).json({ message: 'State ID is required' });
    }

    const cities = await City.findByStateId(stateId);
    res.json({ cities });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCountries,
  getStates,
  getCities,
};

