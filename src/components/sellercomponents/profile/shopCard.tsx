

"use client";

import { formatDateToDDMMYYYY } from "@/utils/formatDateDDMMYYY";
import Image from "next/image";

export function ShopCard({ shop, showRecentTime = true }: { shop: any, showRecentTime?: boolean }) {
    console.log("****", shop.time)
    return (
        <>
            <div
                aria-label="shop-detail-click"
                role="button"
                className="relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden font-inter cursor-pointer"

            >
                {/* Rest of your existing JSX remains the same */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className='absolute right-0 top-0 w-full h-full'
                        style={{
                            backgroundImage: 'url(/images/seller-mask-image.webp)',
                            backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
                            opacity: 0.4,
                        }} >
                    </div>
                </div>

                <div className="relative z-10 flex flex-col">
                    <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="font-inter text-lg font-bold text-purple-600 leading-tight">
                                {shop.name}
                            </h3>
                            <Image
                                src="/svg/Store.svg"
                                alt="Store icon"
                                width={16}
                                height={16}
                                className="mt-1 shrink-0"
                            />
                        </div>

                        <div className="flex font-inter items-center gap-2 text-xs text-black opacity-50 font-medium">
                            {/* <span>{shop.address}</span> */}
                            New Delhi
                        </div>
                        <div className="flex font-inter items-center gap-2 text-xs text-black opacity-50 font-medium">
                            <span>DpCode:<strong className="text-primary opacity-100"> {shop.dpCode}</strong></span>

                        </div>
                        {
                            shop.vendorCode && (<div className="flex font-inter items-center gap-2 text-xs text-black opacity-50 font-medium">
                                <span>Vendor Code:<strong className="text-primary opacity-100"> {shop.vendorCode}</strong></span>

                            </div>)
                        }
                        {showRecentTime && shop?.time && (
                            <div className="flex font-inter items-center gap-2 text-xs text-black opacity-50 font-medium">
                                <span>
                                    Last Updated On: <strong className="text-primary opacity-100">{shop.time.split('T')[0].split('-').reverse().join('/')}</strong>

                                </span>
                            </div>
                        )}
                    </div>

                    <div className="w-full h-px bg-gray-300 opacity-40" />
                </div>
            </div >
        </>
    );
}
//hello
