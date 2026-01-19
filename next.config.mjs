/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    // Uncomment when add value for NEXT_PUBLIC_PATH in .env.production or .env.development
    // basePath: process.env.NEXT_PUBLIC_PATH,
    trailingSlash: true,
    
    // Performance optimizations
    compress: true,
    
    // Image optimization
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
    },
    
    // Experimental features for better performance
    experimental: {
        optimizeCss: true,
    },
    
    // Headers for caching
    async headers() {
        return [
            {
                source: '/assets/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, s-maxage=60, stale-while-revalidate=300',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
