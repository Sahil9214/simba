
export type ProductData = {
    name: string;
    value: number;      // 0..maxValue
    maxValue: number;   // usually 100
    baseColor: string;  // pale cylinder color (capacity)
    filledColor: string;// dark liquid color (fill + meniscus)
};
export type StoreReportVsFieldChartProps = {
    color1?: string;
    color2?: string;
    heading?: string;
    description?: string;
    feature?: boolean;
    imageNode1?: string;
    imageNode2?: string;
    legend1?: string;
    legend2?: string;
}
export interface SalesReportTableProps {
    data: {
        segment: string;
        size: string;
        sales: number;
        closing: number;
        avail: number;
        breakage: number;
        demand: number;
    }[];
}

export interface Inventory {
    green: number;
    yellow: number;
    red: number;
}

export interface Shop {
    id: any;
    name: any;
    slug: any;
    address: any;
    time: any;
    inventory: any;
}
