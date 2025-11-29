/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    return [
      // Proxy Threads OAuth callbacks and related auth routes to backend
      {
        source: "/threads/auth/:path*",
        destination: `${backend}/threads/auth/:path*`,
      },
    ]
  },
}

export default nextConfig
