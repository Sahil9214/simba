import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Date Formatting Utilities
 * These functions ensure consistent date formatting across the application
 * to prevent issues with different hosting environments interpreting dates differently
 */

/**
 * Formats a Date object to ISO 8601 format (YYYY-MM-DD)
 * This is the standard format for API communication to avoid ambiguity
 * @param date - Date object to format
 * @returns Formatted date string in YYYY-MM-DD format
 */
export function formatDateForAPI(date: Date): string {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Parses a date string in various formats and converts to ISO 8601 (YYYY-MM-DD)
 * Handles formats: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, DD-MM-YYYY
 * @param dateString - Date string to parse
 * @returns Formatted date string in YYYY-MM-DD format or null if invalid
 */
export function parseDateToISO(dateString: string): string | null {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }

  const cleanDate = dateString.trim();

  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
    return cleanDate;
  }

  // Handle DD/MM/YYYY format (common in many regions)
  const ddmmyyyyMatch = cleanDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Handle DD-MM-YYYY format
  const ddmmyyyyDashMatch = cleanDate.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (ddmmyyyyDashMatch) {
    const [, day, month, year] = ddmmyyyyDashMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Try parsing with Date constructor as fallback
  try {
    const date = new Date(cleanDate);
    if (!isNaN(date.getTime())) {
      return formatDateForAPI(date);
    }
  } catch (error) {
    console.warn(`Failed to parse date: ${dateString}`);
  }

  return null;
}

/**
 * Ensures a date value is in ISO 8601 format (YYYY-MM-DD)
 * Accepts Date objects or date strings
 * @param date - Date object or string to normalize
 * @returns Formatted date string in YYYY-MM-DD format
 */
export function normalizeDateForAPI(date: Date | string): string {
  if (date instanceof Date) {
    return formatDateForAPI(date);
  }

  const parsed = parseDateToISO(date);
  if (parsed) {
    return parsed;
  }

  // Fallback to current date if parsing fails
  console.warn(`Invalid date provided: ${date}, using current date`);
  return formatDateForAPI(new Date());
}

/**
 * Gets the current date in ISO 8601 format (YYYY-MM-DD)
 * @returns Current date string in YYYY-MM-DD format
 */
export function getCurrentDateISO(): string {
  return formatDateForAPI(new Date());
}

/**
 * Gets a date N days ago in ISO 8601 format (YYYY-MM-DD)
 * @param daysAgo - Number of days to go back
 * @returns Date string in YYYY-MM-DD format
 */
export function getDateDaysAgo(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return formatDateForAPI(date);
}

/**
 * Creates a date range object with ISO formatted dates
 * @param startDate - Start date (Date object or string)
 * @param endDate - End date (Date object or string)
 * @returns Object with start and end dates in YYYY-MM-DD format
 */
export function createDateRange(startDate: Date | string, endDate: Date | string): { start: string; end: string } {
  return {
    start: normalizeDateForAPI(startDate),
    end: normalizeDateForAPI(endDate)
  };
}
