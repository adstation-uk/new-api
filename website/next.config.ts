import type { NextConfig } from 'next'
import createMDX from '@next/mdx'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  /* config options here */
  // reactCompiler: true, // Commented out as often experimental/requires canary
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
      {
        source: '/v1/:path*',
        destination: 'http://localhost:3000/v1/:path*',
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
