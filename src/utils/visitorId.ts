/**
 * Visitor ID Utility
 * Generates and stores a unique visitor ID for attribution tracking
 */

const VISITOR_ID_KEY = 'visitor_id';

/**
 * Generate a unique visitor ID
 */
function generateVisitorId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `visitor_${timestamp}_${random}`;
}

/**
 * Get or create visitor ID
 */
export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';

  try {
    let visitorId = localStorage.getItem(VISITOR_ID_KEY);

    if (!visitorId) {
      visitorId = generateVisitorId();
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }

    return visitorId;
  } catch (error) {
    console.error('Error getting visitor ID:', error);
    return generateVisitorId();
  }
}

/**
 * Clear visitor ID (for testing)
 */
export function clearVisitorId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(VISITOR_ID_KEY);
}

