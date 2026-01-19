/**
 * Custom React Hook for Attribution Tracking
 */

import { useEffect, useState } from 'react';
import {
  trackAttribution,
  getStoredAttribution,
  getFirstTouchAttribution,
  getLastTouchAttribution,
  AttributionData,
  StoredAttribution,
} from '@/utils/attribution';

export function useAttribution() {
  const [attribution, setAttribution] = useState<StoredAttribution | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    // Track attribution on mount
    const tracked = trackAttribution();
    
    // Get stored attribution
    const stored = getStoredAttribution();
    setAttribution(stored);
    setIsTracking(true);

    // Log attribution for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('Attribution tracked:', tracked);
      console.log('Stored attribution:', stored);
    }
  }, []);

  return {
    attribution,
    firstTouch: attribution?.firstTouch || null,
    lastTouch: attribution?.lastTouch || null,
    sessions: attribution?.sessions || [],
    isTracking,
  };
}

/**
 * Hook to get attribution data for current session
 */
export function useCurrentAttribution() {
  const [currentAttribution, setCurrentAttribution] = useState<AttributionData | null>(null);

  useEffect(() => {
    const stored = getStoredAttribution();
    setCurrentAttribution(stored?.lastTouch || null);
  }, []);

  return currentAttribution;
}

/**
 * Hook to get first touch attribution only
 */
export function useFirstTouch() {
  const [firstTouch, setFirstTouch] = useState<AttributionData | null>(null);

  useEffect(() => {
    const stored = getStoredAttribution();
    setFirstTouch(stored?.firstTouch || null);
  }, []);

  return firstTouch;
}

/**
 * Hook to get last touch attribution only
 */
export function useLastTouch() {
  const [lastTouch, setLastTouch] = useState<AttributionData | null>(null);

  useEffect(() => {
    const stored = getStoredAttribution();
    setLastTouch(stored?.lastTouch || null);
  }, []);

  return lastTouch;
}

