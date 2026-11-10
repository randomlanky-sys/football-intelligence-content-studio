import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: [
    '@fics/data-import',
    '@fics/evidence-engine',
    '@fics/export-engine',
    '@fics/geometry',
    '@fics/schema',
    '@fics/timebase',
    '@fics/ui',
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
