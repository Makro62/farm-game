const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: true, // matikan total dulu — SW lama sering bikin reload loop
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  // Strict Mode double-mount bisa terasa seperti refresh di provider hydrate
  reactStrictMode: false,
};

module.exports = withPWA(nextConfig);
