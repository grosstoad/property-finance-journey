/**
 * Max Borrow Utilities
 * 
 * Shared utility functions for the maxBorrow module to reduce code duplication.
 */

/**
 * Logger class for consistent logging
 */
export class Logger {
  private prefix: string;

  constructor(category: string) {
    this.prefix = `[${category}]`;
  }

  debug(message: string): void {
    console.log(`${this.prefix} ${message}`);
  }

  info(message: string): void {
    console.info(`${this.prefix} ${message}`);
  }

  warn(message: string): void {
    console.warn(`${this.prefix} ${message}`);
  }

  error(message: string): void {
    console.error(`${this.prefix} ${message}`);
  }
}

/**
 * Logger factory for consistent logging
 */
export const LoggerFactory = {
  getLogger: (category: string): Logger => {
    return new Logger(category);
  }
};

/**
 * Format a number as currency
 * 
 * @param value - The number to format
 * @returns Formatted currency string without decimal places
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/**
 * Format a decimal as a percentage
 * 
 * @param value - The decimal to format (e.g., 0.75 for 75%)
 * @param decimals - Number of decimal places to include (default: 2)
 * @returns Formatted percentage string with % symbol
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return (value * 100).toFixed(decimals) + '%';
}

/**
 * Round to the nearest dollar (whole number)
 * 
 * @param value - The number to round
 * @returns Rounded whole number
 */
export function roundToDollar(value: number): number {
  return Math.floor(value);
}

/**
 * Ensures a value is a valid number, replacing NaN, Infinity, or null with a default value
 * 
 * @param value - The value to check
 * @param defaultValue - Default value to use if invalid (default: 0)
 * @returns A valid number
 */
export function safeNumber(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return defaultValue;
  }
  return Number(value);
}

/**
 * Calculate the Present Value of a loan based on monthly payment amount
 * 
 * @param monthlyPayment - Monthly payment amount
 * @param interestRate - Annual interest rate as decimal (e.g., 0.05 for 5%)
 * @param termInYears - Loan term in years
 * @returns Present value (loan amount)
 */
export function calculateLoanAmountPV(
  monthlyPayment: number,
  interestRate: number,
  termInYears: number
): number {
  // Ensure all inputs are valid numbers
  monthlyPayment = safeNumber(monthlyPayment);
  interestRate = safeNumber(interestRate);
  termInYears = safeNumber(termInYears);
  
  // Return 0 if monthly payment is 0 or negative
  if (monthlyPayment <= 0) {
    return 0;
  }
  
  const monthlyRate = interestRate / 12;
  const numberOfPayments = termInYears * 12;
  
  // Handle edge cases
  if (monthlyRate <= 0 || numberOfPayments <= 0) {
    return monthlyPayment * numberOfPayments;
  }
  
  // PV formula: PMT * ((1 - (1 + r)^-n) / r)
  const presentValue = monthlyPayment * ((1 - Math.pow(1 + monthlyRate, -numberOfPayments)) / monthlyRate);
  
  // Ensure the result is valid
  const result = Math.floor(safeNumber(presentValue));
  return result > 0 ? result : 0; // Return 0 if calculation results in negative or invalid value
}

/**
 * Deep clone an object to prevent reference issues
 * 
 * @param obj - The object to clone
 * @returns A deep copy of the object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
} 