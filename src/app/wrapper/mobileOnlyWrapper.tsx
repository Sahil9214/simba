"use client";
import React from 'react';
import { useMobile } from '@/hooks/useMobile';

interface MobileOnlyWrapperProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

const MobileOnlyWrapper: React.FC<MobileOnlyWrapperProps> = ({
    children,
    fallback
}) => {
    const isMobile = useMobile();
    const isMobileOnlyEnabled = process.env.NEXT_PUBLIC_SELLER_MOBILE_ONLY === 'true';

    // If mobile-only is disabled, always show content
    if (!isMobileOnlyEnabled) {
        return <>{children}</>;
    }
    if (isMobile) {
        return <>{children}</>;
    }

    // If mobile-only is enabled and user is on desktop, show fallback or error
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md mx-auto text-center">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Mobile Only Access
                    </h1>
                    <p className="text-gray-600 mb-6">
                        This page is designed for mobile devices only. Please access it from your mobile phone or tablet for the best experience.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => window.history.back()}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileOnlyWrapper;