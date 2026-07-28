/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["cesium"],
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify("/cesium"),
      }),
    );
    return config;
  },
};

export default nextConfig;
