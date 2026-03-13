import type { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'

const isGitHubPages = process.env.GITHUB_PAGES === 'true'

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
})

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: isGitHubPages ? '/localnotes' : '',
}

export default withSerwist(nextConfig)
