const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // aktif saat production/build agar bisa diinstal di HP
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
