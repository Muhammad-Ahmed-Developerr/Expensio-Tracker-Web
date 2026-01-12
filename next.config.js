/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  output: undefined,

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: undefined,
};

export default nextConfig;




