/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/fetchradio/:station*',
        destination: 'http://localhost:3001/scrape/:station*'
      },
      {
        source: '/api/download',
        destination: 'http://localhost:3001/downloadmusic'
      }
    ]
  }
}

module.exports = nextConfig
