/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
