import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        domains: [
            "localhost",
            "images.unsplash.com",
            "daily-image-upload.s3.us-east-1.amazonaws.com"
        ],
    },
    env: {
        NEXT_PUBLIC_SELLER_MOBILE_ONLY: process.env.NEXT_PUBLIC_SELLER_MOBILE_ONLY,
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    async rewrites() {
        const target = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';
        return [
            {
                source: '/api/:path*',
                destination: `${target}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;
