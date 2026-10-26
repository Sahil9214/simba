import React from "react";

export const BreakageChartSkeleton = () => {
    return (
        <div 
            className="flex flex-col items-start p-0 gap-6 isolate"
            style={{
                width: "487px",
                height: "372px",
                borderRadius: "10px",
                flex: "none",
                order: 0,
                flexGrow: 1
            }}
        >
            {/* Header Section Skeleton */}
            <div 
                className="flex flex-col items-start p-0 gap-1"
                style={{
                    width: "487px",
                    height: "80px",
                    flex: "none",
                    order: 0,
                    flexGrow: 0,
                    zIndex: 0
                }}
            >
                {/* Title and Controls Skeleton */}
                <div 
                    className="flex flex-row justify-between items-center p-0 gap-1"
                    style={{
                        width: "487px",
                        height: "36px",
                        flex: "none",
                        order: 0,
                        alignSelf: "stretch",
                        flexGrow: 0
                    }}
                >
                    {/* Title Skeleton */}
                    <div 
                        className="bg-gray-200 rounded animate-pulse"
                        style={{
                            margin: "0 auto",
                            width: "142px",
                            height: "24px"
                        }}
                    />
                    
                    {/* Hidden Controls Container */}
                    <div 
                        className="flex flex-row items-center p-0 gap-2"
                        style={{
                            margin: "0 auto",
                            width: "128px",
                            height: "36px",
                            opacity: 0,
                            flex: "none",
                            order: 1,
                            flexGrow: 0
                        }}
                    />
                </div>

                {/* Description Skeleton */}
                <div 
                    className="bg-gray-200 rounded animate-pulse"
                    style={{
                        width: "487px",
                        height: "40px"
                    }}
                />
            </div>

            {/* Chart Section Skeleton */}
            <div 
                className="flex flex-col items-start p-0 pl-10 gap-3"
                style={{
                    width: "487px",
                    height: "268px",
                    flex: "none",
                    order: 1,
                    alignSelf: "stretch",
                    flexGrow: 0,
                    zIndex: 1
                }}
            >
                {/* Chart Container Skeleton */}
                <div 
                    className="flex flex-col items-center p-0 gap-9"
                    style={{
                        width: "332px",
                        height: "268px",
                        flex: "none",
                        order: 0,
                        flexGrow: 0
                    }}
                >
                    <div 
                        className="bg-gray-100 rounded-lg animate-pulse"
                        style={{
                            width: "332px",
                            height: "268px",
                            flex: "none",
                            order: 0,
                            alignSelf: "stretch",
                            flexGrow: 1
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
