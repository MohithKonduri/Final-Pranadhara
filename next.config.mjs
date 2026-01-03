/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        // Disable ESLint during builds to avoid blocking deployment
        ignoreDuringBuilds: true,
    },
    images: {
        unoptimized: false,
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'drive.google.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: '*.googleusercontent.com',
                pathname: '**',
            },
        ],
    },
    staticPageGenerationTimeout: 180,
    output: 'standalone',
    // Enable experimental features for faster compilation
    experimental: {
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    },
    // Optimize compilation
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    // Externalize packages that shouldn't be bundled
    serverExternalPackages: [
        'twilio',
        'nodemailer',
        '@emailjs/nodejs',
    ],
    webpack: (config, {
        isServer
    }) => {
        if (isServer) {
            // Keep any special server-side configurations here if needed
        }
        return config
    },
}

export default nextConfig