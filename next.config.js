/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Optimize images from external sources
  images: {
    domains: ['openstreetmap.org'],
  },
}

module.exports = nextConfig
