/**
 * The 2026 terms: every restaurant that signs by December 31, 2026, on any path, receives
 * 18 months of the platform instead of 12, and a return visit at month 6.
 *
 * Not a price change: the prices are the same on every path. The offer shows through
 * December 31, 2026 and comes off the site on its own from January 1, 2027.
 * (Names keep the "founder" prefix so the anchor, form field and stored inquiries stay stable.)
 */

/** First moment the offer is no longer shown, in the visitor's local time. */
const FOUNDER_ENDS = new Date(2027, 0, 1);

export function isFounderOpen(now: Date = new Date()): boolean {
  return now < FOUNDER_ENDS;
}
