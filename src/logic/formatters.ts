/**
 * Formats a number as currency with AUD symbol and thousands separators
 * @param value - The number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Formats a number as a percentage
 * @param value - The number to format (0-100)
 * @param decimalPlaces - Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimalPlaces = 1): string => {
  return `${value.toFixed(decimalPlaces)}%`;
};

/**
 * Formats a number as a decimal with specified decimal places
 * @param value - The number to format
 * @param decimalPlaces - Number of decimal places
 * @returns Formatted decimal string
 */
export const formatDecimal = (value: number, decimalPlaces = 2): string => {
  return value.toFixed(decimalPlaces);
};

/**
 * Format a number with commas for thousands separator
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-AU').format(value);
};

/**
 * Format a date string to a human-readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

/**
 * Format square meters
 */
export const formatSquareMeters = (value: number): string => {
  return `${formatNumber(value)}m²`;
}; 