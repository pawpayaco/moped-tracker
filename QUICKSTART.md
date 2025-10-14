# Quick Start Guide

Get MopedFuel running in 3 minutes!

## Prerequisites

- Node.js 20+ ([Download here](https://nodejs.org/))

## Installation

```bash
# Navigate to the project folder
cd moped-fuel-tracker

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Open in Browser

Visit **http://localhost:3000**

1. Click "Allow" when prompted for location access
2. Wait for the map to load
3. See nearby gas stations appear
4. Click the ⛽ button to find the closest one!

## That's it!

The app will:
- Track your GPS location in real-time
- Show you as an animated moped icon
- Display nearby gas stations
- Draw a route to the nearest one
- Update as you move

## Common Issues

**Map not loading?**
- Check internet connection (map tiles load externally)
- Make sure port 3000 isn't already in use

**Location not working?**
- Ensure you clicked "Allow" for location access
- Try a different browser
- Check if you're on HTTPS (required for geolocation)

**No gas stations?**
- You might not be near any (try Madison, WI area)
- Check browser console for API errors

## Next Steps

- Read the full [README.md](README.md) for customization options
- Edit `tailwind.config.js` to change colors
- Modify `app/page.js` to change default city
- Deploy to Vercel/Netlify for production use

**Happy mapping!** 🛵⛽
