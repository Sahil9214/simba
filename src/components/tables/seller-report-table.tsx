import React from "react";
import { SalesReportTableProps } from "@/lib/types/legacy";

export const SalesReportTable = ({ data }: SalesReportTableProps) => {
    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto relative">
                    <table className="w-full min-w-[680px] table-auto">
                        <thead className="bg-white border-b border-gray-200">
                            <tr>
                                <th
                                    className={
                                        "sticky left-0 top-0 z-30 bg-white border-r border-gray-200 px-6 py-3 text-left text-sm font-medium text-gray-500 min-w-[10px] shadow-sm"
                                    }
                                >
                                    Segment
                                </th>
                                <th className="p-4 text-left text-sm font-medium text-gray-500 min-w-[85px]">Size</th>
                                <th className="p-4 text-left text-sm font-medium text-gray-500 min-w-[85px]">Sales</th>
                                <th className="p-4 text-left text-sm font-medium text-gray-500 min-w-[85px]">Closing</th>
                                <th className="p-4 text-left text-sm font-medium text-gray-500 min-w-[85px]">Avail.</th>
                                <th className="p-4 text-left text-sm font-medium text-gray-500 min-w-[85px]">Breakage</th>
                                <th className="p-4 text-left text-sm font-medium text-gray-500 min-w-[85px]">Demand</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td
                                        className={
                                            "sticky left-0 z-20 bg-white border-r border-gray-200 px-3 py-4 text-sm font-medium text-red-500 min-w-[100px]  shadow-sm"
                                        }
                                    >
                                        {row.segment}
                                    </td>
                                    <td className="font-inter p-4 text-sm text-gray-900 min-w-[85px] whitespace-nowrap">{row.size}</td>
                                    <td className="font-inter p-4 text-sm text-gray-900 min-w-[85px] whitespace-nowrap">{row.sales}</td>
                                    <td className="font-inter p-4 text-sm text-gray-900 min-w-[85px] whitespace-nowrap">{row.closing}</td>
                                    <td className="font-inter p-4 text-sm text-gray-900 min-w-[85px] whitespace-nowrap">{row.avail}</td>
                                    <td className="font-inter p-4 text-sm text-gray-900 min-w-[85px] whitespace-nowrap">{row.breakage}</td>
                                    <td className="font-inter p-4 text-sm text-gray-900 text-left min-w-[85px] whitespace-nowrap">{row.demand}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-4 py-3 bg-white border-t border-gray-200">
                    <p className="font-inter text-sm text-placeholder-gray text-left">Sales Report • 8th Sep, 25 • 9:30 AM</p>
                </div>
            </div>
        </div>
    );
};
