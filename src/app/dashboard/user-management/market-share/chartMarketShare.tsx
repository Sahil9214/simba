import { MarketSharePieChart, MarketShareBucket } from "@/components/chart";

export function ChartMarketShare({ buckets }: { buckets: any[] }) {
  if (!Array.isArray(buckets) || buckets.length === 0) return null;

  // Transform dummy data shape { name, count, percentage } → MarketShareBucket { label, min, max, shopCount, shopPercentage }
  const normalizedBuckets: MarketShareBucket[] = buckets.map((b, idx) => ({
    label: b.label ?? b.name ?? `Bucket ${idx + 1}`,
    min: b.min ?? 0,
    max: b.max ?? null,
    shopCount: b.shopCount ?? b.count ?? b.value ?? 0,
    shopPercentage: b.shopPercentage ?? b.percentage ?? 0,
  }));

  return (
    <MarketSharePieChart
      data={normalizedBuckets}
      title="Shop Market Share Buckets"
      subtitle="Distribution of shops across market share buckets"
      enableExport={true}
      className="my-8"
    />
  );
}
