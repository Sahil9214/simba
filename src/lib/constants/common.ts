import { FileRow } from "@/lib/types/legacy";

// Dashboard constants
export const DASHBOARD_HEADING = 'Simba Dashboard';
export const DASHBOARD_DESCRIPTION = 'This dashboard refreshs automatically with the latest sales and stock data from your uploaded reports';

export const OVERALL_SALES_CARD = "Total Sales Overall";
export const TOP_SKU_PRODUCT_CARD = "Top SKU / Product";
export const TOP_SELLER_SHOP_CARD = "Top Seller (Shop)";
export const ACTIVE_RESELLERS_CARD = "Active Resellers";

export const PEER_COMPARISON_HEADING = "Peer Comparison";
export const PEER_COMPARISON_DESCRIPTION = "Simba vs Peer sales by top 6 shop (Vodka)";

export const OVERALL_SALES_SPLIT_HEADING = "Overall Sales Split";
export const OVERALL_SALES_SPLIT_DESCRIPTION = "Simba vs Peer sales (all shops)";

export const REPORTING_GAPS_HEADING = "Reporting Gaps";
export const REPORTING_GAPS_DESCRIPTION = "Highlighting where reported numbers differ most from actual sales";

export const REPORT_VS_FIELD_HEADING = "Report vs Field Data (Store-wise)";
export const REPORT_VS_FIELD_DESCRIPTION = "Compare weekly government report with salesperson's field data to spot discrepancies by store";

export const TOP_PERFORMING_PRODUCTS = "Top Performing Products";
export const TOP_PERFORMING_PRODUCTS_DESCRIPTION = "This section showcases the performance of our best-selling products and their growth.";

export const TOP_RESELLERS = "Top Resellers (Shops)";
export const TOP_RESELLERS_DESCRIPTION = "This section highlights the performance of Simba's leading reseller shops based on units sold and their contribution to overall growth.";

export const SALES_VS_CLOSING_STOCK_HEADING = "Sales vs Closing Stock (Shop-wise)";
export const SALES_VS_CLOSING_STOCK_DESCRIPTION = "Compare weekly government report with salesperson's field data to spot discrepancies by store";

export const SALES_VS_CLOSING_STOCK_TREND = "Sales vs Closing Stock Trend (5-Months)";
export const SALES_VS_CLOSING_STOCK_TREND_DESCRIPTION = "Highlighting where reported numbers differ most from actual sales";

export const SALES_VS_CLOSING_STOCK_HEATMAP = "Shop-wise Closing Stock Heatmap";
export const SALES_VS_CLOSING_STOCK_HEATMAP_DESCRIPTION = "This dashboard visualizes shop-level closing stock by brand. Color codes help quickly identify fast-moving, medium, and stuck stock to take timely action.";

export const DEMAND_BY_SKU_HEADING = "Demand by SKU";
export const DEMAND_BY_SKU_DESCRIPTION = "Visualize demand concentration across top SKUs. Helps identify high-demand products that drive fulfillment planning and inventory allocation.";

export const SALES_BY_PACK_SIZE_HEADING = "Sales by Pack Size";
export const SALES_BY_PACK_SIZE_DESCRIPTION = "Breakdown of Simba sales by package size. Use the metric switch to view distribution by units or revenue.";

export const BREAKAGE_REPORT_HEADING = "Breakage Report – By Shop & SKU";
export const BREAKAGE_REPORT_DESCRIPTION = "Track product breakages across shops and SKUs. Use this to prioritize claims, identify hotspots, and reduce losses.";

export const BREAKAGE_BY_SHOP = "Shows number of broken units reported per shop. Use this chart to quickly spot hotspots where handling or storage issues may be recurring.";
export const BREAKAGE_BY_SKU = "Displays SKU-wise contribution to total breakage. Useful for identifying fragile SKUs or packaging problems that need supplier discussions.";

export const KEY_INSIGHTS = 'Key Insights';
export const KEY_INSIGHTS_DESCRIPTION = "This section showcases the performance of our best-selling products and their growth.";

export const DEMAND_ANALYTICS_TABLE_HEADING = "Demand Analytics - Detailed View ";

export const LIVE_REPORT_HEADING = 'Daily Reports';
export const LIVE_REPORT_DESCRIPTION = 'View real-time sales and stock data from your reports';

export const UPLOAD_CENTER_HEADING = 'Upload Center';
export const UPLOAD_CENTER_DESCRIPTION = 'Upload goverment Excel/PDF/Word reports for processing';

export const CLICK_TO_UPLOAD = 'Click to upload or Drag & Drop';
export const SUPPORT_FORMAT = 'Supported formats: Excel (.xlsx, .xls), PDF (.pdf), Word (.doc, .docx)';

export const EXPORT_BUTTON = 'Export';
export const UPLOAD_REPORTS = 'Upload reports';

export const FILE_TYPE = 'File Type';
export const BY_STATUS = 'By Status';
export const DATE_RANGE = 'Date Range';

export const TOP_PRODUCTS = 'Top 5 Products';
export const SALES_TREND = 'Sales Trend (Last 5 Months)';

export const TOP_PERFORMING_SELLERS = 'Top Performing Sellers';

export const SHOWING_PAGINATION = 'Showing 1 to 5 files';
export const PREVIOUS_BUTTON = 'Previous';
export const NEXT_BUTTON = 'Next';

export const SALES_ANALYTICS_HEADING = 'Sales Analytics';
export const SALES_ANALYTICS_DESCRIPTION = 'This dashboard refreshes automatically with the latest sales and stock data from your uploaded reports';

export const RISK_ALERTS_HEADING = 'Risk & Alerts';
export const RISK_ALERTS_DESCRIPTION = 'This dashboard refreshes automatically with the latest risk and alerts data from your uploaded reports';

export const STOCKWISE_HEAT_MAP_HEADING = 'Shop-wise Closing Stock Heatmap';

// Header dropdown options
export const LOCATION_OPTIONS = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];
export const SHOP_TYPE_OPTIONS = ['Shop Wise', 'Area Wise', 'Region Wise', 'Zone Wise'];
export const SKU_OPTIONS = ['All SKU', 'SKU A', 'SKU B', 'SKU C', 'SKU D'];
export const SALESPERSON_OPTIONS = ['All Salesperson', 'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'];

// Table filter options
export const PRODUCT_FILTER_OPTIONS = [
  { value: "all", label: "All Products" },
  { value: "zigzag", label: "ZigZag Vodka Classic" },
  { value: "absolut", label: "Absolut Vodka" },
  { value: "grey-goose", label: "Grey Goose" },
  { value: "smirnoff", label: "Smirnoff" },
];

export const SIZE_FILTER_OPTIONS = [
  { value: "all", label: "By Size" },
  { value: "750ml", label: "750 ml" },
  { value: "375ml", label: "375 ml" },
  { value: "1L", label: "1 L" },
  { value: "500ml", label: "500 ml" },
];

export const UPLOADED_BY_FILTER_OPTIONS = [
  { value: "all", label: "Uploaded By" },
  { value: "darrell", label: "Darrell Steward" },
  { value: "floyd", label: "Floyd Miles" },
  { value: "eleanor", label: "Eleanor Pena" },
  { value: "courtney", label: "Courtney Henry" },
  { value: "ronald", label: "Ronald Richards" },
];

export const SHOP_FILTER_OPTIONS = [
  { value: "all", label: "All Shops" },
  { value: "block-b", label: "Block B (CP)" },
  { value: "connaught", label: "Connaught Place" },
  { value: "city-center", label: "City Center" },
  { value: "north-district", label: "North District" },
  { value: "downtown", label: "Downtown" },
];

export const SALESPERSON_FILTER_OPTIONS = [
  { value: "all", label: "All Salesperson" },
  { value: "aarav", label: "Aarav Mehta" },
  { value: "priya", label: "Priya Sharma" },
  { value: "rohan", label: "Rohan Gupta" },
  { value: "neha", label: "Neha Desai" },
  { value: "vikram", label: "Vikram Singh" },
];

export const DATE_FILTER_OPTIONS = [
  { value: "all", label: "All Dates" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last-7-days", label: "Last 7 Days" },
  { value: "last-30-days", label: "Last 30 Days" },
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
];

// Role options for user management
export const ROLE_OPTIONS = [
  { value: "sales-executive", label: "Sales Executive" },
  { value: "senior-sales-executive", label: "Senior Sales Executive" },
  { value: "marketing-manager", label: "Marketing Manager" },
  { value: "product-manager", label: "Product Manager" },
  { value: "regional-manager", label: "Regional Manager" },
  { value: "account-manager", label: "Account Manager" },
];

// Form labels and placeholders
export const FORM_LABELS = {
  EMAIL: "Email address",
  PASSWORD: "Password",
  FULL_NAME: "Full Name",
  ROLE: "Select Role",
  PHONE_NUMBER: "Phone Number",
  CONFIRM_PASSWORD: "Confirm Password",
  NEW_PASSWORD: "New Password",
  OLD_PASSWORD: "Old Password",
};

export const FORM_PLACEHOLDERS = {
  EMAIL: "Simba@domain.com",
  PASSWORD: "Enter your password",
  FULL_NAME: "Enter full name",
  EMAIL_ADDRESS: "Enter email address",
  PHONE_NUMBER: "+91 ",
  CONFIRM_PASSWORD: "Confirm your password",
  NEW_PASSWORD: "Enter new password",
  OLD_PASSWORD: "Enter old password",
  SEARCH: "Search...",
};

// Button text and actions
export const BUTTON_TEXT = {
  LOGIN: "Login",
  LOGGING_IN: "Logging in...",
  LOGOUT: "Logout",
  CANCEL: "Cancel",
  SAVE: "Save",
  SEND_INVITE: "Send Invite",
  CLOSE: "Close",
  EXPORT_REPORTS: "Export Reports",
  UPLOAD_REPORTS: "Upload Reports",
  VIEW: "View",
  DOWNLOAD: "Download",
  SHARE: "Share",
  EDIT: "Edit",
  DELETE: "Delete",
  ADD_NEW: "Add New",
  PREVIOUS: "Previous",
  NEXT: "Next",
  RESET: "Reset",
  SUBMIT: "Submit",
  SAVE_AND_LOGIN: "Save & Login",
};

// Validation messages
export const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: "Use the email linked to your Simba account.",
  EMAIL_INVALID: "Use the email linked to your Simba account.",
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_MIN_LENGTH: "Your password must be at least 6 characters",
  PASSWORD_MISMATCH: "Passwords do not match",
  FULL_NAME_REQUIRED: "Full name is required",
  ROLE_REQUIRED: "Please select a role",
  EMAIL_INVALID_FORMAT: "Please enter a valid email address",
  PHONE_REQUIRED: "Phone number is required",
  PHONE_INVALID: "Please enter a valid phone number",
};

// Status messages and notifications
export const STATUS_MESSAGES = {
  INVITE_SENT_SUCCESS: "Invite Sent Successfully",
  INVITE_SENT_DESCRIPTION: "has been invited to join Simba. An email was sent to",
  INVITE_SENT_FOOTER: "with a link to set up their account.",
  NEED_HELP: "Need help?",
  CONTACT_SUPPORT: "Contact support",
  FORGOT_PASSWORD: "Forgot your password?",
  PROCESSING: "Processing...",
  LOADING: "Loading...",
  SUCCESS: "Success",
  ERROR: "Error",
  WARNING: "Warning",
  INFO: "Information",
};

// Modal titles and content
export const MODAL_TITLES = {
  ADD_NEW_SALESPERSON: "Add New Salesperson",
  INVITE_SENT_SUCCESS: "Invite Sent Successfully",
  CONFIRM_DELETE: "Confirm Delete",
  EDIT_USER: "Edit User",
  VIEW_DETAILS: "View Details",
};

// Table headers and labels
export const TABLE_HEADERS = {
  NAME: "Name",
  TYPE: "Type",
  COUNTRY: "Country",
  ROLE: "Role",
  DATE: "Date",
  STATUS: "Status",
  ACTIONS: "Actions",
  PRODUCT: "Product",
  SIZE: "Size",
  DEMAND: "Demand",
  UPLOADED_BY: "Uploaded By",
  SHOP: "Shop",
  SALESPERSON: "Salesperson",
  SALES: "Sales",
  STOCK: "Stock",
  BREAKAGE: "Breakage",
  PERFORMANCE: "Performance",
};

// Navigation menu labels
export const NAV_LABELS = {
  DASHBOARD: "Dashboard",
  DAILY_REPORTS: "Daily Reports",
  UPLOAD_CENTRE: "Upload Centre",
  SALES_ANALYTICS: "Sales Analytics",
  STOCK_ANALYTICS: "Stock Analytics",
  RISK_ALERTS: "Risk & Alerts",
  REPORT_HISTORY: "Report History",
  USER_MANAGEMENT: "User Management",
};


// File upload text
export const FILE_UPLOAD_TEXT = {
  CLICK_TO_UPLOAD: "Click to upload or Drag & Drop",
  SUPPORTED_FORMATS: "Supported formats: Excel (.xlsx, .xls), PDF (.pdf), Word (.doc, .docx)",
  UPLOAD_SUCCESS: "File uploaded successfully",
  UPLOAD_ERROR: "Failed to upload file",
  FILE_TOO_LARGE: "File size too large",
  INVALID_FORMAT: "Invalid file format",
};

export const SEVERITY_COLORS = {
  CRITICAL: { border: "#FEE2E2", text: "#EF4444", badgeBg: "#EF4444" },
  MODERATE: { border: "#FFEDD5", text: "#EA580C", badgeBg: "#F97316" },
  LOW: { border: "#FEF9C3", text: "#CA8A04", badgeBg: "#EAB308" },
  SUCCESS: { border: "#D1FAE5", text: "#10B981", badgeBg: "#10B981" },
  WARNING: { border: "#FEF3C7", text: "#F59E0B", badgeBg: "#F59E0B" },
  DANGER: { border: "#FEE2E2", text: "#EF4444", badgeBg: "#EF4444" },
};

// Default values
export const DEFAULT_VALUES = {
  LOCATION: "Delhi",
  SHOP_TYPE: "Shop Wise",
  SKU: "All SKU",
  SALESPERSON: "All Salesperson",
  PHONE_PREFIX: "+91 ",
  ITEMS_PER_PAGE: 5,
  CURRENT_PAGE: 1,
};

// Auth screens
export const AUTH_CTA = 'Your Data, Secure & Actionable';
export const AUTH_DESCRIPTION = 'Upload Daily Or Weekly Sales Data From Shops And Instantly See Clean Dashboards, Sales Trends, And Closing Stock';

export const AUTH_HEADING = 'Generate Quick Reports'
export const AUTH_DESCRIPTION_2 = 'Easily Create Quick Reports By Uploading Your Daily Or Weekly Sales Data From Your Stores. Get Instant Access To Clear Dashboards And Insightful Sales Trends!'

export const SAVE_AND_LOGIN = 'Save & Login';

export const FILES_CONSTANT: FileRow[] = [
  {
    id: "1",
    name: "Monthly Report",
    type: "Excel File",
    country: "US",
    role: "Manager",
    date: "15/01/2025",
    status: "Processed",
  },
  {
    id: "2",
    name: "Project Overview",
    type: "Word Document",
    country: "UK",
    role: "Designer",
    date: "01/02/2025",
    status: "Processed",
  },
  {
    id: "3",
    name: "Budget Proposal",
    type: "PDF File",
    country: "AU",
    role: "Finance",
    date: "10/02/2025",
    status: "Processed",
  },
  {
    id: "4",
    name: "User Feedback",
    type: "Excel File",
    country: "CA",
    role: "Support",
    date: "12/02/2025",
    status: "cancelled",
  },
  {
    id: "5",
    name: "Design Mockups",
    type: "Word Document",
    country: "IN",
    role: "UX Designer",
    date: "20/02/2025",
    status: "Processing",
  },

  // extra to demonstrate pagination (5 per page)
  {
    id: "6",
    name: "QA Checklist",
    type: "Excel File",
    country: "US",
    role: "QA Lead",
    date: "22/02/2025",
    status: "Processed",
  },
  {
    id: "7",
    name: "Client Brief",
    type: "Word Document",
    country: "UK",
    role: "Account Manager",
    date: "25/02/2025",
    status: "Processed",
  },
  {
    id: "8",
    name: "SOW Document",
    type: "PDF File",
    country: "US",
    role: "Operations",
    date: "28/02/2025",
    status: "Processed",
  },
  {
    id: "9",
    name: "Sprint Plan",
    type: "Excel File",
    country: "DE",
    role: "Scrum Master",
    date: "02/03/2025",
    status: "Processing",
  },
  {
    id: "10",
    name: "User Research",
    type: "Word Document",
    country: "FR",
    role: "Researcher",
    date: "04/03/2025",
    status: "cancelled",
  },
  {
    id: "11",
    name: "Security Audit",
    type: "PDF File",
    country: "US",
    role: "Security",
    date: "06/03/2025",
    status: "Processed",
  },
  {
    id: "12",
    name: "Release Notes",
    type: "Word Document",
    country: "US",
    role: "Engineer",
    date: "08/03/2025",
    status: "Processed",
  },
  {
    id: "13",
    name: "Sales Report",
    type: "Excel File",
    country: "BR",
    role: "Sales",
    date: "10/03/2025",
    status: "Processed",
  },
  {
    id: "14",
    name: "Architecture Diagram",
    type: "PDF File",
    country: "US",
    role: "Architect",
    date: "12/03/2025",
    status: "Processed",
  },
  {
    id: "15",
    name: "Copy Deck",
    type: "Word Document",
    country: "CA",
    role: "Writer",
    date: "14/03/2025",
    status: "Processed",
  },
]

export const INPUT_BASE =
  "w-full h-11 box-border rounded-lg px-3 mt-2 text-sm font-normal placeholder:text-placeholder-gray transition outline-none focus:bg-white";

export const INPUT_ERROR =
  "bg-white border border-error shadow-[0_0_0_3px_rgba(220,38,38,0.2)] focus:border-error focus:shadow-[0_0_0_3px_rgba(220,38,38,0.35)] focus:ring-0";

export const INPUT_NORMAL =
  "bg-neutral-100 border border-gray-300 focus:border-gray-400 focus:ring-0 focus:shadow-[0_0_0_3px_rgba(156,163,175,0.25)]";


// Dashboard dummy data
/* Dummy data for charts */
export const DUMMY_PEER_CHART_DATA = [
  { name: "N-Block", simba: 123, peers: 320 },
  { name: "Vasant Kunj", simba: 450, peers: 410 },
  { name: "Connaught", simba: 230, peers: 150 },
  { name: "Rajouri", simba: 370, peers: 340 },
  { name: "Karol Bagh", simba: 280, peers: 420 },
  { name: "Sector 12", simba: 160, peers: 200 },
];

export const DUMMY_STORE_REPORT_VS_FIELD_CHART_DATA = [
  { name: "A Block", govt: 12, field: 10 },
  { name: "B Block", govt: 20, field: 19 },
  { name: "C Block", govt: 15, field: 12 },
  { name: "D Block", govt: 18, field: 16 },
  { name: "E Block", govt: 25, field: 20 },
  { name: "F Block", govt: 10, field: 9 },
  { name: "G Block", govt: 30, field: 22 },
  { name: "H Block", govt: 16, field: 14 },
  { name: "I Block", govt: 22, field: 18 },
  { name: "J Block", govt: 14, field: 12 },
];


//Seler Screen
export const SELLER_SCREEN = 'Employee Sales Panel'

//Report vs Field Data (Store-wise)
export const ReportVsFieldDataStoreWise = [
  { "shopName": "A Block", "govtData": 15, "fieldData": 12, "totalGap": 3 },
  { "shopName": "B Block", "govtData": 22, "fieldData": 18, "totalGap": 4 },
  { "shopName": "C Block", "govtData": 10, "fieldData": 7, "totalGap": 3 },
  { "shopName": "D Block", "govtData": 30, "fieldData": 25, "totalGap": 5 },
  { "shopName": "E Block", "govtData": 12, "fieldData": 10, "totalGap": 2 },
  { "shopName": "F Block", "govtData": 18, "fieldData": 15, "totalGap": 3 },
  { "shopName": "G Block", "govtData": 20, "fieldData": 16, "totalGap": 4 },
  { "shopName": "H Block", "govtData": 25, "fieldData": 21, "totalGap": 4 },
  { "shopName": "I Block", "govtData": 14, "fieldData": 12, "totalGap": 2 },
  { "shopName": "J Block", "govtData": 28, "fieldData": 23, "totalGap": 5 },
  { "shopName": "K Block", "govtData": 16, "fieldData": 14, "totalGap": 2 },
  { "shopName": "L Block", "govtData": 19, "fieldData": 15, "totalGap": 4 },
  { "shopName": "M Block", "govtData": 23, "fieldData": 20, "totalGap": 3 },
  { "shopName": "N Block", "govtData": 17, "fieldData": 13, "totalGap": 4 },
  { "shopName": "O Block", "govtData": 29, "fieldData": 24, "totalGap": 5 },
  { "shopName": "P Block", "govtData": 21, "fieldData": 18, "totalGap": 3 },
  { "shopName": "Q Block", "govtData": 27, "fieldData": 22, "totalGap": 5 },
  { "shopName": "R Block", "govtData": 24, "fieldData": 19, "totalGap": 5 },
  { "shopName": "S Block", "govtData": 26, "fieldData": 21, "totalGap": 5 },
  { "shopName": "T Block", "govtData": 13, "fieldData": 11, "totalGap": 2 },
  { "shopName": "U Block", "govtData": 31, "fieldData": 26, "totalGap": 5 },
  { "shopName": "V Block", "govtData": 20, "fieldData": 17, "totalGap": 3 },
  { "shopName": "W Block", "govtData": 22, "fieldData": 19, "totalGap": 3 },
  { "shopName": "X Block", "govtData": 18, "fieldData": 15, "totalGap": 3 },
  { "shopName": "Y Block", "govtData": 27, "fieldData": 23, "totalGap": 4 },
  { "shopName": "Z Block", "govtData": 32, "fieldData": 27, "totalGap": 5 },
  { "shopName": "AA Block", "govtData": 19, "fieldData": 16, "totalGap": 3 },
  { "shopName": "BB Block", "govtData": 25, "fieldData": 21, "totalGap": 4 },
  { "shopName": "CC Block", "govtData": 21, "fieldData": 17, "totalGap": 4 },
  { "shopName": "DD Block", "govtData": 30, "fieldData": 24, "totalGap": 6 }
]


export const DAILY_REPORTS_EXTRA_INFORMATION = "The data displayed in this dashboard reflects user uploads completed yesterday, up to 2:00 AM.";


