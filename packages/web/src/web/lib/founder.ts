/**
 * The founder offer: two restaurants, audits from the week of December 15.
 *
 * It shows through December 15 and comes off the site on its own from December 16.
 * To end it sooner (both places taken), set FOUNDER_PLACES_LEFT to 0.
 */
export const FOUNDER_PLACES_LEFT = 2;

/** First moment the offer is no longer shown, in the visitor's local time. */
const FOUNDER_ENDS = new Date(2026, 11, 16);

export function isFounderOpen(now: Date = new Date()): boolean {
  return FOUNDER_PLACES_LEFT > 0 && now < FOUNDER_ENDS;
}
