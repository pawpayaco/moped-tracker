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
        {/* Preconnect to map tile servers for faster loading */}
        <link rel="preconnect" href="https://tile.openstreetmap.org" />

        {/* PWA manifest for mobile installation */}
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
