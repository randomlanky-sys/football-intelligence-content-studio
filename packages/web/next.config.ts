import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Remove output: 'export' to use app router with server rendering
  // This allows all routes (/, /projects, /projects/1) to work properly
  // If you want static export, configure rewrites below
  experimental: {
    optimizer: true,
    // appDir: true // App router is default in Next.js 15
  }
}

export default nextConfig