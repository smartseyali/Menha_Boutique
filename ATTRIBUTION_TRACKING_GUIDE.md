# Marketing Channel Attribution Tracking Guide

This guide explains how the attribution tracking system works and how to use it to identify which marketing channels (Google Ads, Facebook, Instagram, YouTube) are driving traffic to your site.

## Overview

The attribution tracking system captures and stores information about where visitors come from, allowing you to:
- Identify which marketing channels drive the most traffic
- Track conversions by source
- Understand which campaigns are most effective
- Make data-driven decisions about where to focus marketing efforts

## Setup

### 1. Environment Variables

Create a `.env.local` file in the root directory with your tracking IDs:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXX
```

### 2. Database Migration

Run the attribution tables migration:

```bash
cd backend
npm run migrate:up
```

This will create:
- `visitor_attribution` table - Stores first-touch and last-touch attribution
- `conversions` table - Stores conversion events with attribution data

## How It Works

### Attribution Tracking Flow

1. **Visitor arrives on site** with UTM parameters or referrer
2. **System captures** attribution data (source, medium, campaign)
3. **Stores first-touch** attribution (first visit)
4. **Updates last-touch** attribution on subsequent visits
5. **Tracks conversions** with attribution data when orders are placed

### Channel Identification

The system automatically identifies marketing channels:

- **Google Ads**: `utm_source=google` + `utm_medium=cpc` or `gclid` parameter
- **Facebook**: `utm_source=facebook` + `utm_medium=social` or `fbclid` parameter
- **Instagram**: `utm_source=instagram` + `utm_medium=social`
- **YouTube**: `utm_source=youtube` + `utm_medium=video` or `utm_medium=social`
- **Organic**: No UTM parameters, comes from search engines
- **Direct**: No referrer, direct visit

### UTM Parameters

The system tracks these UTM parameters:
- `utm_source` - Traffic source (google, facebook, instagram, youtube, etc.)
- `utm_medium` - Marketing medium (cpc, social, email, organic)
- `utm_campaign` - Campaign name
- `utm_term` - Keyword (for Google Ads)
- `utm_content` - Ad variation/content

### Automatic Parameters

The system also recognizes automatic tracking parameters:
- `gclid` - Google Click ID (Google Ads auto-tagging)
- `fbclid` - Facebook Click ID (Facebook/Instagram ads)
- `ttclid` - TikTok Click ID

## Usage

### Creating Tracking Links

#### Google Ads
```
https://yoursite.com/?utm_source=google&utm_medium=cpc&utm_campaign=summer-sale&utm_term=organic-food
```

#### Facebook
```
https://yoursite.com/?utm_source=facebook&utm_medium=social&utm_campaign=winter-promo
```

#### Instagram
```
https://yoursite.com/?utm_source=instagram&utm_medium=social&utm_campaign=product-launch
```

#### YouTube
```
https://yoursite.com/?utm_source=youtube&utm_medium=video&utm_campaign=brand-awareness
```

### Viewing Attribution Data

#### In Google Analytics

1. Go to **Reports** > **Acquisition** > **Traffic acquisition**
2. View traffic by source/medium
3. Check **Attribution** reports for conversion data

#### In Meta Pixel Events Manager

1. Go to **Events Manager**
2. View **Events** tab to see tracked events
3. Check **Attribution** settings for conversion tracking

#### In Backend API

Get attribution statistics:
```bash
GET /api/attribution/stats?startDate=2024-01-01&endDate=2024-12-31
```

Get conversion statistics:
```bash
GET /api/attribution/conversions?startDate=2024-01-01&endDate=2024-12-31
```

## Events Tracked

### Automatic Events

1. **Page View** - Tracked on every page load
2. **Begin Checkout** - Tracked when user lands on checkout page
3. **Purchase** - Tracked when order is completed

### Event Data

Each event includes:
- Source (where visitor came from)
- Medium (how they arrived)
- Campaign (which campaign)
- Channel (identified marketing channel)
- Conversion value (for purchase events)

## Analyzing Results

### Key Metrics to Monitor

1. **Traffic by Source**
   - Which channels drive the most visitors
   - Compare Google Ads vs Facebook vs Instagram vs YouTube

2. **Conversion Rate by Source**
   - Which channels have highest conversion rates
   - Calculate: Conversions / Visitors

3. **Revenue by Source**
   - Which channels generate most revenue
   - Total conversion value per channel

4. **Cost per Acquisition (CPA)**
   - Compare ad spend vs conversions
   - Identify most cost-effective channels

### Reports to Create

#### Google Analytics Reports

1. **Acquisition Overview**
   - Source/Medium report
   - Campaign performance
   - Channel grouping

2. **Attribution Reports**
   - First-touch vs last-touch
   - Model comparison
   - Conversion paths

#### Meta Pixel Reports

1. **Events Overview**
   - Event counts by source
   - Conversion rates
   - Revenue attribution

2. **Attribution Settings**
   - Click-through attribution
   - View-through attribution
   - Attribution window

## Best Practices

### 1. Consistent UTM Parameters

Use consistent naming conventions:
- Source: lowercase (google, facebook, instagram)
- Medium: lowercase (cpc, social, email)
- Campaign: descriptive names (summer-sale-2024)

### 2. Track All Marketing Channels

Ensure all paid campaigns have UTM parameters:
- Google Ads (use auto-tagging + UTM)
- Facebook Ads (use UTM parameters)
- Instagram Ads (use UTM parameters)
- YouTube Ads (use UTM parameters)
- Email campaigns (use UTM parameters)

### 3. Monitor Attribution Windows

Understand attribution windows:
- Google Analytics: Default 30-day lookback
- Meta Pixel: Default 7-day click, 1-day view
- Adjust based on your sales cycle

### 4. Test Attribution

Test your tracking:
1. Visit site with UTM parameters
2. Check browser console for attribution data
3. Verify events in GA4 and Meta Pixel
4. Complete a test purchase
5. Verify conversion tracking

## Troubleshooting

### Events Not Showing

1. Check environment variables are set
2. Verify scripts are loading (check browser console)
3. Check ad blockers (may block tracking)
4. Verify UTM parameters in URL

### Attribution Not Captured

1. Check localStorage for attribution data
2. Verify UTM parameters are in URL
3. Check referrer information
4. Verify attribution utility is working

### Conversions Not Tracked

1. Verify purchase event is firing
2. Check order completion flow
3. Verify attribution data is available
4. Check backend API for conversion records

## API Endpoints

### Track Attribution
```bash
POST /api/attribution/track
Body: {
  visitorId: "visitor-123",
  source: "google",
  medium: "cpc",
  campaign: "summer-sale",
  landingPage: "/",
  referrer: "https://google.com",
  isFirstVisit: true
}
```

### Track Conversion
```bash
POST /api/attribution/conversion
Body: {
  visitorId: "visitor-123",
  orderId: "order-456",
  source: "google",
  medium: "cpc",
  campaign: "summer-sale",
  conversionValue: 150.00
}
```

### Get Attribution Stats
```bash
GET /api/attribution/stats?startDate=2024-01-01&endDate=2024-12-31
```

### Get Conversion Stats
```bash
GET /api/attribution/conversions?startDate=2024-01-01&endDate=2024-12-31
```

## Next Steps

1. **Set up tracking IDs** in `.env.local`
2. **Run database migrations** to create attribution tables
3. **Create UTM tracking links** for all marketing campaigns
4. **Monitor results** in Google Analytics and Meta Pixel
5. **Analyze data** to identify best-performing channels
6. **Optimize campaigns** based on attribution data

## Support

For issues or questions:
1. Check browser console for errors
2. Verify environment variables
3. Test with UTM parameters
4. Check database for stored attribution data
5. Review Google Analytics and Meta Pixel documentation

