/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@daesthetics/shared'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
