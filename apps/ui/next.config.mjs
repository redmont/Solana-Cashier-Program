/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, context) => {
    if (!context.isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          fs: false,
          net: false,
          tls: false,
        },
      };
    }
    if (config.plugins) {
      config.plugins.push(
        new context.webpack.IgnorePlugin({
          resourceRegExp: /^(lokijs|pino-pretty|encoding)$/,
        }),
      );
    }
    return config;
  },
};

export default nextConfig;
