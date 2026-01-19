/**
 * Attribution Tracking Utility
 * Tracks marketing channel attribution (Google Ads, Facebook, Instagram, YouTube, etc.)
 */

export interface AttributionData {
  source: string;
  medium: string;
  campaign?: string;
  term?: string;
  content?: string;
  referrer?: string;
  landingPage: string;
  timestamp: string;
  channel?: string;
}

export interface StoredAttribution {
  firstTouch: AttributionData;
  lastTouch: AttributionData;
  sessions: AttributionData[];
}

// Channel identification mapping
const CHANNEL_MAPPING: { [key: string]: string } = {
  'google': 'google_ads',
  'facebook': 'facebook',
  'instagram': 'instagram',
  'youtube': 'youtube',
  'twitter': 'twitter',
  'linkedin': 'linkedin',
  'pinterest': 'pinterest',
  'tiktok': 'tiktok',
  'bing': 'bing_ads',
  'yahoo': 'yahoo_ads',
};

// Source to channel mapping
const SOURCE_CHANNEL_MAP: { [key: string]: string } = {
  'google': 'Google Ads',
  'facebook': 'Facebook',
  'fb': 'Facebook',
  'instagram': 'Instagram',
  'ig': 'Instagram',
  'youtube': 'YouTube',
  'yt': 'YouTube',
  'twitter': 'Twitter',
  'linkedin': 'LinkedIn',
  'pinterest': 'Pinterest',
  'tiktok': 'TikTok',
  'bing': 'Bing Ads',
  'yahoo': 'Yahoo Ads',
};

/**
 * Parse UTM parameters from URL
 */
export function parseUTMParameters(): Partial<AttributionData> {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const utmData: Partial<AttributionData> = {};

  const source = params.get('utm_source');
  const medium = params.get('utm_medium');
  const campaign = params.get('utm_campaign');
  const term = params.get('utm_term');
  const content = params.get('utm_content');

  if (source) utmData.source = source.toLowerCase();
  if (medium) utmData.medium = medium.toLowerCase();
  if (campaign) utmData.campaign = campaign;
  if (term) utmData.term = term;
  if (content) utmData.content = content;

  // Check for automatic tracking parameters
  const gclid = params.get('gclid');
  const fbclid = params.get('fbclid');
  const ttclid = params.get('ttclid');

  // Google Ads auto-tagging
  if (gclid && !utmData.source) {
    utmData.source = 'google';
    utmData.medium = 'cpc';
  }

  // Facebook/Instagram click ID
  if (fbclid && !utmData.source) {
    utmData.source = 'facebook';
    utmData.medium = 'social';
  }

  // TikTok click ID
  if (ttclid && !utmData.source) {
    utmData.source = 'tiktok';
    utmData.medium = 'social';
  }

  return utmData;
}

/**
 * Get referrer source
 */
export function getReferrerSource(): { source?: string; medium?: string } {
  if (typeof window === 'undefined') return {};

  const referrer = document.referrer;
  if (!referrer) return {};

  try {
    const referrerUrl = new URL(referrer);
    const hostname = referrerUrl.hostname.toLowerCase();

    // Remove www. prefix
    const domain = hostname.replace(/^www\./, '');

    // Check for known marketing channels
    if (domain.includes('google.com') || domain.includes('googleadservices.com')) {
      return { source: 'google', medium: 'organic' };
    }

    if (domain.includes('facebook.com') || domain.includes('fb.com')) {
      return { source: 'facebook', medium: 'social' };
    }

    if (domain.includes('instagram.com')) {
      return { source: 'instagram', medium: 'social' };
    }

    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      return { source: 'youtube', medium: 'social' };
    }

    if (domain.includes('twitter.com') || domain.includes('x.com')) {
      return { source: 'twitter', medium: 'social' };
    }

    if (domain.includes('linkedin.com')) {
      return { source: 'linkedin', medium: 'social' };
    }

    if (domain.includes('pinterest.com')) {
      return { source: 'pinterest', medium: 'social' };
    }

    if (domain.includes('tiktok.com')) {
      return { source: 'tiktok', medium: 'social' };
    }

    if (domain.includes('bing.com')) {
      return { source: 'bing', medium: 'organic' };
    }

    // Default to referrer domain
    return { source: domain, medium: 'referral' };
  } catch (e) {
    return {};
  }
}

/**
 * Identify marketing channel from source
 */
export function identifyChannel(source: string): string {
  if (!source) return 'direct';

  const normalizedSource = source.toLowerCase();

  // Check direct mapping
  if (SOURCE_CHANNEL_MAP[normalizedSource]) {
    return SOURCE_CHANNEL_MAP[normalizedSource];
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(SOURCE_CHANNEL_MAP)) {
    if (normalizedSource.includes(key)) {
      return value;
    }
  }

  // Default to source name capitalized
  return normalizedSource.charAt(0).toUpperCase() + normalizedSource.slice(1);
}

/**
 * Create attribution data object
 */
export function createAttributionData(utmData: Partial<AttributionData> = {}): AttributionData {
  const referrerData = getReferrerSource();
  
  const attribution: AttributionData = {
    source: utmData.source || referrerData.source || 'direct',
    medium: utmData.medium || referrerData.medium || 'none',
    campaign: utmData.campaign,
    term: utmData.term,
    content: utmData.content,
    referrer: typeof window !== 'undefined' ? document.referrer : undefined,
    landingPage: typeof window !== 'undefined' ? window.location.pathname : '',
    timestamp: new Date().toISOString(),
  };

  attribution.channel = identifyChannel(attribution.source);

  return attribution;
}

/**
 * Store attribution data in localStorage
 */
export function storeAttribution(attribution: AttributionData): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem('attribution');
    const existing: StoredAttribution = stored 
      ? JSON.parse(stored) 
      : {
          firstTouch: attribution,
          lastTouch: attribution,
          sessions: [],
        };

    // Update last touch
    existing.lastTouch = attribution;

    // Add to sessions if this is a new session (different source/medium/campaign)
    const isNewSession = !existing.sessions.some(session => 
      session.source === attribution.source &&
      session.medium === attribution.medium &&
      session.campaign === attribution.campaign &&
      session.landingPage === attribution.landingPage
    );

    if (isNewSession) {
      existing.sessions.push(attribution);
    }

    localStorage.setItem('attribution', JSON.stringify(existing));
  } catch (error) {
    console.error('Error storing attribution:', error);
  }
}

/**
 * Get stored attribution data
 */
export function getStoredAttribution(): StoredAttribution | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem('attribution');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading attribution:', error);
    return null;
  }
}

/**
 * Get first touch attribution
 */
export function getFirstTouchAttribution(): AttributionData | null {
  const stored = getStoredAttribution();
  return stored?.firstTouch || null;
}

/**
 * Get last touch attribution
 */
export function getLastTouchAttribution(): AttributionData | null {
  const stored = getStoredAttribution();
  return stored?.lastTouch || null;
}

/**
 * Track attribution (main function)
 */
export function trackAttribution(): AttributionData {
  const utmData = parseUTMParameters();
  const attribution = createAttributionData(utmData);
  
  // Store attribution
  storeAttribution(attribution);
  
  return attribution;
}

/**
 * Get attribution data for conversion tracking
 */
export function getAttributionForConversion(): AttributionData | null {
  // Prefer last touch for conversion attribution
  return getLastTouchAttribution() || getFirstTouchAttribution();
}

/**
 * Clear attribution data (for testing)
 */
export function clearAttribution(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('attribution');
}

