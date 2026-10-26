export type DataRow = { key: string; label: string; value: number; meta?: any };

export type ChartCardControls = {
    sort?: boolean;
    filter?: boolean;
    search?: boolean;
    pageSize?: number;
};

export type LegendConfig = {
    position?: "right" | "bottom";
    itemRenderer?: (item: DataRow) => React.ReactNode;
};

export type ChartCardProps = {
    title: string;
    subtitle?: string;
    apiUrl?: string;
    fetcher?: (url: string) => Promise<any>;
    data?: DataRow[]; // controlled data (if provided, it bypasses api)
    transform?: (raw: any) => DataRow[]; // map API -> chart shape
    colors?: string[];
    controls?: ChartCardControls;
    legend?: LegendConfig;
    initialSort?: { key: keyof DataRow | string; dir: "asc" | "desc" };
    serverSide?: boolean; // whether sort/filter/search are server-driven
    loadingSkeleton?: React.ReactNode;
    errorRenderer?: (err: any) => React.ReactNode;
    onSelect?: (row: DataRow) => void;
    className?: string;
    ariaLabel?: string;
    // optional: filter options shape (for UI rendering)
    filterOptions?: { id: string; label: string; values?: string[] }[];
    listShownButton?: boolean;
    searchTerm?:string;
    selectedLocation?:string;
};
