/**
 * Real, external links used across the app that aren't tied to any
 * database record — small enough not to warrant a schema field, but
 * centralized here so there's exactly one place to update them.
 */

// Body Shaper System™'s verified Google Business Profile CID.
export const GOOGLE_CID = "13270517675364589804";

// The real Maps listing — confirmed working. Visitors can read every
// review here, and tap the star rating to write one themselves.
export const GOOGLE_MAPS_URL = `https://maps.google.com/?cid=${GOOGLE_CID}`;

// IMPORTANT: search.google.com/local/writereview requires a real
// Place ID ("ChIJ..." format) in its placeid param — a CID does NOT
// work there (confirmed with a real 404 from Google, not a guess).
// CID and Place ID are different identifiers for the same location;
// we don't have the Place ID yet.
//
// This is the stable version of a working link Emmy found: searching
// "opiniones de body shaper system llc" on Google surfaces the real
// rate/review panel for the business. Her original link had a bunch
// of session-specific tokens (authuser, sxsrf, si, ved, biw/bih/dpr —
// tied to her exact device and logged-in Google account slot) that
// would behave unpredictably or expire for any other visitor, so only
// the actual search query was kept.
export const GOOGLE_REVIEW_URL = "https://www.google.com/search?q=opiniones+de+body+shaper+system+llc";
