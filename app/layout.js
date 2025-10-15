import './globals.css'

/**
 * Root Layout Component
 * Sets up the HTML structure and metadata for the entire app
 */
export const metadata = {
  title: 'MopedFuel - Find Your Next Gas Station',
  description: 'Live GPS tracker for finding the nearest gas stations in Madison, WI with a fun moped theme',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, // Prevent zoom on mobile for app-like experience
  },
  themeColor: '#B8E6F5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MopedFuel',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Leaflet CSS - Critical for map rendering */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />

        {/* Preconnect to map tile servers for faster loading */}
        <link rel="preconnect" href="https://tile.openstreetmap.org" />
        <link rel="preconnect" href="https://a.basemaps.cartocdn.com" />
        <link rel="preconnect" href="https://b.basemaps.cartocdn.com" />
        <link rel="preconnect" href="https://c.basemaps.cartocdn.com" />

        {/* PWA manifest for mobile installation */}
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
