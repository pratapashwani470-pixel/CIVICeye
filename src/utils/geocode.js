// Converts GPS coordinates into a short, human-readable address using
// OpenStreetMap's public Nominatim service. No API key is required or used —
// Nominatim's reverse-geocoding endpoint is free for light, non-commercial
// use. This is fine for a Day 1 prototype; a production app should proxy
// this through its own backend to respect Nominatim's usage policy and add
// caching/rate-limiting.

const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

/**
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<string|null>} a short address, or null if it can't be resolved
 */
export async function reverseGeocode(lat, lng) {
  const url = `${NOMINATIM_REVERSE_URL}?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`;

  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) return null;

    const data = await response.json();
    const addr = data.address || {};

    // Prefer a short "neighbourhood, city" style label over the full
    // (often very long) display_name Nominatim returns.
    const primary = addr.suburb || addr.neighbourhood || addr.road || addr.village || addr.city_district;
    const secondary = addr.city || addr.town || addr.county;
    const short = [primary, secondary].filter(Boolean).join(", ");

    return short || data.display_name || null;
  } catch {
    return null;
  }
}
