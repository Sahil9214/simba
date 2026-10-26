"use client";

import { SalesReportTable } from "@/components/tables";
import { useState } from "react";

const BeerBottlesData = [
    { segment: "Beer Large", size: "330ml", sales: 20, closing: 32, avail: 18, breakage: 0, demand: 12 },
    { segment: "Beer Large", size: "650ml", sales: 14, closing: 18, avail: 4, breakage: 0, demand: 5 },
    { segment: "Beer Stout", size: "330ml", sales: 5, closing: 1, avail: 18, breakage: 2, demand: 14 },
    { segment: "Beer Wit", size: "650ml", sales: 23, closing: 2, avail: 12, breakage: 1, demand: 6 },
    { segment: "Beer Strong", size: "650ml", sales: 18, closing: 12, avail: 5, breakage: 9, demand: 0 }
];

const canBeer = [
    { segment: "Can Lager", size: "330ml", sales: 42, closing: 20, avail: 22, breakage: 1, demand: 8 },
    { segment: "Can Wheat", size: "500ml", sales: 30, closing: 12, avail: 10, breakage: 0, demand: 6 },
];

const vodka = [
    { segment: "Vodka Brand X", size: "750ml", sales: 7, closing: 3, avail: 2, breakage: 0, demand: 1 },
    { segment: "Vodka Brand Y", size: "375ml", sales: 12, closing: 5, avail: 6, breakage: 1, demand: 2 },
];

const Tabs = [
    { label: "Beer Bottles", value: "Beer Bottles" },
    { label: "Can Beer", value: "Can Beer" },
    { label: "Vodka", value: "Vodka" },
]

const UpdatedStock = () => {
    const [tab, setTabPanel] = useState<"Beer Bottles" | "Can Beer" | "Vodka">("Beer Bottles");
    return (
        <div>
            <h3 className="font-inter text-lg font-semibold text-black text-center">Updated Stock</h3>
            <div className="flex gap-2 mt-4 justify-center">
                {
                    Tabs.map((tabItem) => {
                        const isActive = tabItem.value === tab;

                        const buttonClasses = [
                            "font-inter",
                            "cursor-pointer",
                            "text-sm",
                            "p-3",
                            "rounded-full",
                            "flex",
                            "items-center",
                            "justify-center",
                            "bg-[#F8F8F8]",
                            "transition-all", // Smooth transition for all properties
                            "duration-300", // 300ms transition duration
                            "ease-in-out", // Smooth easing function
                            "transform", // Enable transform transitions
                            "hover:scale-105", // Subtle hover scale effect
                        ];

                        if (isActive) {
                            buttonClasses.push(
                                "shadow-lg", // Enhanced shadow for active state
                                "font-bold",
                                "border",
                                "border-black",
                                "text-black",
                                "scale-105", // Slightly larger when active
                                "shadow-black/10", // Subtle black shadow
                            );
                        } else {
                            buttonClasses.push(
                                "font-normal",
                                "text-sidebar-foreground",
                                "opacity-50",
                                "border",
                                "border-transparent",
                                "hover:opacity-75", // Smooth opacity change on hover
                                "hover:shadow-md", // Add shadow on hover
                            );
                        }

                        return (
                            <div
                                key={tabItem.value}
                                className={buttonClasses.join(" ")}
                                onClick={() => setTabPanel(tabItem.value as "Beer Bottles" | "Can Beer" | "Vodka")}
                            >
                                {tabItem.label}
                            </div>
                        );
                    })
                }
            </div>

            {/* Add smooth content transition */}
            <div className="transition-all duration-500 ease-in-out transform">
                <SalesReportTable
                    data={tab === "Beer Bottles" ? BeerBottlesData : tab === "Can Beer" ? canBeer : vodka}
                />
            </div>
        </div>
    )
}

export default UpdatedStock
