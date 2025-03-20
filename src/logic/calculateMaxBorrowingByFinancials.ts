import { FinancialsInput } from '../types/FinancialTypes';
import { calculateServiceability } from './calculateServiceability';

// Constants
const MAX_BORROWING = 2500000; // Global max borrowing limit
const MIN_LOAN_AMOUNT = 50000; // Minimum loan amount
const DEFAULT_LOAN_TERM = 30; // Default loan term in years

// Define LVR bands and corresponding rate adjustments
const LVR_BANDS = [
  { min: 0, max: 60, product: 'STRAIGHT_UP', adjustment: -0.1 },
  { min: 60, max: 70, product: 'STRAIGHT_UP', adjustment: -0.05 },
  { min: 70, max: 80, product: 'STRAIGHT_UP', adjustment: 0 },
  { min: 80, max: 85, product: 'TAILORED', adjustment: 0.5 },
  { min: 85, max: 100, product: 'POWER_UP', adjustment: 1.0 },
];

/**
 * Get the rate adjustment for a given LVR
 * @param lvr Loan-to-value ratio
 * @returns Rate adjustment and product
 */
function getRateAdjustmentForLvr(lvr: number): { adjustment: number; product: string } {
  const band = LVR_BANDS.find(band => lvr > band.min && lvr <= band.max);
  return band || { adjustment: 0, product: 'STRAIGHT_UP' };
}

/**
 * Calculate maximum borrowing power based on financial serviceability
 * @param financials Financial inputs
 * @param baseInterestRate Base interest rate (percentage)
 * @param loanTerm Loan term in years
 * @param propertyValue Property value
 * @param isInvestmentProperty Whether the property is for investment
 * @returns Maximum borrowing amount and product details
 */
export function calculateMaxBorrowingByFinancials(
  financials: FinancialsInput,
  baseInterestRate: number,
  loanTerm: number = DEFAULT_LOAN_TERM,
  propertyValue: number = 0,
  isInvestmentProperty: boolean = false
): {
  maxLoanAmount: number;
  product: string;
  interestRate: number;
  lvr: number;
} {
  // Initial values
  let minLoanAmount = MIN_LOAN_AMOUNT;
  let maxLoanAmount = MAX_BORROWING;
  let iterations = 0;
  const maxIterations = 20; // Prevent infinite loop
  
  // Use binary search to find maximum loan amount that's serviceable
  while (maxLoanAmount - minLoanAmount > 1000 && iterations < maxIterations) {
    iterations++;
    
    // Try the midpoint
    const tryLoanAmount = Math.floor((minLoanAmount + maxLoanAmount) / 2);
    
    // Calculate LVR if property value is provided
    const lvr = propertyValue > 0 ? (tryLoanAmount / propertyValue) * 100 : 80;
    
    // Get interest rate adjustment based on LVR
    const { adjustment, product } = getRateAdjustmentForLvr(lvr);
    const adjustedInterestRate = baseInterestRate + adjustment;
    
    // Calculate serviceability for this loan amount
    const serviceability = calculateServiceability(
      financials,
      tryLoanAmount,
      adjustedInterestRate,
      loanTerm,
      isInvestmentProperty
    );
    
    // Check if this loan amount is serviceable
    if (serviceability.netSurplusOrDeficit >= 0) {
      // If serviceable, try a higher amount
      minLoanAmount = tryLoanAmount;
    } else {
      // If not serviceable, try a lower amount
      maxLoanAmount = tryLoanAmount;
    }
  }
  
  // Use the minimum of the range as the maximum serviceable amount
  const finalLoanAmount = minLoanAmount;
  
  // Calculate final LVR
  const finalLvr = propertyValue > 0 ? (finalLoanAmount / propertyValue) * 100 : 80;
  
  // Get final product and rate
  const { adjustment, product } = getRateAdjustmentForLvr(finalLvr);
  const finalInterestRate = baseInterestRate + adjustment;
  
  return {
    maxLoanAmount: Math.min(finalLoanAmount, MAX_BORROWING),
    product,
    interestRate: finalInterestRate,
    lvr: finalLvr,
  };
} 