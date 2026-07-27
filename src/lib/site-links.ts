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
// we don't have the Place ID yet. Until we do, point both "read" and
// "write a review" actions at the one link that's actually verified
// to work — one tap further to the review composer, but never a
// dead end. Update this the moment we have the real Place ID.
export const GOOGLE_REVIEW_URL = GOOGLE_MAPS_URL;
