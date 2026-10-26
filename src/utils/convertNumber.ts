
/**
 * Formats numbers into readable format with Indian numbering system suffixes
 * - Numbers >= 100,000 (1 lakh) use "lpa" suffix
 * - Numbers >= 1,000 use "k" suffix
 * - Smaller numbers remain unchanged
 * @param value - The number to format
 * @returns Formatted string with appropriate suffix
 */
export function formatNumber(value: number | string): string {
  // Convert string to number if needed
  const num = typeof value === 'string' ? parseFloat(value) : value;

  // Handle invalid numbers
  if (isNaN(num)) return '0';

  // Format for lakhs (100,000+)
  if (Math.abs(num) >= 100000) {
    const lakhs = num / 100000;
    // Remove unnecessary decimals (e.g., 4.0 becomes 4)
    return lakhs % 1 === 0 ? `${lakhs}lpa` : `${lakhs.toFixed(2)}lpa`;
  }

  // Format for thousands (1,000+)
  if (Math.abs(num) >= 1000) {
    const thousands = num / 1000;
    // Remove unnecessary decimals (e.g., 4.0 becomes 4)
    return thousands % 1 === 0 ? `${thousands}k` : `${thousands.toFixed(2)}k`;
  }

  // Return as is for smaller numbers
  return num.toString();
}
