import type { NextConfig } from 'next'
import createMDX from '@next/mdx'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'node:path'

const websiteApiBase = process.env.WEBSITE_API_BASE || 'http://ai-api:3000'

const nextConfig: NextConfig = {
  /* config options here */
  // reactCompiler: true, // Commented out as often experimental/requires canary
  output: 'standalone',
  outputFileTracingRoot: path.resolve(__dirname),
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${websiteApiBase}/api/:path*`,
      },
      {
        source: '/v1/:path*',
        destination: `${websiteApiBase}/v1/:path*`,
      },
    ]
  },
  typedRoutes: true,
  experimental: {
    mdxRs: true,
    typedEnv: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

const withMDX = createMDX({
  // Add markdown plugins here, as desired
})

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

// Merge MDX config with Next.js config
export default withNextIntl(withMDX(nextConfig))
