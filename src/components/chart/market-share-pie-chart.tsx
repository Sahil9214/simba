import React, { useMemo, useState, useRef, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Download } from "lucide-react";
import { exportToCSV, exportToExcel, exportToJSON } from "./chart-utils";
import { topPerformingProductsColors } from "@/lib/colors";
import { Button } from "@/components/ui/button";

export interface MarketShareBucket {
  label: string;
  min: number;
  max: number | null;
  shopCount: number;
  shopPercentage: number;
}

interface MarketSharePieChartProps {
  data: MarketShareBucket[];
  title?: string;
  subtitle?: string;
  colors?: string[];
  enableExport?: boolean;
  className?: string;
}

export const MarketSharePieChart: React.FC<MarketSharePieChartProps> = ({
  data = [],
  title = "Shop Market Share Distribution",
  subtitle = "Proportion of shops by market share buckets",
  colors = topPerformingProductsColors,
  enableExport = true,
  className = "",
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);

  // Memoize enriched data with keys for legend and charts
  const chartData = useMemo(() =>
    data.map((bucket, idx) => ({
      ...bucket,
      key: bucket.label.replace(/\s+/g, '-').toLowerCase(),
      value: bucket.shopCount,
      percentage: bucket.shopPercentage,
      idx,
    })),
    [data]
  );

  const totalShops = useMemo(() => chartData.reduce((a, b) => a + b.shopCount, 0), [chartData]);

  // Center display: show hovered or total
  const centerStat = useMemo(() => {
    if (hoveredIdx != null && chartData[hoveredIdx]) {
      return {
        count: chartData[hoveredIdx].shopCount,
        label: chartData[hoveredIdx].label,
        percentage: chartData[hoveredIdx].shopPercentage,
      };
    }
    return {
      count: totalShops,
      label: 'Total Shops',
      percentage: 100,
    };
  }, [hoveredIdx, chartData, totalShops]);

  // Tooltip for Pie slice


  // Export handlers
  const handleExport = (format: 'csv' | 'excel' | 'json') => {
    // Prepare tabular data
    const exportRows = chartData.map(row => ({
      Label: row.label,
      "Min %": row.min,
      "Max %": row.max !== null ? row.max : '∞',
      "Shop Count": row.shopCount,
      "Shop %": row.shopPercentage
    }));
    const opts = { filename: 'market-share-distribution', title };
    if (format === 'csv') exportToCSV(exportRows, opts);
    if (format === 'excel') exportToExcel(exportRows, opts);
    if (format === 'json') exportToJSON(exportRows, opts);
  };

  return (
    <section className="flex w-full  flex-col  lg:flex-row justify-between items-center gap-4  ">
      <div className={`w-full lg:w-1/2 rounded-xl font-inter shadow-lg bg-white h-full lg:h-[400px] p-4  ${className}`}>
        <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="font-inter text-lg font-bold">{title}</div>
            {subtitle && (
              <div className="mt-2 text-sm text-placeholder-gray max-w-xs md:max-w-md lg:max-w-lg">{subtitle}</div>
            )}
          </div>
          {/* {enableExport && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleExport('excel')}
                // Assuming there isn't a loading/disabling state here for now
                className="w-full sm:w-auto bg-primary text-white border-container-card hover:bg-primary/90 hover:text-white cursor-pointer"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          )} */}
        </div>
        <div className="mt-6 py-2 flex flex-col lg:flex-row gap-6 items-start">
          {/* Pie Chart */}
          <div ref={chartRef} className="w-full h-72 lg:h-60 mt-3 flex items-center justify-center relative" role="img" aria-label={`${title} chart`}>
            {(chartData.length === 0 || totalShops === 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ key: 'empty', label: 'No Data', shopCount: 1 }]}
                    dataKey="shopCount"
                    nameKey="label"
                    innerRadius="60%"
                    outerRadius="90%"
                    startAngle={90}
                    endAngle={-270}
                    animationBegin={0}
                    animationDuration={300}
                    animationEasing="ease-out"
                  >
                    <Cell
                      fill="#F3F4F6"
                      stroke="#E5E7EB"
                      strokeWidth={2}
                    />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="shopCount"
                    nameKey="label"
                    innerRadius="60%"
                    outerRadius="90%"
                    startAngle={90}
                    endAngle={-270}
                    onMouseEnter={(_, idx: number) => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    animationBegin={0}
                    animationDuration={300}
                    animationEasing="ease-out"
                  >
                    {chartData.map((row, idx) => (
                      <Cell
                        key={row.key}
                        fill={colors[idx % colors.length]}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                        style={{
                          cursor: 'pointer',
                          filter: hoveredIdx === idx ? `drop-shadow(0 4px 8px ${colors[idx % colors.length]}40)` : 'none',
                          transition: 'all 0.2s ease-in-out',
                        }}
                      />
                    ))}
                  </Pie>
                  {/* <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: "none", zIndex: 10000, pointerEvents: "none" }} isAnimationActive={false} allowEscapeViewBox={{ x: true, y: true }} cursor={{ fill: 'transparent' }} /> */}
                </PieChart>
              </ResponsiveContainer>
            )}
            {/* Center Stat */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                {(chartData.length === 0 || totalShops === 0) ? (
                  <>
                    <div className="text-xl font-bold text-gray-400">0</div>
                    <div className="text-xs text-gray-400 mt-1 max-w-[120px] truncate">No data</div>
                  </>
                ) : (
                  <>
                    <div className="text-xl font-bold text-slate-900">{centerStat.count}</div>
                    <div className="text-xs text-placeholder-gray mt-1 max-w-[120px] truncate">{centerStat.label}</div>
                    {hoveredIdx != null && (
                      <div className="text-xs text-placeholder-gray mt-1">{centerStat.percentage?.toFixed(1)}%</div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Legend */}
          <div ref={legendRef} className="w-full lg:w-[280px] overflow-y-auto overflow-x-hidden scrollbar-custom" style={{ maxHeight: '280px' }}>
            {chartData.map((row, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <div
                  key={row.key}
                  className={`font-inter flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200 cursor-pointer ${isHovered ? 'bg-gray-50 shadow-sm translate-x-1' : 'hover:bg-gray-25'} `}
                  style={{ minHeight: '56px' }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: colors[idx % colors.length], transform: isHovered ? 'scale(1.2)' : 'scale(1)', boxShadow: isHovered ? `0 0 12px ${colors[idx % colors.length]}60` : 'none' }} />
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-semibold truncate ${isHovered ? 'text-gray-900' : 'text-gray-700'}`}>{row.label}</div>
                    <div className={`text-xs truncate ${isHovered ? 'text-gray-600' : 'text-gray-500'}`}>{row.shopCount} shops &nbsp;|&nbsp; {row.shopPercentage.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="w-full rounded-xl  shadow-lg lg:h-[400px] h-full bg-white p-4 lg:w-1/2 lg:mt-0">
        {/* Data Overview List */}
        <div className="font-inter text-base font-semibold mb-3">Market Share Buckets Overview</div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-xs bg-gray-25 font-medium ">
                <th className="text-left px-2 py-1 rounded-l-lg">Label</th>
                <th className="text-left px-2 py-1">Min %</th>
                <th className="text-left px-2 py-1">Max %</th>
                <th className="text-left px-2 py-1">Shop Count</th>
                <th className="text-left px-2 py-1 rounded-r-lg">Shop %</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row, idx) => (
                <tr key={row.key} className={`text-xs lg:text-sm font-normal ${hoveredIdx === idx ? 'bg-gray-50 shadow-inner' : ''}`}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{ transition: 'background 0.2s', cursor: 'pointer' }}
                >
                  <td className="px-2 py-2 rounded-l-lg whitespace-nowrap" style={{ color: colors[idx % colors.length], fontWeight: 600 }}>{row.label}</td>
                  <td className="px-2 py-2">{row.min}</td>
                  <td className="px-2 py-2">{row.max !== null ? row.max : '∞'}</td>
                  <td className="px-2 py-2">{row.shopCount}</td>
                  <td className="px-2 py-2 rounded-r-lg">{row.shopPercentage.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </section>
  );
};
