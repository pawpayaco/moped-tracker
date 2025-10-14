# Deployment Guide

Deploy MopedFuel to production in minutes!

---

## Vercel Deployment (Recommended)

Vercel is the easiest way to deploy Next.js apps.

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub**

```bash
git init
git add .
git commit -m "Initial commit - MopedFuel app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/moped-fuel-tracker.git
git push -u origin main
```

2. **Deploy on Vercel**

- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Click "Deploy"

That's it! Vercel auto-detects Next.js and handles everything.

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts, then visit your live URL!
```

---

## Netlify Deployment

1. **Build the app**

```bash
npm run build
```

2. **Create `netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

3. **Deploy**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

Or use Netlify's GitHub integration (similar to Vercel).

---

## Self-Hosting (Docker)

### Create `Dockerfile`

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Build and Run

```bash
# Build image
docker build -t moped-fuel .

# Run container
docker run -p 3000:3000 moped-fuel
```

---

## Environment Variables

For production, you may want to add:

### `.env.production`

```bash
# Optional: Custom API endpoints
NEXT_PUBLIC_OVERPASS_API_URL=https://overpass-api.de/api/interpreter
NEXT_PUBLIC_OSRM_API_URL=https://router.project-osrm.org

# Optional: Analytics
NEXT_PUBLIC_GA_TRACKING_ID=your_google_analytics_id
```

Add to Vercel/Netlify via their dashboard.

---

## HTTPS Requirement

Geolocation API requires HTTPS in production.

- **Vercel/Netlify**: HTTPS enabled by default
- **Self-hosting**: Use Let's Encrypt or Cloudflare

---

## Performance Optimization

### 1. Enable Compression

Next.js does this automatically, but verify in production:

```javascript
// next.config.js
module.exports = {
  compress: true, // Enabled by default
}
```

### 2. Image Optimization

If you add images later:

```javascript
import Image from 'next/image'

<Image src="/moped-icon.svg" width={50} height={50} alt="Moped" />
```

### 3. Caching Strategy

Add API response caching:

```javascript
// utils/getNearestStation.js
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function fetchNearbyGasStations(lat, lng, radius = 5000) {
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`

  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey)
    if (Date.now() - timestamp < CACHE_TTL) {
      return data
    }
  }

  const stations = await /* ... fetch logic ... */

  cache.set(cacheKey, { data: stations, timestamp: Date.now() })
  return stations
}
```

---

## Custom Domain

### Vercel

1. Go to project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records (Vercel provides instructions)

### Netlify

1. Go to "Domain settings"
2. Add custom domain
3. Update DNS (A record or CNAME)

---

## Monitoring & Analytics

### Add Google Analytics

1. **Install package**

```bash
npm install @next/third-parties
```

2. **Add to layout**

```javascript
// app/layout.js
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}
```

### Error Tracking (Sentry)

```bash
npm install @sentry/nextjs

npx @sentry/wizard@latest -i nextjs
```

---

## Security Best Practices

### 1. API Rate Limiting

Implement rate limiting for OpenStreetMap APIs:

```javascript
// middleware.js
import { rateLimit } from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

### 2. CSP Headers

Add Content Security Policy:

```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://overpass-api.de https://router.project-osrm.org https://nominatim.openstreetmap.org https://*.basemaps.cartocdn.com"
          }
        ]
      }
    ]
  }
}
```

### 3. User-Agent Headers

Add User-Agent for OpenStreetMap requests (required):

```javascript
const response = await fetch(url, {
  headers: {
    'User-Agent': 'MopedFuel/1.0 (your-email@example.com)'
  }
})
```

---

## Post-Deployment Checklist

- [ ] Test geolocation on mobile device
- [ ] Verify HTTPS is enabled
- [ ] Check all gas stations load correctly
- [ ] Test route calculation
- [ ] Confirm "Open in Maps" button works
- [ ] Test on iOS Safari, Chrome, Firefox
- [ ] Monitor API rate limits
- [ ] Set up error tracking
- [ ] Add analytics
- [ ] Test PWA installation (if implemented)

---

## Scaling Considerations

If your app gets popular:

1. **Self-host OSRM** instead of using public endpoint
2. **Cache gas station data** in Redis or similar
3. **Use CDN** for static assets
4. **Implement service worker** for offline functionality
5. **Add database** to store user favorites/history
6. **Use Google Places API** (costs money but more reliable)

---

## Support & Updates

After deployment:

- Monitor error logs
- Check API usage (OpenStreetMap has fair use policies)
- Update dependencies regularly: `npm update`
- Watch for Next.js security advisories

---

**Your MopedFuel app is ready to ship!** 🚀
