import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    outputFileTracingRoot: path.join(__dirname),
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
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
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
