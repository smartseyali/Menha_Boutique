const Attribution = require('../models/Attribution');
const Conversion = require('../models/Conversion');

async function trackAttribution(req, res, next) {
  try {
    const {
      visitorId,
      source,
      medium,
      campaign,
      landingPage,
      referrer,
      isFirstVisit,
    } = req.body;

    if (!visitorId || !source || !medium) {
      return res.status(400).json({ message: 'visitorId, source, and medium are required' });
    }

    // Get existing attribution
    const existing = await Attribution.findByVisitorId(visitorId);

    const attributionData = {
      visitorId,
      landingPage: landingPage || req.headers.referer || '',
      referrer: referrer || req.headers.referer || '',
    };

    if (isFirstVisit || !existing) {
      // First touch
      attributionData.firstTouchSource = source;
      attributionData.firstTouchMedium = medium;
      attributionData.firstTouchCampaign = campaign;
      attributionData.lastTouchSource = source;
      attributionData.lastTouchMedium = medium;
      attributionData.lastTouchCampaign = campaign;
    } else {
      // Update last touch only
      attributionData.firstTouchSource = existing.first_touch_source;
      attributionData.firstTouchMedium = existing.first_touch_medium;
      attributionData.firstTouchCampaign = existing.first_touch_campaign;
      attributionData.lastTouchSource = source;
      attributionData.lastTouchMedium = medium;
      attributionData.lastTouchCampaign = campaign;
    }

    const attribution = await Attribution.create(attributionData);

    res.json({
      message: 'Attribution tracked successfully',
      attribution,
    });
  } catch (error) {
    next(error);
  }
}

async function trackConversion(req, res, next) {
  try {
    const {
      visitorId,
      orderId,
      source,
      medium,
      campaign,
      conversionValue,
    } = req.body;

    if (!visitorId || !orderId || !source || !medium || conversionValue === undefined) {
      return res.status(400).json({
        message: 'visitorId, orderId, source, medium, and conversionValue are required',
      });
    }

    const conversion = await Conversion.create({
      visitorId,
      orderId,
      source,
      medium,
      campaign,
      conversionValue,
    });

    res.status(201).json({
      message: 'Conversion tracked successfully',
      conversion,
    });
  } catch (error) {
    next(error);
  }
}

async function getAttributionStats(req, res, next) {
  try {
    const { startDate, endDate } = req.query;

    const stats = await Attribution.getStats({
      startDate,
      endDate,
    });

    res.json({ stats });
  } catch (error) {
    next(error);
  }
}

async function getConversionStats(req, res, next) {
  try {
    const { startDate, endDate } = req.query;

    const stats = await Conversion.getStatsBySource({
      startDate,
      endDate,
    });

    res.json({ stats });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  trackAttribution,
  trackConversion,
  getAttributionStats,
  getConversionStats,
};

