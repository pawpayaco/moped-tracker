'use client'

/**
 * MopedFuel - Main Page Component
 *
 * This is the main entry point for the app. It handles:
 * - User geolocation tracking
 * - Gas station discovery
 * - UI state management
 * - Route calculation
 */

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Map component (Leaflet requires window object)
const Map = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-sky-pastel to-yellow-pastel">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🛵</div>
        <p className="text-2xl font-bold text-gray-700">Warming up your engine...</p>
      </div>
    </div>
  ),
})

export default function Home() {
  // User's current GPS position
  const [userLocation, setUserLocation] = useState(null)

  // Nearby gas stations from OpenStreetMap
  const [gasStations, setGasStations] = useState([])

  // The nearest station with route info
  const [nearestStation, setNearestStation] = useState(null)

  // Current address (reverse geocoded from coordinates)
  const [currentAddress, setCurrentAddress] = useState('Locating...')

  // Loading state
  const [isLoading, setIsLoading] = useState(true)

  // Toggle between showing all stations vs. nearest only
  const [showAllStations, setShowAllStations] = useState(true)

  // Track if we should center on user (for recenter button)
  const [shouldRecenter, setShouldRecenter] = useState(false)

  /**
   * Initialize geolocation tracking on component mount
   * Uses browser's Geolocation API with high accuracy mode
   */
  useEffect(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    // Options for geolocation
    const options = {
      enableHighAccuracy: true, // Use GPS if available
      timeout: 10000, // 10 second timeout
      maximumAge: 0, // Don't use cached position
    }

    // Success callback - update user location
    const success = (position) => {
      const { latitude, longitude } = position.coords
      setUserLocation({ lat: latitude, lng: longitude })
      setIsLoading(false)

      // Reverse geocode to get readable address
      reverseGeocode(latitude, longitude)
    }

    // Error callback
    const error = (err) => {
      console.error('Geolocation error:', err)
      // Default to Madison, WI if geolocation fails
      setUserLocation({ lat: 43.0731, lng: -89.4012 })
      setCurrentAddress('Madison, WI (Default)')
      setIsLoading(false)
    }

    // Start watching position (updates as user moves)
    const watchId = navigator.geolocation.watchPosition(success, error, options)

    // Cleanup on unmount
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  /**
   * Reverse geocode coordinates to readable address
   * Uses Nominatim (OpenStreetMap's geocoding service)
   */
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      )
      const data = await response.json()

      if (data.address) {
        const { road, neighbourhood, suburb, city } = data.address
        const addr = road || neighbourhood || suburb || city || 'Unknown location'
        setCurrentAddress(addr)
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      setCurrentAddress('Unknown location')
    }
  }

  /**
   * Handler for "Find Closest Station" button
   * Triggers map to center on user and highlight nearest station
   */
  const handleFindClosest = () => {
    if (nearestStation) {
      // Trigger haptic feedback on mobile
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50)
      }

      // Signal to Map component to animate to nearest station
      setShouldRecenter(true)
      setTimeout(() => setShouldRecenter(false), 100)
    }
  }

  /**
   * Handler for recenter button
   * Centers map back on user's current location
   */
  const handleRecenter = () => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(30)
    }
    setShouldRecenter(true)
    setTimeout(() => setShouldRecenter(false), 100)
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {/* Top Status Bar - Shows current location */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-gradient-to-r from-coral to-teal text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⛽</span>
            <div>
              <p className="text-xs font-semibold opacity-90">Current Location</p>
              <p className="text-sm font-bold">{currentAddress}</p>
            </div>
          </div>

          {/* Station count badge */}
          {gasStations.length > 0 && (
            <div className="bg-white text-coral px-3 py-1 rounded-full text-sm font-bold">
              {gasStations.length} stations
            </div>
          )}
        </div>
      </div>

      {/* Main Map Component */}
      {!isLoading && userLocation && (
        <Map
          userLocation={userLocation}
          gasStations={gasStations}
          setGasStations={setGasStations}
          nearestStation={nearestStation}
          setNearestStation={setNearestStation}
          showAllStations={showAllStations}
          shouldRecenter={shouldRecenter}
        />
      )}

      {/* Floating Action Buttons */}
      <div className="absolute bottom-8 right-4 z-[1000] flex flex-col space-y-3">
        {/* Recenter on User Button */}
        <button
          onClick={handleRecenter}
          className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform btn-glow"
          aria-label="Recenter map on my location"
        >
          🎯
        </button>

        {/* Find Closest Station Button */}
        <button
          onClick={handleFindClosest}
          disabled={!nearestStation}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all ${
            nearestStation
              ? 'bg-gradient-to-br from-coral to-orange-pastel hover:scale-110 btn-glow'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
          aria-label="Navigate to closest gas station"
        >
          ⛽
        </button>

        {/* Toggle All/Nearest Button */}
        <button
          onClick={() => setShowAllStations(!showAllStations)}
          className="w-14 h-14 bg-purple-pastel rounded-full shadow-lg flex items-center justify-center text-xl hover:scale-110 transition-transform btn-glow"
          aria-label={showAllStations ? 'Show nearest only' : 'Show all stations'}
        >
          {showAllStations ? '👁️' : '🔍'}
        </button>
      </div>

      {/* Nearest Station Info Card */}
      {nearestStation && (
        <div className="absolute bottom-8 left-4 z-[1000] bg-white rounded-2xl shadow-2xl p-4 max-w-xs animate-float">
          <div className="flex items-start space-x-3">
            <div className="text-3xl">⛽</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-800">
                {nearestStation.name || 'Gas Station'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                📍 {nearestStation.distance?.toFixed(2)} mi away
              </p>
              {nearestStation.duration && (
                <p className="text-xs text-gray-500 mt-1">
                  ⏱️ ~{Math.ceil(nearestStation.duration)} min drive
                </p>
              )}
              {nearestStation.address && (
                <p className="text-xs text-gray-500 mt-1">
                  {nearestStation.address}
                </p>
              )}

              {/* Open in Google Maps */}
              <button
                onClick={() => {
                  const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${nearestStation.lat},${nearestStation.lng}&travelmode=driving`
                  window.open(url, '_blank')
                }}
                className="mt-3 w-full bg-gradient-to-r from-teal to-sky-pastel text-white font-semibold py-2 px-4 rounded-lg text-sm hover:shadow-lg transition-all"
              >
                Open in Maps 🗺️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend Toggle (Bottom Center) */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[999] bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-6 py-2 shadow-lg">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <span className="text-xl">🛵</span>
            <span className="font-medium text-gray-700">You</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gradient-to-br from-teal to-sky-pastel rounded-full"></div>
            <span className="font-medium text-gray-700">Stations</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gradient-to-br from-coral to-orange-pastel rounded-full animate-pulse"></div>
            <span className="font-medium text-gray-700">Nearest</span>
          </div>
        </div>
      </div>
    </main>
  )
}
