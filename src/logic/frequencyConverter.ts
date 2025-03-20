import { FrequencyType } from '../types/FinancialTypes';

// Multipliers to convert to annual amounts
const FREQUENCY_MULTIPLIERS: Record<FrequencyType, number> = {
  weekly: 52,
  fortnightly: 26,
  monthly: 12,
  yearly: 1,
};

/**
 * Convert an amount from one frequency to another
 * @param amount The amount to convert
 * @param fromFrequency The source frequency
 * @param toFrequency The target frequency
 * @returns Converted amount
 */
export function convertFrequency(
  amount: number,
  fromFrequency: FrequencyType,
  toFrequency: FrequencyType
): number {
  if (amount <= 0) return 0;
  if (fromFrequency === toFrequency) return amount;
  
  // Convert to annual amount first
  const annualAmount = amount * FREQUENCY_MULTIPLIERS[fromFrequency];
  
  // Then convert from annual to target frequency
  return annualAmount / FREQUENCY_MULTIPLIERS[toFrequency];
}

/**
 * Convert an amount to annual frequency
 * @param amount The amount to convert
 * @param frequency The source frequency
 * @returns Annual amount
 */
export function convertToAnnual(amount: number, frequency: FrequencyType): number {
  return convertFrequency(amount, frequency, 'yearly');
}

/**
 * Convert an amount to monthly frequency
 * @param amount The amount to convert
 * @param frequency The source frequency
 * @returns Monthly amount
 */
export function convertToMonthly(amount: number, frequency: FrequencyType): number {
  return convertFrequency(amount, frequency, 'monthly');
}

/**
 * Format currency value
 * @param value Number to format
 * @param options Intl.NumberFormat options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  options: Partial<Intl.NumberFormatOptions> = {}
): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
    ...options,
  }).format(value);
} 