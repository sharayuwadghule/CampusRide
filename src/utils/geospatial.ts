/**
 * Utility for distance and time calculations in the campus environment.
 */

/**
 * Calculates the Haversine distance between two points in meters.
 */
export function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const deltaP = ((lat2 - lat1) * Math.PI) / 180;
  const deltaL = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaP / 2) * Math.sin(deltaP / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(deltaL / 2) * Math.sin(deltaL / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Estimates walking distance based on straight-line distance.
 * Campus paths are roughly 1.3x straight lines.
 */
export function estimateWalkingDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const straightLine = getHaversineDistance(lat1, lon1, lat2, lon2);
  return Math.round(straightLine * 1.3);
}

/**
 * Estimates travel time in minutes.
 * avgSpeed in km/h. For campus bike/walking, we use 15 km/h for bike.
 */
export function estimateTravelTime(distanceMeters: number, avgSpeedKmh: number = 15): number {
  const distanceKm = distanceMeters / 1000;
  const timeHours = distanceKm / avgSpeedKmh;
  return Math.max(1, Math.round(timeHours * 60));
}
