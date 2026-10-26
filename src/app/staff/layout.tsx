"use client";
import MobileOnlyWrapper from '@/app/wrapper/mobileOnlyWrapper';

export default function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <MobileOnlyWrapper >
            <div className='h-full bg-[#F6F6F6]'>
                {children}
            </div>
        </MobileOnlyWrapper>
    );
}
