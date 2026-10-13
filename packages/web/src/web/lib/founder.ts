/**
 * The founder offer: two restaurants, audits from the week of November 16.
 *
 * It shows through November 16 and comes off the site on its own from November 17.
 * To end it sooner (both places taken), set FOUNDER_PLACES_LEFT to 0.
 */
export const FOUNDER_PLACES_LEFT = 2;

/** First moment the offer is no longer shown, in the visitor's local time. */
const FOUNDER_ENDS = new Date(2026, 10, 17);

export function isFounderOpen(now: Date = new Date()): boolean {
  return FOUNDER_PLACES_LEFT > 0 && now < FOUNDER_ENDS;
}
