/**
 * Real, external links used across the app that aren't tied to any
 * database record — small enough not to warrant a schema field, but
 * centralized here so there's exactly one place to update them.
 */

// Body Shaper System™'s verified Google Business Profile. Using the
// CID (not a ChIJ-style Place ID) — Google's write-review endpoint
// accepts it under the same `placeid` query param.
export const GOOGLE_REVIEW_URL = "https://search.google.com/local/writereview?placeid=13270517675364589804";
