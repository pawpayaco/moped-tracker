/**
 * Interactive Map Component
 *
 * Renders a Leaflet map with:
 * - Real-time user location (animated moped icon)
 * - Gas station markers with custom styling
 * - Route polyline to nearest station
 * - Popup interactions
 * - Smooth animations and transitions
 */

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import {
  fetchNearbyGasStations,
  findNearestStation,
  fetchRoute,
  formatDistance,
} from '../utils/getNearestStation'

/**
 * Custom Hook Component: Auto-centers map on user location or nearest station
 */
function MapController({ userLocation, shouldRecenter, nearestStation }) {
  const map = useMap()

  useEffect(() => {
    if (shouldRecenter && nearestStation) {
      // Fly to show both user and nearest station
      const bounds = L.latLngBounds(
        [userLocation.lat, userLocation.lng],
        [nearestStation.lat, nearestStation.lng]
      )
      map.flyToBounds(bounds, {
        padding: [100, 100],
        duration: 1.5,
        easeLinearity: 0.25,
      })
    } else if (shouldRecenter) {
      // Just center on user
      map.flyTo([userLocation.lat, userLocation.lng], 15, {
        duration: 1,
        easeLinearity: 0.25,
      })
    }
  }, [shouldRecenter, userLocation, nearestStation, map])

  return null
}

/**
 * Custom Hook Component: Fetches and updates gas stations
 */
function GasStationFetcher({ userLocation, setGasStations, setNearestStation }) {
  const [hasInitialized, setHasInitialized] = useState(false)

  useEffect(() => {
    if (!userLocation || hasInitialized) return

    // Fetch gas stations on initial load
    const fetchStations = async () => {
      const stations = await fetchNearbyGasStations(userLocation.lat, userLocation.lng, 8000)
      setGasStations(stations)

      if (stations.length > 0) {
        const nearest = findNearestStation(stations, userLocation)

        // Fetch route to nearest station
        if (nearest) {
          const route = await fetchRoute(userLocation, nearest)
          setNearestStation({
            ...nearest,
            route: route?.coordinates,
            duration: route?.duration,
          })
        }
      }
      setHasInitialized(true)
    }

    fetchStations()
  }, [userLocation, hasInitialized, setGasStations, setNearestStation])

  // Update nearest station as user moves
  useEffect(() => {
    if (!hasInitialized) return

    const updateNearest = async () => {
      // Refetch stations if user has moved significantly (every ~500m)
      const stations = await fetchNearbyGasStations(userLocation.lat, userLocation.lng, 8000)
      setGasStations(stations)

      if (stations.length > 0) {
        const nearest = findNearestStation(stations, userLocation)

        if (nearest) {
          const route = await fetchRoute(userLocation, nearest)
          setNearestStation({
            ...nearest,
            route: route?.coordinates,
            duration: route?.duration,
          })
        }
      }
    }

    // Debounce updates to avoid too many API calls
    const timeoutId = setTimeout(updateNearest, 2000)
    return () => clearTimeout(timeoutId)
  }, [userLocation, hasInitialized, setGasStations, setNearestStation])

  return null
}

/**
 * Main Map Component
 */
export default function Map({
  userLocation,
  gasStations,
  setGasStations,
  nearestStation,
  setNearestStation,
  showAllStations,
  shouldRecenter,
}) {
  const mapRef = useRef(null)
  const [exhaustPuffs, setExhaustPuffs] = useState([])

  /**
   * Create custom moped icon with SVG
   */
  const mopedIcon = L.divIcon({
    className: 'moped-marker',
    html: `
      <div style="position: relative; width: 50px; height: 50px; display: block;">
        <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="display: block;">
          <!-- Moped body -->
          <ellipse cx="50" cy="50" rx="35" ry="25" fill="#FF6B6B" stroke="#fff" stroke-width="4"/>

          <!-- Windshield -->
          <path d="M 35 35 Q 50 25 65 35" fill="none" stroke="#B8E6F5" stroke-width="5" stroke-linecap="round"/>

          <!-- Headlight -->
          <circle cx="50" cy="55" r="6" fill="#FFF4CC" opacity="0.95"/>

          <!-- Wheels -->
          <circle cx="30" cy="65" r="9" fill="#333" stroke="#fff" stroke-width="3"/>
          <circle cx="70" cy="65" r="9" fill="#333" stroke="#fff" stroke-width="3"/>

          <!-- Direction indicator (small arrow) -->
          <path d="M 75 45 L 88 50 L 75 55 Z" fill="#4ECDC4" stroke="#fff" stroke-width="1"/>
        </svg>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25],
  })

  /**
   * Create custom fuel pump icons for gas stations
   */
  const createFuelIcon = (isNearest = false) => {
    const gradient = isNearest
      ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)'
      : 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)'

    return L.divIcon({
      className: isNearest ? 'fuel-marker fuel-marker-nearest' : 'fuel-marker',
      html: `
        <div style="
          width: 40px;
          height: 40px;
          background: ${gradient};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        ">
          ⛽
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    })
  }

  /**
   * Generate exhaust puffs animation effect
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setExhaustPuffs((prev) => {
        // Add new puff
        const newPuff = {
          id: Date.now(),
          left: -10,
          opacity: 0.8,
        }

        // Remove old puffs and update existing ones
        const updated = prev
          .map((puff) => ({
            ...puff,
            left: puff.left - 5,
            opacity: puff.opacity - 0.1,
          }))
          .filter((puff) => puff.opacity > 0)

        return [...updated, newPuff].slice(-5) // Keep max 5 puffs
      })
    }, 300)

    return () => clearInterval(interval)
  }, [])

  // Stations to display (all or just nearest)
  const displayedStations = showAllStations
    ? gasStations
    : nearestStation
    ? [nearestStation]
    : []

  return (
    <>
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={14}
        className="w-full h-full z-0"
        zoomControl={false} // Remove default zoom control (add custom one)
        ref={mapRef}
        minZoom={11}
        maxZoom={18}
      >
        {/* Base Map Tiles - Using CartoDB Positron for a clean, bright look */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={20}
        />

        {/* User Location Marker (Animated Moped) */}
        <Marker position={[userLocation.lat, userLocation.lng]} icon={mopedIcon}>
          <Popup>
            <div className="text-center p-2">
              <p className="text-lg font-bold">You are here!</p>
              <p className="text-sm text-gray-600 mt-1">
                📍 {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Gas Station Markers */}
        {displayedStations.map((station) => {
          const isNearest = nearestStation && station.id === nearestStation.id

          return (
            <Marker
              key={station.id}
              position={[station.lat, station.lng]}
              icon={createFuelIcon(isNearest)}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-lg mb-2">
                    {isNearest && '⭐ '}
                    {station.name}
                  </h3>

                  {station.brand && (
                    <p className="text-sm text-gray-600 mb-1">
                      🏷️ {station.brand}
                    </p>
                  )}

                  <p className="text-sm text-gray-700 mb-1">
                    📍 {formatDistance(station.distance)} away
                  </p>

                  {station.address && (
                    <p className="text-xs text-gray-500 mb-2">
                      {station.address}
                    </p>
                  )}

                  {isNearest && station.duration && (
                    <p className="text-sm font-semibold text-coral mb-2">
                      ⏱️ ~{Math.ceil(station.duration)} min drive
                    </p>
                  )}

                  <button
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${station.lat},${station.lng}&travelmode=driving`
                      window.open(url, '_blank')
                    }}
                    className="w-full bg-gradient-to-r from-teal to-sky-pastel text-white font-semibold py-2 px-4 rounded-lg text-sm hover:shadow-lg transition-all mt-2"
                  >
                    Get Directions 🗺️
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Route Polyline to Nearest Station */}
        {nearestStation?.route && nearestStation.route.length > 0 && (
          <Polyline
            positions={nearestStation.route}
            pathOptions={{
              color: '#FF6B6B',
              weight: 6,
              opacity: 0.9,
              dashArray: '12, 8',
              lineCap: 'round',
              lineJoin: 'round',
            }}
            interactive={false}
          />
        )}

        {/* Map Controller for auto-centering */}
        <MapController
          userLocation={userLocation}
          shouldRecenter={shouldRecenter}
          nearestStation={nearestStation}
        />

        {/* Gas Station Fetcher */}
        <GasStationFetcher
          userLocation={userLocation}
          setGasStations={setGasStations}
          setNearestStation={setNearestStation}
        />
      </MapContainer>

      {/* Exhaust Trail Effect (rendered outside map for absolute positioning) */}
      <div className="pointer-events-none fixed top-0 left-0 w-full h-full z-[999]">
        {exhaustPuffs.map((puff) => (
          <div
            key={puff.id}
            className="exhaust-puff"
            style={{
              left: `${puff.left}px`,
              opacity: puff.opacity,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
        ))}
      </div>
    </>
  )
}
