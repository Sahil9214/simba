// Chart utility functions for data transformation and export
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export interface ExportData {
  [key: string]: string | number;
}

export interface ChartExportOptions {
  filename?: string;
  sheetName?: string;
  title?: string;
}

/**
 * Export data to CSV format
 */
export const exportToCSV = (data: ExportData[], options: ChartExportOptions = {}) => {
  try {
    const { filename = 'chart-data', title = 'Chart Data' } = options;

    if (!data.length) {
      toast.error('No data available for export');
      return;
    }

    const headers = Object.keys(data[0]).join(',') + '\n';
    const csvContent = data.map(row =>
      Object.values(row).map(value =>
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    ).join('\n');

    const csvData = headers + csvContent;
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });

    downloadFile(blob, `${filename}-${getCurrentDate()}.csv`);
    toast.success('Data exported as CSV');
  } catch (error) {
    console.error('CSV export failed:', error);
    toast.error('Failed to export CSV');
  }
};

/**
 * Export data to Excel format
 */
export const exportToExcel = (data: ExportData[], options: ChartExportOptions = {}) => {
  try {
    const { filename = 'chart-data', sheetName = 'Data', title = 'Chart Data' } = options;

    if (!data.length) {
      toast.error('No data available for export');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    // Set column widths for better readability
    const colWidths = Object.keys(data[0]).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${filename}-${getCurrentDate()}.xlsx`);

    toast.success('Data exported as Excel');
  } catch (error) {
    console.error('Excel export failed:', error);
    toast.error('Failed to export Excel');
  }
};

/**
 * Export data to JSON format
 */
export const exportToJSON = (data: ExportData[], options: ChartExportOptions = {}) => {
  try {
    const { filename = 'chart-data', title = 'Chart Data' } = options;

    if (!data.length) {
      toast.error('No data available for export');
      return;
    }

    const exportObject = {
      title,
      exportDate: new Date().toISOString(),
      recordCount: data.length,
      data
    };

    const jsonContent = JSON.stringify(exportObject, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });

    downloadFile(blob, `${filename}-${getCurrentDate()}.json`);
    toast.success('Data exported as JSON');
  } catch (error) {
    console.error('JSON export failed:', error);
    toast.error('Failed to export JSON');
  }
};

/**
 * Generic export function that supports multiple formats
 */
export const exportChartData = (
  data: ExportData[],
  format: 'csv' | 'excel' | 'json',
  options: ChartExportOptions = {}
) => {
  switch (format) {
    case 'csv':
      return exportToCSV(data, options);
    case 'excel':
      return exportToExcel(data, options);
    case 'json':
      return exportToJSON(data, options);
    default:
      toast.error('Unsupported export format');
  }
};

/**
 * Helper function to download a blob as a file
 */
const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Get current date in YYYY-MM-DD format
 */
const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Transform API data to chart format
 */
export const transformPeerComparisonData = (apiData: any[]): Array<{ name: string; simba: number; peers: number }> => {
  return apiData.map((item: any) => ({
    name: item.shopName || item.name || 'Unknown',
    simba: item.simbaValue || item.simba || 0,
    peers: item.peersValue || item.peers || 0
  }));
};

/**
 * Transform sales data to donut chart format
 */
export const transformSalesData = (apiData: any[]): Array<{ key: string; label: string; value: number }> => {
  return apiData.map((item: any, index: number) => ({
    key: item.key || item.id || `item-${index}`,
    label: item.category || item.name || item.label || 'Unknown',
    value: item.revenue || item.sales || item.value || item.units || 0
  }));
};

/**
 * Transform time series data
 */
export const transformTimeSeriesData = (apiData: any[]): Array<{ month: string; opening: number; closing: number }> => {
  return apiData.map((item: any) => ({
    month: item.period || item.month || item.date || 'Unknown',
    opening: item.opening || item.openingStock || item.sales || 0,
    closing: item.closing || item.closingStock || item.stock || 0
  }));
};

/**
 * Transform store comparison data
 */
export const transformStoreData = (apiData: any[]): Array<{ shopName: string; govtData: number; fieldData: number; totalGap: number }> => {
  return apiData.map((item: any) => ({
    shopName: item.shopName || item.name || 'Unknown Shop',
    govtData: item.reportedValue || item.govtData || 0,
    fieldData: item.fieldValue || item.fieldData || 0,
    totalGap: item.gap || item.totalGap || Math.abs((item.reportedValue || 0) - (item.fieldValue || 0))
  }));
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Format numbers for display
 */
export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Format currency values
 */
export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(value);
};

/**
 * Format percentage values
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${(value).toFixed(decimals)}%`;
};

/**
 * Generate color palette for charts
 */
export const generateColorPalette = (count: number): string[] => {
  const baseColors = [
    '#0ea5a4', '#34d399', '#7dd3fc', '#99f6e4', '#a7f3d0',
    '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444',
    '#10b981', '#3b82f6', '#06b6d4', '#84cc16', '#f97316'
  ];

  const palette = [];
  for (let i = 0; i < count; i++) {
    palette.push(baseColors[i % baseColors.length]);
  }

  return palette;
};

/**
 * Generate chart title with filter information
 */
export const generateChartTitle = (
  baseTitle: string,
  searchTerm?: string,
  selectedLocation?: string,
  dataCount?: number
): string => {
  let title = baseTitle;

  if (dataCount !== undefined) {
    title += ` (${dataCount} ${dataCount === 1 ? 'item' : 'items'})`;
  }

  const filters = [];
  if (searchTerm) filters.push(`Search: ${searchTerm}`);
  if (selectedLocation) filters.push(`Location: ${selectedLocation}`);

  if (filters.length > 0) {
    title += ` • ${filters.join(' • ')}`;
  }

  return title;
};

/**
 * Debounce function for search and filter operations
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Check if data is empty or invalid
 */
export const isValidChartData = (data: any): boolean => {
  return Array.isArray(data) && data.length > 0 && data.some(item =>
    item && typeof item === 'object' && Object.keys(item).length > 0
  );
};

/**
 * Sort data by value in descending order
 */
export const sortByValue = <T extends { value: number }>(data: T[]): T[] => {
  return [...data].sort((a, b) => b.value - a.value);
};

/**
 * Limit data to top N items
 */
export const limitData = <T>(data: T[], limit: number): T[] => {
  return data.slice(0, limit);
};

/**
 * Calculate chart statistics
 */
export const calculateChartStats = (data: Array<{ value: number }>): {
  total: number;
  average: number;
  max: number;
  min: number;
  count: number;
} => {
  if (!data.length) {
    return { total: 0, average: 0, max: 0, min: 0, count: 0 };
  }

  const values = data.map(item => item.value);
  const total = values.reduce((sum, value) => sum + value, 0);

  return {
    total,
    average: total / values.length,
    max: Math.max(...values),
    min: Math.min(...values),
    count: values.length
  };
};