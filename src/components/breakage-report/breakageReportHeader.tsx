import { RefreshCw, Search } from "lucide-react";
import { Input } from "../ui/input";
import { memo } from "react";
import { BreakageReportControls } from "./breakageReportControls";
import { ChartHeadings } from "@/common/chartHeadings";

export const BreakageReportHeader = memo(({ searchShop, setSearchShop, isSearching, selectedTimeRange, setSelectedTimeRange, handleExport, exportMutation }: {
  searchShop: string;
  setSearchShop: (value: string) => void;
  isSearching: boolean;
  selectedTimeRange: '7d' | '30d';
  setSelectedTimeRange: (value: '7d' | '30d') => void;
  handleExport: (format: 'csv' | 'json' | 'excel', dataType: 'statistics' | 'by-shop' | 'by-sku' | 'all') => void;
  exportMutation: any;
}) => (
  <section className="flex flex-col lg:flex-row justify-between items-start sm:items-center gap-1">
    <div>
      <ChartHeadings heading="Breakage Report – By Shop" description="Track product breakages across shops and SKUs. Use this to prioritize claims, identify hotspots, and reduce losses." />
    </div>
    <div className="flex flex-col lg:flex-row justify-between items-start sm:items-center gap-1">
      <div className="relative w-full lg:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-placeholder-gray" />
        <Input
          placeholder="Search by shop"
          value={searchShop}
          onChange={(e) => setSearchShop(e.target.value)}
          className="w-full h-10 pl-10 pr-3 border border-[#E5E5E5] rounded-lg text-sm text-placeholder-gray focus:ring-0 focus:border-[#E5E5E5]" />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" />
          </div>
        )}
      </div>
      <BreakageReportControls
        selectedTimeRange={selectedTimeRange}
        setSelectedTimeRange={setSelectedTimeRange}
        handleExport={handleExport}
        exportMutation={exportMutation}
      />
    </div>
  </section>
));
BreakageReportHeader.displayName = 'BreakageReportHeader';
