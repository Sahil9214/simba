// components/InsightStream.tsx
"use client";

import React, { useMemo } from "react";
import {
    Trophy,
    AlertTriangle,
    Truck,
    TrendingUp,
    BarChart2,
} from "lucide-react";

export type InsightStatus = "success" | "warning" | "danger";
export type InsightItem = {
    id?: string;
    title: string;
    status: InsightStatus;
    // optional: API may also send an icon name string (kebab-case)
    icon?: string;
};

/**
 * Small mapping of kebab-case icon names (coming from API) to lucide-react components.
 * Add more icons here as you need them.
 */
const ICON_MAP: Record<string, React.FC<any>> = {
    trophy: Trophy,
    "alert-triangle": AlertTriangle,
    warning: AlertTriangle,
    truck: Truck,
    "trending-up": TrendingUp,
    trend: TrendingUp,
    "bar-chart": BarChart2,
    "bar-chart-2": BarChart2,
};

const DEFAULT_ITEMS: InsightItem[] = [
    { id: "i1", title: "Extra Smooth Can leads with 911 units (+12% YoY)", status: "success" },
    { id: "i2", title: "121 stuck units at New Rohtak Rd – 45 days no movement", status: "warning" },
    { id: "i3", title: "Narela Lampur nearly sold out – urgent replenishment needed", status: "warning", icon: "truck" },
    { id: "i4", title: "Overall sales up 9.6% YoY", status: "success", icon: "trending-up" },
];

const TONE_MAP: Record<
    InsightStatus,
    { bgClass: string; borderColor: string; iconColor: string }
> = {
    success: { bgClass: "bg-[#D1FAE5]", borderColor: "#10B981", iconColor: "#10B981" },
    warning: { bgClass: "bg-[#FEF3C7]", borderColor: "#F59E0B", iconColor: "#F59E0B" },
    danger: { bgClass: "bg-[#FEE2E2]", borderColor: "#EF4444", iconColor: "#EF4444" }, // reddish background
};

/** Utility to pick the icon component:
 * 1) If item.icon is provided and exists in ICON_MAP -> use it.
 * 2) Else pick default by status (success->Trophy, warning/danger->AlertTriangle).
 */
const getIconComponent = (item: InsightItem): React.FC<any> => {
    if (item.icon) {
        const key = item.icon.trim().toLowerCase();
        if (ICON_MAP[key]) return ICON_MAP[key];
    }

    // fallback by status
    if (item.status === "success") return Trophy;
    return AlertTriangle;
};

export const InsightStream: React.FC<{ items?: InsightItem[]; className?: string, searchTerm?: string, selectedLocation?: string }> = ({
    items,
    className = "",
    searchTerm,
    selectedLocation
}) => {
    // memoize the list to avoid unnecessary re-renders if parent re-creates arrays
    const list = useMemo(() => (items && items.length ? items : DEFAULT_ITEMS), [items]);

    return (
        <section
            aria-label="Key insights"
            className={`font-inter w-full bg-white rounded-[16px]  ${className}`}
        >
            <div className="flex flex-col gap-4">
                <div>
                    <h3 className="font-inter text-base font-bold text-sidebar-foreground truncate">Key Insights</h3>
                    <p className="text-sm leading-5 text-placeholder-gray mt-1">
                        This section showcases the performance of our best-selling products and their growth.
                    </p>
                </div>

                <div className="flex flex-col gap-3  w-full" role="list" aria-label="insights list">
                    {list.map((it, idx) => {
                        const tone = it.status ?? "warning";
                        const { bgClass, borderColor, iconColor } = TONE_MAP[tone];
                        const IconComponent = getIconComponent(it);

                        return (
                            <div
                                key={it.id ?? `${idx}`}
                                className={`${bgClass} rounded-lg p-[10.5px] flex items-center gap-[10.5px]`}
                                role="listitem"
                            >
                                <div className="flex items-start" style={{ width: 18, height: 19 }}>
                                    <div
                                        className="flex items-center justify-center"
                                        aria-hidden={false}
                                    >
                                        {/* Lucide components accept stroke-width / size / color props */}
                                        <IconComponent stroke={iconColor} size={14} />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <p className="text-sm leading-5 text-[#364153]">{it.title}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default InsightStream;
