/**
 * Tax calculation service for Australian income tax
 */
import { 
  TAX_BRACKETS,
  LOW_INCOME_TAX_OFFSET,
  MEDICARE_LEVY,
  ROUNDING_RULES
} from '../constants/financialConstants';

export interface TaxCalculationResult {
  incomeTax: number;
  lowIncomeTaxOffset: number;
  medicareLevy: number;
  totalTax: number;
}

/**
 * Round a number to two decimal places
 * @param value Number to round
 * @returns Rounded number
 */
function roundToTwoDecimal(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculate income tax based on taxable income
 * @param taxableIncome Annual taxable income
 * @returns Annual tax amount
 */
export function calculateIncomeTax(taxableIncome: number): number {
  // Find the applicable income tax bracket
  const bracket = TAX_BRACKETS.find(
    bracket => taxableIncome > bracket.lowBound && taxableIncome <= bracket.highBound
  ) || TAX_BRACKETS[0];
  
  // Calculate income tax: base + rate * (income - lowerBound)
  const incomeTax = bracket.base + (taxableIncome - bracket.lowBound) * bracket.rate;
  
  // Round to two decimal places
  return roundToTwoDecimal(incomeTax);
}

/**
 * Calculate low income tax offset
 * @param taxableIncome Annual taxable income
 * @returns Low income tax offset amount
 */
export function calculateLowIncomeTaxOffset(taxableIncome: number): number {
  // Find the applicable offset bracket
  const bracket = LOW_INCOME_TAX_OFFSET.find(
    bracket => taxableIncome > bracket.lowBound && taxableIncome <= bracket.highBound
  ) || LOW_INCOME_TAX_OFFSET[0];
  
  // Calculate offset: base - rate * (income - lowerBound)
  const offset = bracket.base - (taxableIncome - bracket.lowBound) * bracket.rate;
  
  // Round to two decimal places
  return roundToTwoDecimal(Math.max(0, offset));
}

/**
 * Calculate Medicare levy based on taxable income
 * @param taxableIncome Annual taxable income
 * @returns Medicare levy amount
 */
export function calculateMedicareLevy(taxableIncome: number): number {
  // Find the applicable Medicare levy bracket
  const bracket = MEDICARE_LEVY.find(
    bracket => taxableIncome > bracket.lowBound && taxableIncome <= bracket.highBound
  ) || MEDICARE_LEVY[0];
  
  // Calculate Medicare levy: base + rate * (income - lowerBound)
  const levy = bracket.base + (taxableIncome - bracket.lowBound) * bracket.rate;
  
  // Round to two decimal places
  return roundToTwoDecimal(levy);
}

/**
 * Calculate total tax including income tax, adjusting for low income tax offset and Medicare levy
 * @param taxableIncome Annual taxable income 
 * @returns Detailed tax calculation result
 */
export function calculateTotalTax(taxableIncome: number): TaxCalculationResult {
  const incomeTax = calculateIncomeTax(taxableIncome);
  const lowIncomeTaxOffset = calculateLowIncomeTaxOffset(taxableIncome);
  const medicareLevy = calculateMedicareLevy(taxableIncome);
  
  // Final tax cannot be negative
  const totalTax = Math.max(0, incomeTax - lowIncomeTaxOffset + medicareLevy);
  
  return {
    incomeTax,
    lowIncomeTaxOffset,
    medicareLevy,
    totalTax: roundToTwoDecimal(totalTax)
  };
} 