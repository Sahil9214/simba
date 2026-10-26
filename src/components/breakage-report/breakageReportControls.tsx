import { memo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export const BreakageReportControls = memo(({ selectedTimeRange, setSelectedTimeRange, handleExport, exportMutation }: {
  selectedTimeRange: '7d' | '30d';
  setSelectedTimeRange: (value: '7d' | '30d') => void;
  handleExport: (format: 'csv' | 'json' | 'excel', dataType: 'statistics' | 'by-shop' | 'by-sku' | 'all') => void;
  exportMutation: any;
}) => (
  <section className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-4 bg-white p-4 rounded-lg ">
    <div className="flex flex-col sm:flex-row justify-end gap-1">
      <Button
        variant="outline"
        size="lg"
        onClick={() => handleExport('csv', 'all')}
        disabled={exportMutation.isPending}
        className="w-full sm:w-auto bg-primary text-white border-container-card hover:bg-primary/90 hover:text-white"
      >
        <Download className="h-4 w-4 mr-2" />
        Export Report
      </Button>
    </div>
  </section>
));
