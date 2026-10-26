import { MarketSharePieChart } from "@/components/chart";

export function ChartMarketShare({ buckets }: { buckets: any[] }) {
  if (!Array.isArray(buckets) || buckets.length === 0) return null;
  return (
    <MarketSharePieChart
      data={buckets}
      title="Shop Market Share Buckets"
      subtitle="Distribution of shops across market share buckets"
      enableExport={true}
      className="my-8"
    />
  );
}
