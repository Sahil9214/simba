import { memo } from "react";
import { BreakPerformanceInsights } from "./breakagePerformanceInsights";

export const BreakageInsightsSection = memo(({ data, debouncedSearch }: {
  data: any;
  debouncedSearch: string;
}) => (
  <section>
    <BreakPerformanceInsights insights={data?.analysis?.recommendations?.slice(0, 3)} searchTerm={debouncedSearch} />
  </section>
));
