/** @type {import('next').NextConfig} */
const nextConfig = process.env.NODE_ENV === 'production' ? {
  output: 'export',
  basePath: '/cesar-crown',
  assetPrefix: '/cesar-crown/',
} : {
  output: 'export',
  basePath: '',
};

export default nextConfig;
