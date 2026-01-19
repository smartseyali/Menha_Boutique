# Marketing Channel Attribution Tracking - Quick Start Guide

## Overview

This implementation tracks where your website visitors come from (Google Ads, Facebook, Instagram, YouTube, etc.) and which channels drive the most conversions.

## Setup Steps

### 1. Get Your Tracking IDs

#### Google Analytics 4:
1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property
3. Go to Admin > Data Streams
4. Copy your Measurement ID (format: G-XXXXXXXXXX)

#### Meta Pixel:
1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Select your Pixel
3. Copy your Pixel ID (format: XXXXXXXXXX)

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXX
```

### 3. Run Database Migration

```bash
cd backend
npm run migrate:up
```

This creates the `visitor_attribution` and `conversions` tables.

### 4. Start Your Application

```bash
# Frontend
npm run dev

# Backend (in another terminal)
cd backend
npm run dev
```

## How to Use

### Creating Tracking Links

Add UTM parameters to your marketing campaign URLs:

#### Google Ads Example:
```
https://yoursite.com/?utm_source=google&utm_medium=cpc&utm_campaign=summer-sale
```

#### Facebook Ads Example:
```
https://yoursite.com/?utm_source=facebook&utm_medium=social&utm_campaign=winter-promo
```

#### Instagram Ads Example:
```
https://yoursite.com/?utm_source=instagram&utm_medium=social&utm_campaign=product-launch
```

#### YouTube Ads Example:
```
https://yoursite.com/?utm_source=youtube&utm_medium=video&utm_campaign=brand-awareness
```

### What Gets Tracked Automatically

1. **Page Views** - Every page load with source/medium data
2. **Begin Checkout** - When user lands on checkout page
3. **Purchase** - When order is completed (with conversion value and attribution)

### Viewing Results

#### Google Analytics:
1. Go to **Reports** > **Acquisition** > **Traffic acquisition**
2. View traffic by source/medium
3. Check **Attribution** reports for conversion data

#### Meta Pixel:
1. Go to **Events Manager**
2. View **Events** tab
3. Check conversion events with source data

#### Backend API:
```bash
# Get attribution statistics
GET http://localhost:5000/api/attribution/stats

# Get conversion statistics
GET http://localhost:5000/api/attribution/conversions
```

## Channel Identification

The system automatically identifies:
- **Google Ads** - `utm_source=google` + `utm_medium=cpc` or `gclid` parameter
- **Facebook** - `utm_source=facebook` + `utm_medium=social` or `fbclid` parameter
- **Instagram** - `utm_source=instagram` + `utm_medium=social`
- **YouTube** - `utm_source=youtube` + `utm_medium=video`
- **Organic** - No UTM parameters, from search engines
- **Direct** - No referrer, direct visit

## Testing

1. Visit your site with UTM parameters:
   ```
   http://localhost:3000/?utm_source=google&utm_medium=cpc&utm_campaign=test
   ```

2. Check browser console - you should see attribution data logged (in development mode)

3. Check localStorage - attribution data is stored in `localStorage.getItem('attribution')`

4. Complete a test purchase - verify conversion is tracked

5. Check Google Analytics Real-time reports - events should appear within seconds

6. Check Meta Pixel Events Manager - events should appear within minutes

## Key Files

- `src/utils/attribution.ts` - Attribution tracking utility
- `src/hooks/useAttribution.ts` - React hooks for attribution
- `src/components/layout/index.tsx` - Attribution initialization
- `src/components/login/Checkout.tsx` - Conversion tracking
- `backend/src/models/Attribution.js` - Attribution database model
- `backend/src/models/Conversion.js` - Conversion database model

## Troubleshooting

### Scripts Not Loading
- Check environment variables are set correctly
- Verify `.env.local` file exists in root directory
- Check browser console for errors

### Attribution Not Captured
- Check browser console for errors
- Verify UTM parameters in URL
- Check localStorage for stored attribution data

### Conversions Not Tracked
- Verify purchase event fires in browser console
- Check order completion flow
- Verify attribution data is available

## Next Steps

1. Add UTM parameters to all your marketing campaigns
2. Monitor traffic sources in Google Analytics
3. Analyze which channels drive most conversions
4. Optimize campaigns based on attribution data
5. Focus marketing efforts on best-performing channels

For detailed documentation, see `ATTRIBUTION_TRACKING_GUIDE.md`.

