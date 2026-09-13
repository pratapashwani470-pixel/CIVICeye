// Possible-duplicate detection for the Civic-Eye prototype.
//
// This is a simple heuristic — NOT a real AI duplicate-detection system.
// Two complaints are flagged as "possible related reports" when they share
// the same issue category AND their stored coordinates are within
// DUPLICATE_DISTANCE_METERS of each other. Address text is never compared
// directly, only lat/lng.
//
// Nothing here deletes, merges, or rewrites complaints — it only computes a
// derived, read-only view (which complaints look related) that the
// Authority Dashboard can display and use as a priority signal.

export const DUPLICATE_DISTANCE_METERS = 100;

const EARTH_RADIUS_METERS = 6371000;

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance between two lat/lng points, in meters. */
export function distanceMeters(lat1, lng1, lat2, lng2) {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

function hasCoordinates(complaint) {
  return (
    typeof complaint?.location?.latitude === "number" &&
    typeof complaint?.location?.longitude === "number" &&
    !Number.isNaN(complaint.location.latitude) &&
    !Number.isNaN(complaint.location.longitude)
  );
}

function sameCategory(a, b) {
  return a.category?.trim().toLowerCase() === b.category?.trim().toLowerCase();
}

/**
 * True if `a` and `b` look like possible duplicate/related reports: same
 * category and within the distance threshold. Complaints missing
 * coordinates are never geo-matched — they're simply skipped, so old
 * sample data without lat/lng keeps working exactly as before.
 */
function isPossibleDuplicate(a, b) {
  if (a.id === b.id) return false;
  if (!sameCategory(a, b)) return false;
  if (!hasCoordinates(a) || !hasCoordinates(b)) return false;

  return (
    distanceMeters(a.location.latitude, a.location.longitude, b.location.latitude, b.location.longitude) <=
    DUPLICATE_DISTANCE_METERS
  );
}

/**
 * Builds a map of complaintId -> array of related complaint ids, for every
 * complaint in `complaints`. Purely derived — call this fresh whenever the
 * complaint list changes; nothing is persisted back to storage.
 */
export function buildRelatedReportsMap(complaints) {
  const map = {};
  for (const complaint of complaints) {
    map[complaint.id] = complaints.filter((other) => isPossibleDuplicate(complaint, other)).map((other) => other.id);
  }
  return map;
}

/**
 * Nudges a complaint's priority score upward based on how many related
 * reports it has, as a simple public-impact signal. This only adds a small,
 * capped bonus on top of the AI's original priority_score — it never
 * replaces it — and the result is always clamped back into 0-100.
 */
export function adjustPriorityForRelatedReports(basePriorityScore, relatedCount) {
  if (!relatedCount) return basePriorityScore;
  const bonus = Math.min(relatedCount * 4, 20); // +4 per related report, capped at +20
  return Math.max(0, Math.min(100, basePriorityScore + bonus));
}
