import { AlertTriangle, CheckCircle2 } from "lucide-react";



export function BreakPerformanceInsights({ insights, searchTerm }: {
  insights?: any[],
  searchTerm?: string,
  selectedLocation?: string
}) {
  if (!insights || insights.length === 0) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 border rounded-md bg-gray-50 border-gray-200">
        <CheckCircle2 className="w-5 h-5" stroke="#10B981" />
        <p className="text-sm text-[#364153]">No critical breakage issues detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {insights.map((insight, index) => {
        const BREAKAGE_TONE_MAP: Record<
          string,
          { IconComponent: React.FC<any>; bgClass: string; borderClass: string; iconColor: string }
        > = {
          high: {
            IconComponent: AlertTriangle,
            bgClass: "bg-[#FEE2E2]", // Light red background
            borderClass: "border-[#EF4444]", // Red border color
            iconColor: "#EF4444", // Red icon color
          },
          medium: {
            IconComponent: AlertTriangle,
            bgClass: "bg-[#FEF3C7]", // Light yellow background
            borderClass: "border-[#F59E0B]", // Amber border color
            iconColor: "#F59E0B", // Amber icon color
          },
          low: {
            IconComponent: CheckCircle2,
            bgClass: "bg-[#D1FAE5]", // Light green background
            borderClass: "border-[#10B981]", // Emerald border color
            iconColor: "#10B981", // Emerald icon color
          },
          default: {
            IconComponent: AlertTriangle,
            bgClass: "bg-gray-100",
            borderClass: "border-[#9CA3AF]",
            iconColor: "#9CA3AF",
          },
        };

        const { IconComponent, bgClass, borderClass, iconColor } =
          BREAKAGE_TONE_MAP[insight.priority] || BREAKAGE_TONE_MAP.default;

        return (
          <div key={index} className={`flex items-start gap-3 px-3 py-2 border rounded-md ${bgClass} ${borderClass}`}>
            <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" stroke={iconColor} />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#364153] mb-1">{insight.action}</p>
              <p className="text-xs text-[#6B7280]">{insight.expectedImpact} • {insight.timeline}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
