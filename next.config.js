
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // Disable all static optimization
  trailingSlash: false,

  // Updated for Next.js 15 - moved from experimental
  serverExternalPackages: ['@supabase/supabase-js'],

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable static generation completely
  experimental: {
    // Disable static optimization
    isrMemoryCacheSize: 0,
  },

  // Environment variables for build
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hvwoeasnoeecgqseuigd.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2d29lYXNub2VlY2dxc2V1aWdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTkyMTcsImV4cCI6MjA2ODI5NTIxN30.chxHGUPbk_ser94F-4RBh2pAQrcKZiX5dz_-JQhzL7o',
  },

  // Force all pages to be dynamic to avoid build-time data fetching
  async generateBuildId() {
    return 'build-' + Date.now()
  }
}

module.exports = nextConfig
