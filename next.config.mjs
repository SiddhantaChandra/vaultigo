/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    asyncWebAssembly: true, // Enable WebAssembly support
  },
  webpack: (config) => {
    // Add WASM file handling
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },
};

export default nextConfig;
