/** @type {import('next').NextConfig} */
const nextConfig = {
  // 개발 환경 최적화
  experimental: {
    // Turbopack 최적화 옵션 (필요시 추가)
  },

  // 불필요한 소스맵 비활성화 (개발 속도 향상)
  productionBrowserSourceMaps: false,

  // 개발 환경에서 Fast Refresh 최적화
  reactStrictMode: true,
}

module.exports = nextConfig
