
import { InfoBadge } from "@/common/info-badge";
import React from "react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

// Props interface for the component
interface LineChartProps {
    apiUrl?: string;
    title?: string;
    data?: Array<{ month: string; opening: number; closing: number }>;
    searchTerm?: string;
    selectedLocation?: string;
}

// Fixed data to match "Last 5 Months" title
const data = [
    { month: "Jan", y2020: 30, y2021: 40 },
    { month: "Feb", y2020: 66, y2021: 73 },
    { month: "Mar", y2020: 82, y2021: 18 },
    { month: "Apr", y2020: 77, y2021: 52 },
    { month: "May", y2020: 50, y2021: 60 },
    { month: "Jun", y2020: 66, y2021: 73 },
];

// Custom legend component to match Figma design
const CustomLegend = (props: any) => {

    return (
        <div className="flex justify-end items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
                <div className="relative">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect y="7" width="16" height="2" fill="#74C3D6" />
                        <circle cx="8" cy="8" r="3.5" fill="white" stroke="#74C3D6" />
                    </svg>

                </div>
                <span className="text-xs text-black/70">2020</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="relative">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect y="7" width="16" height="2" fill="#F97316" />
                        <circle cx="8" cy="8" r="3.5" fill="white" stroke="#F97316" />
                    </svg>

                </div>
                <span className="text-xs text-black/70">2021</span>
            </div>
        </div>
    );
};

export default function LineChart({
    apiUrl,
    title = "Sales Trend (Last 6 Months)",
    data: propData,
    searchTerm,
    selectedLocation
}: LineChartProps) {

    return (
        <div className="relative h-64 md:h-full  bg-white border border-gray-100 shadow-sm rounded-[10px] p-4 flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="font-inter font-semibold text-base leading-[140%] text-black">
                    {title}
                </h2>
                <InfoBadge text="Hover a point to see its exact value." />
            </div>

            {/* Chart Container */}
            <div className="h-full bg-white">
                {/* Custom Legend */}
                <CustomLegend />

                {/* Chart */}
                <ResponsiveContainer width="100%" height='100%' className="pb-6">
                    <AreaChart
                        data={data}

                        margin={{ top: 0, right: 16, bottom: 16, left: -20 }}
                    >
                        {/* Grid - dashed horizontal lines only */}
                        <CartesianGrid
                            stroke="rgba(0, 0, 26, 0.15)"
                            strokeDasharray="3 3"
                            vertical={false}
                            horizontal={true}
                        />

                        {/* X Axis */}
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tick={{
                                fill: "rgba(0, 0, 0, 0.7)",
                                fontSize: 12,
                                fontFamily: "Inter"
                            }}
                        />

                        {/* Y Axis */}
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{
                                fill: "rgba(0, 0, 0, 0.7)",
                                fontSize: 12,
                                fontFamily: "Inter"
                            }}
                            domain={[0, 100]}
                            ticks={[0, 20, 40, 60, 80, 100]}
                        />

                        {/* Gradients */}
                        <defs>
                            <linearGradient id="fill2020" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#F0F9FF" stopOpacity={1} />
                                <stop offset="100%" stopColor="#F0F9FF" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="fill2021" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#FFF7ED" stopOpacity={1} />
                                <stop offset="100%" stopColor="#FFF7ED" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>

                        {/* Tooltip */}
                        <Tooltip
                            cursor={{ stroke: "#94a3b8", strokeDasharray: "3 3" }}
                            contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "6px",
                                fontSize: "12px"
                            }}
                        />

                        {/* Areas - 2020 first (back), 2021 second (front) */}
                        <Area
                            type="monotone"
                            dataKey="y2020"
                            name="2020"
                            stroke="#74C3D6"
                            strokeWidth={2}
                            fill="url(#fill2020)"
                            dot={{
                                r: 4,
                                stroke: "#74C3D6",
                                strokeWidth: 1,
                                fill: "#fff"
                            }}
                            activeDot={{ r: 6 }}
                            style={{ filter: "drop-shadow(0px 3px 3px #8979FF66), drop-shadow(0px 6px 9px #8979FF66), drop-shadow(0px 9px 18px #8979FF66)" }}
                        />
                        <Area
                            type="monotone"
                            dataKey="y2021"
                            name="2021"
                            stroke="#F97316"
                            strokeWidth={2}
                            fill="url(#fill2021)"
                            dot={{
                                r: 4,
                                stroke: "#F97316",
                                strokeWidth: 1,
                                fill: "#fff"
                            }}
                            activeDot={{ r: 6 }}
                            style={{ filter: "drop-shadow(0px 3px 3px #8979FF66), drop-shadow(0px 6px 9px #8979FF66), drop-shadow(0px 9px 18px #8979FF66)" }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
