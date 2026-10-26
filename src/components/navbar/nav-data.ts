import {
    LayoutDashboard,
    Radio, Users,
    FolderInput, Navigation,
    TrendingUp, Package,
    TriangleAlert, type LucideIcon, User,
    IdCard
} from "lucide-react"

export type NavItem = {
    label: string
    href: string
    icon: LucideIcon,
    children?: NavItem[]
}

export const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Daily Reports", href: "/dashboard/daily-reports", icon: Radio },
    { label: "Upload Centre", href: "/dashboard/upload-centre", icon: FolderInput },
    { label: "Sales Analytics", href: "/dashboard/sales-analytics", icon: TrendingUp },
    // { label: "Stock Analytics", href: "/dashboard/stock-analytics", icon: Package },
    // { label: "Risk & Alerts", href: "/dashboard/risk-alerts", icon: TriangleAlert },
    // { label: "Report History", href: "/dashboard/report-history", icon: History },
    {
        label: "User Management",
        href: "/dashboard/user-management",
        icon: Users,
        children: [
            { label: "Sales Employee data", href: "/dashboard/user-management/sales-employee-data", icon: User },
            { label: "Market Share", href: "/dashboard/user-management/market-share", icon: Navigation },
            { label: "User Mapping ", href: "/dashboard/user-management/user-maping", icon: Navigation },
            { label: "Inventory ", href: "/dashboard/user-management/inventory", icon: Navigation },
            { label: "Add New Shops", href: "/dashboard/user-management/addNewShop", icon: Navigation },
            { label: "Add New Skus", href: "/dashboard/user-management/addNewSkus", icon: Navigation },

        ]
    },
    {
        label: "Account",
        href: "/dashboard/user-management/user-profile",
        icon: IdCard,
    }
]
//hello
