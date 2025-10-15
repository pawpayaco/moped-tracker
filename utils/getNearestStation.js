/**
 * Gas Station Discovery & Route Utilities
 *
 * This module provides functions for:
 * - Fetching nearby gas stations from OpenStreetMap
 * - Calculating distances between coordinates
 * - Finding the nearest station
 * - Fetching route data with turn-by-turn directions
 */

/**
 * Haversine formula to calculate distance between two coordinates
 * Returns distance in miles
 *
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in miles
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959 // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}

/**
 * Fetch nearby gas stations using OpenStreetMap Overpass API
 *
 * @param {number} lat - User's latitude
 * @param {number} lng - User's longitude
 * @param {number} radius - Search radius in meters (default: 5000 = ~3 miles)
 * @returns {Promise<Array>} Array of gas station objects
 */
export async function fetchNearbyGasStations(lat, lng, radius = 5000) {
  try {
    // Overpass API query - finds fuel stations (amenity=fuel)
    // Using a bounding box for better performance than radius search
    const radiusInDegrees = radius / 111000 // Approximate conversion to degrees

    const query = `
      [out:json];
      (
        node["amenity"="fuel"]
          (${lat - radiusInDegrees},${lng - radiusInDegrees},${lat + radiusInDegrees},${lng + radiusInDegrees});
        way["amenity"="fuel"]
          (${lat - radiusInDegrees},${lng - radiusInDegrees},${lat + radiusInDegrees},${lng + radiusInDegrees});
      );
      out center;
    `

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'MopedFuel/1.0 (moped-tracker.vercel.app)',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch gas stations')
    }

    const data = await response.json()

    // Process and format the results
    const stations = data.elements.map((element) => {
      // For ways (areas), use the center point; for nodes, use lat/lon directly
      const stationLat = element.center?.lat || element.lat
      const stationLon = element.center?.lon || element.lon

      // Calculate distance from user
      const distance = calculateDistance(lat, lng, stationLat, stationLon)

      return {
        id: element.id,
        lat: stationLat,
        lng: stationLon,
        name: element.tags?.name || element.tags?.brand || 'Gas Station',
        brand: element.tags?.brand,
        operator: element.tags?.operator,
        address: formatAddress(element.tags),
        distance: distance,
        tags: element.tags,
      }
    })

    // Sort by distance (nearest first)
    return stations.sort((a, b) => a.distance - b.distance)
  } catch (error) {
    console.error('Error fetching gas stations:', error)
    return []
  }
}

/**
 * Format address from OSM tags
 */
function formatAddress(tags) {
  if (!tags) return null

  const parts = []
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber'])
  if (tags['addr:street']) parts.push(tags['addr:street'])
  if (tags['addr:city']) parts.push(tags['addr:city'])

  return parts.length > 0 ? parts.join(', ') : null
}

/**
 * Find the nearest gas station from a list
 *
 * @param {Array} stations - Array of gas station objects
 * @param {Object} userLocation - User's current location {lat, lng}
 * @returns {Object|null} Nearest station object or null
 */
export function findNearestStation(stations, userLocation) {
  if (!stations || stations.length === 0) return null

  // Stations are already sorted by distance, so return first one
  return stations[0]
}

/**
 * Fetch route between two points using OSRM (Open Source Routing Machine)
 *
 * @param {Object} start - Starting location {lat, lng}
 * @param {Object} end - Ending location {lat, lng}
 * @returns {Promise<Object>} Route data with coordinates, distance, and duration
 */
export async function fetchRoute(start, end) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MopedFuel/1.0 (moped-tracker.vercel.app)',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch route')
    }

    const data = await response.json()

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found')
    }

    const route = data.routes[0]

    return {
      coordinates: route.geometry.coordinates.map((coord) => [coord[1], coord[0]]), // Convert [lng, lat] to [lat, lng]
      distance: route.distance / 1609.34, // Convert meters to miles
      duration: route.duration / 60, // Convert seconds to minutes
      steps: route.legs[0]?.steps || [],
    }
  } catch (error) {
    console.error('Error fetching route:', error)
    return null
  }
}

/**
 * Calculate estimated time of arrival
 *
 * @param {number} durationMinutes - Duration in minutes
 * @returns {string} Formatted ETA (e.g., "2:45 PM")
 */
export function calculateETA(durationMinutes) {
  const now = new Date()
  const eta = new Date(now.getTime() + durationMinutes * 60000)

  return eta.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format distance for display
 *
 * @param {number} miles - Distance in miles
 * @returns {string} Formatted distance (e.g., "2.5 mi" or "0.3 mi")
 */
export function formatDistance(miles) {
  if (miles < 0.1) {
    return `${Math.round(miles * 5280)} ft` // Show feet for very short distances
  }
  return `${miles.toFixed(1)} mi`
}
