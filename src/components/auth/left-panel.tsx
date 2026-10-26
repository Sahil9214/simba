import React from 'react'
import { AUTH_CTA, AUTH_DESCRIPTION } from '@/lib/constants'
import { BarChart2 } from 'lucide-react'
import { Login_Mask_Image } from '@/assets/image'

export const LeftPanel = () => {
    return (
        <div className={"relative h-full w-[56.25%] overflow-hidden rounded-2xl border border-neutral-200 bg-white hidden md:block"}
            style={{
                backgroundImage: `url(${Login_Mask_Image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* Soft background gradients */}
            <div
                aria-hidden
                className="absolute inset-0 -z-10 rounded-2xl bg-[radial-gradient(1200px_600px_at_-10%_-20%,#f8cbd0_0%,transparent_60%),radial-gradient(900px_600px_at_110%_-10%,#ffd6c6_0%,transparent_60%),radial-gradient(1000px_700px_at_50%_120%,#e9eeff_0%,transparent_60%)]"
            />
            <div className="p-6 md:p-8 mt-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-md border border-rose-600/25 bg-white/70 px-2.5 py-1 text-sm text-neutral-900 backdrop-blur">
                    {AUTH_CTA}
                </div>

                {/* Description */}
                <p className="mt-4 max-w-xl text-pretty text-base font-medium leading-6 text-neutral-600">
                    {AUTH_DESCRIPTION} <span className="text-rose-600">all in one place.</span>
                </p>

                {/* Mock dashboard/window */}
                <div
                    className="absolute bottom-0 left-0 w-[85%]
    rounded-r-lg shadow-sm ring-1 ring-neutral-200/80
     "
                    style={{
                        height: "calc(100% - 220px)", // adjust 180px to match top content height (badge + description + padding)
                        background: "linear-gradient(157.61deg, #F5FAFF -4.1%, #F9FAFB 111.21%)",
                    }}
                >
                    {/* Window bar */}
                    <div
                        className="flex items-center justify-end gap-2 bg-[#D9D9D9] px-3 py-1.5 opacity-10"
                        style={{ borderBottom: "1px solid #0000003D" }}
                    >
                        <span className="h-2.5 w-2.5 rounded-full bg-neutral-400" />
                        <span className="h-2.5 w-2.5 rounded-full bg-neutral-400" />
                        <span className="h-2.5 w-2.5 rounded-full bg-neutral-400" />
                    </div>

                    {/* Content */}
                    <div className="relative overflow-hidden rounded-b-lg h-full">
                        <div className="flex h-full flex-col items-center justify-center gap-5 px-8">
                            {/* Chart Icon Component */}
                            <div className="flex items-center justify-center">
                                {/* Frame 56 - Outer container */}
                                <div
                                    className="flex flex-row items-center p-2 gap-2.5 flex-none order-0 flex-grow-0"
                                    style={{
                                        width: '80.67px',
                                        height: '80.67px',
                                        background: '#FEF2F2',
                                        borderRadius: '8px'
                                    }}
                                >
                                    {/* Frame 55 - Middle container */}
                                    <div
                                        className="flex flex-row items-center p-1 gap-2.5 flex-none order-0 flex-grow-0"
                                        style={{
                                            width: '76px',
                                            height: '76px',
                                            background: '#FEE2E2',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        {/* uis:chart - Inner container */}
                                        <div
                                            className="flex flex-row items-center p-1.5 gap-2.5 flex-none order-0 flex-grow-0"
                                            style={{
                                                width: '68px',
                                                height: '68px'
                                            }}
                                        >
                                            {/* Vector - Chart icon */}
                                            <div
                                                className="flex-none order-0 flex-grow-0"
                                                style={{
                                                    width: '58px',
                                                    height: '58px',
                                                    background: '#D73A36'
                                                }}
                                            >
                                                <BarChart2 className="w-full h-full text-white p-2" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="max-w-md text-center">
                                <h3 className="text-lg font-bold text-neutral-900">
                                    Generate Quick Reports
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-neutral-500">
                                    Easily create quick reports by uploading your daily or weekly sales
                                    data from your stores. Get instant access to clear dashboards and
                                    insightful sales trends!
                                </p>
                            </div>
                        </div>

                        {/* Bottom fade */}

                    </div>

                </div>
                <div
                    className="absolute bottom-0 left-0 h-[25%] w-full z-20 "
                    style={{
                        background:
                            "linear-gradient(180deg, rgba(255, 255, 255, 0) 19.48%, rgba(244, 247, 255, 0.5) 39.9%, rgba(240, 243, 255, 0.700867) 54.62%, rgba(239, 243, 255, 0.75) 67.08%, #E9EEFF 78.69%)",
                    }}
                />

            </div>
        </div>
    )
}

