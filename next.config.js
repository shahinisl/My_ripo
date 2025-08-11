/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Disable type checking during build for faster builds (optional)
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    // ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
