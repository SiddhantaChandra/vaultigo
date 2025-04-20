/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable WebAssembly support
  webpack: (config, { isServer }) => {
    // We need to handle WebAssembly files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Make sure we use proper sources for WebAssembly
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    // Handle polyfill for Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, // Ensure fs is properly stubbed in browser
        path: false,
        crypto: false,
      };
    }

    return config;
  },
  // Transpile specific packages that might have issues
  transpilePackages: ['argon2-browser'],
};

export default nextConfig;
