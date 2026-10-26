
import LineChart from "./line-chart";
import HorizontalRectangularChart from "./horizontal-rectangular-chart";
import { DonutChart } from "./pie-chart";
import { PeerComparisonChart } from "./peerComparisonChart";
import { DataDonutCard } from "./datadonutcard";
import { LineChartSalesVsClosing } from "./line-chart-sales-vs-closing";
import { BreakageByShopHorizontal } from "./breakage-by-shop-horizontal";
import { StoreReportVsFieldChart } from "./StoreReportVsFieldChart";
import { BreakageTrendsChart } from "./breakage-trends-chart";
import { MarketSharePieChart } from "./market-share-pie-chart";

// All chart components now support:
// - Dynamic data from API hooks
// - Real-time updates (enableRealtime prop)
// - Export functionality (enableExport prop)
// - Loading states with skeleton components
// - Error handling with retry functionality
// - Search and location filtering
// - Responsive design and accessibility

export {
    LineChart,
    HorizontalRectangularChart,
    DonutChart,
    PeerComparisonChart,
    DataDonutCard,
    LineChartSalesVsClosing,
    BreakageByShopHorizontal,
    StoreReportVsFieldChart,
    BreakageTrendsChart,
    MarketSharePieChart
};
