/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  experimental: {
    // Enable experimental features if needed
  },
  images: {
    domains: [
      // Add domains for external images if needed
      'localhost',
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Enable strict mode for better development experience
  reactStrictMode: true,
  // Configure redirects if needed
  async redirects() {
    return [
      // Add redirects here if needed
    ]
  },
  // Configure rewrites if needed
  async rewrites() {
    return [
      // Add rewrites here if needed
    ]
  },
}

module.exports = nextConfig
