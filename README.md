# MopedFuel

**Live GPS tracker for finding the nearest gas stations in Madison, Wisconsin with a fun moped theme.**

A mobile-first, interactive web app that tracks your real-time location and helps you find nearby gas stations with beautiful animations, smooth transitions, and a playful design.

---

## Features

### Core Functionality
- **Real-time GPS tracking** - Uses browser Geolocation API to track your position with high accuracy
- **Animated moped icon** - Your location is shown as a cute cartoon moped with exhaust trail animation
- **Gas station discovery** - Automatically finds nearby gas stations using OpenStreetMap data
- **Smart routing** - Calculates and displays the route to the nearest station with distance and time
- **Interactive map** - Built with Leaflet.js for smooth panning, zooming, and interactions
- **Touch-optimized** - Mobile-first design with haptic feedback support

### Visual Design
- **Bright, colorful aesthetic** - Pastel blues, oranges, and yellows with soft gradients
- **Smooth animations** - Floating elements, pulsing markers, and animated routes
- **Custom markers** - Unique fuel pump icons that change based on proximity
- **Glowing effects** - Special highlighting for the nearest station
- **Responsive UI** - One-hand usability on phones, works great on tablets and desktop too

### User Interface
- **Top status bar** - Shows current address and station count
- **Floating action buttons**:
  - Recenter on your location
  - Navigate to closest station
  - Toggle between showing all stations or just the nearest
- **Nearest station card** - Quick info card with distance, time, and "Open in Maps" button
- **Interactive legend** - Visual guide to map symbols
- **Loading screen** - "Warming up your engine..." message while initializing

---

## Tech Stack

- **Next.js 14** - React framework with App Router
- **React 18** - UI components and hooks
- **Tailwind CSS 3** - Utility-first styling
- **Leaflet.js** - Interactive maps
- **OpenStreetMap** - Map tiles and gas station data (Overpass API)
- **OSRM** - Open Source Routing Machine for route calculation
- **Nominatim** - Reverse geocoding for addresses

---

## Getting Started

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- Modern web browser with geolocation support

### Installation

1. **Clone or download this repository**

```bash
cd moped-fuel-tracker
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the development server**

```bash
npm run dev
```

4. **Open in your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

You should see:
- A loading screen ("Warming up your engine...")
- Browser permission prompt for location access (click "Allow")
- The map centered on Madison, WI (or your current location)
- Nearby gas stations appearing as markers

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## Project Structure

```
moped-fuel-tracker/
├── app/
│   ├── layout.js          # Root layout with metadata
│   ├── page.js            # Main page component with UI logic
│   └── globals.css        # Global styles, Tailwind, animations
├── components/
│   └── Map.jsx            # Leaflet map with markers and routing
├── utils/
│   └── getNearestStation.js  # Gas station API and distance calculations
├── public/
│   └── moped-icon.svg     # Standalone moped icon
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind customization
├── next.config.js         # Next.js configuration
└── README.md              # This file!
```

---

## How It Works

### 1. Geolocation Tracking

The app uses the browser's `navigator.geolocation.watchPosition()` API to continuously track your location:

```javascript
navigator.geolocation.watchPosition(success, error, {
  enableHighAccuracy: true,  // Use GPS
  timeout: 10000,
  maximumAge: 0
})
```

- Updates automatically as you move
- Falls back to Madison, WI if geolocation is denied
- Shows readable address via reverse geocoding

### 2. Finding Gas Stations

Gas stations are fetched from OpenStreetMap using the Overpass API:

```javascript
// Query for fuel stations within ~5 miles
const query = `
  [out:json];
  (
    node["amenity"="fuel"](lat-radius, lng-radius, lat+radius, lng+radius);
    way["amenity"="fuel"](lat-radius, lng-radius, lat+radius, lng+radius);
  );
  out center;
`
```

- Searches within an 8km (~5 mile) radius
- Returns name, brand, address, and coordinates
- Sorted by distance from your location

### 3. Route Calculation

Routes are calculated using OSRM (Open Source Routing Machine):

```javascript
const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
```

- Returns turn-by-turn directions
- Calculates distance (miles) and duration (minutes)
- Draws route as a dashed polyline on the map

### 4. Map Rendering

The map uses Leaflet.js with CartoDB Voyager tiles for a clean, bright look:

```javascript
<MapContainer center={[lat, lng]} zoom={14}>
  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
</MapContainer>
```

Custom markers are created using `L.divIcon()` with inline SVG and CSS.

---

## Customization

### Change the Default City

Edit `app/page.js` around line 60:

```javascript
// Default to your city if geolocation fails
setUserLocation({ lat: YOUR_LAT, lng: YOUR_LNG })
setCurrentAddress('Your City')
```

### Adjust Search Radius

Edit `components/Map.jsx` around line 70:

```javascript
// Change 8000 (meters) to your preferred radius
const stations = await fetchNearbyGasStations(userLocation.lat, userLocation.lng, 8000)
```

### Customize Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  'sky-pastel': '#B8E6F5',    // Change these!
  'orange-pastel': '#FFD5B5',
  'coral': '#FF6B6B',
  // ... add your own
}
```

### Change Map Style

Replace the TileLayer URL in `components/Map.jsx`:

```javascript
// Options:
// - Dark mode: rastertiles/dark_all/{z}/{x}/{y}{r}.png
// - Light: rastertiles/light_all/{z}/{x}/{y}{r}.png
// - Street: tile.openstreetmap.org/{z}/{x}/{y}.png
```

---

## API Usage & Rate Limits

This app uses **free, open-source APIs** with no authentication required:

### OpenStreetMap Overpass API
- **Purpose**: Fetch gas station data
- **Rate limit**: ~2 requests/second
- **Endpoint**: `https://overpass-api.de/api/interpreter`
- **Note**: Be respectful of rate limits. Implement caching for production use.

### OSRM (Routing)
- **Purpose**: Calculate routes
- **Rate limit**: Fair use (avoid hammering)
- **Endpoint**: `https://router.project-osrm.org/`

### Nominatim (Geocoding)
- **Purpose**: Convert coordinates to addresses
- **Rate limit**: 1 request/second
- **Endpoint**: `https://nominatim.openstreetmap.org/`
- **Note**: Include User-Agent header for production

### Production Recommendations

For a production app with high traffic, consider:
- **Self-hosting OSRM** for routing
- **Using Google Places API** for gas stations (requires API key)
- **Caching** gas station results
- **Implementing request throttling**

---

## Mobile Optimization

### Touch Gestures
- **Pinch to zoom** - Native Leaflet support
- **Drag to pan** - Smooth, responsive panning
- **Tap markers** - Open info popups
- **Haptic feedback** - Vibration on button press (if supported)

### Performance
- **Lazy loading** - Map loads only after geolocation is ready
- **Debounced updates** - Station list refreshes only after significant movement
- **Optimized markers** - CSS transforms instead of canvas for animations

### PWA Support

To make this a Progressive Web App:

1. Create `public/manifest.json`:

```json
{
  "name": "MopedFuel",
  "short_name": "MopedFuel",
  "description": "Find nearby gas stations",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#B8E6F5",
  "theme_color": "#B8E6F5",
  "icons": [
    {
      "src": "/moped-icon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ]
}
```

2. Add to `app/layout.js`:

```javascript
<link rel="manifest" href="/manifest.json" />
```

3. Implement a service worker for offline support

---

## Troubleshooting

### Map doesn't load
- Check browser console for errors
- Verify internet connection (map tiles load from external servers)
- Ensure Leaflet CSS is properly imported

### Geolocation not working
- Check if HTTPS is enabled (required for geolocation in production)
- Verify browser permissions for location access
- Try in a different browser

### No gas stations showing
- Check browser console for API errors
- Verify Overpass API is responding (visit https://overpass-api.de/api/status)
- Increase search radius in code

### Route not displaying
- Check OSRM endpoint is accessible
- Verify coordinates are valid
- Look for errors in browser console

---

## Browser Support

- **Chrome/Edge**: ✅ Full support
- **Safari**: ✅ Full support (iOS 14+)
- **Firefox**: ✅ Full support
- **Opera**: ✅ Full support
- **IE11**: ❌ Not supported (use modern browser)

---

## Performance Tips

1. **Limit marker count**: Filter stations by distance
2. **Debounce geolocation updates**: Don't update every second
3. **Use production build**: `npm run build` for optimized bundle
4. **Enable caching**: Cache API responses for repeated locations
5. **Lazy load map**: Already implemented with dynamic imports

---

## Future Enhancements

Ideas for expanding this project:

- [ ] Add fuel price data (requires separate API)
- [ ] Show station amenities (car wash, convenience store, etc.)
- [ ] Filter by fuel type (diesel, electric charging, etc.)
- [ ] Multi-city support (auto-detect city)
- [ ] Save favorite stations
- [ ] Route history and analytics
- [ ] Dark mode toggle
- [ ] Voice navigation integration
- [ ] Share location with friends
- [ ] Offline mode with cached data

---

## Credits

- **Maps**: OpenStreetMap contributors
- **Routing**: OSRM Project
- **Icons**: Custom SVG designs
- **Framework**: Next.js by Vercel
- **Styling**: Tailwind CSS

---

## License

MIT License - Feel free to use this project for personal or commercial purposes.

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Support

If you encounter issues:
1. Check this README's troubleshooting section
2. Search existing GitHub issues
3. Open a new issue with details about your environment

---

**Happy riding! Find your fuel and hit the road!**
