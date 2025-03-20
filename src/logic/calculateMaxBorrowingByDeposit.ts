import { calculateStampDuty } from './calculateStampDuty';

// Constants
const UPFRONT_COSTS = 3000; // Fixed upfront costs as per PRD
const MAX_LVR = 0.8; // Default maximum LVR (80%)
const MAX_BORROWING = 2500000; // Global max borrowing limit

/**
 * Calculate maximum borrowing power based on deposit
 * @param savings Total available savings
 * @param propertyState Property state code
 * @param isFirstHomeBuyer Whether the buyer is a first home buyer
 * @param isInvestmentProperty Whether the property is for investment
 * @param maxLvr Maximum loan-to-value ratio (0-1)
 * @returns Maximum borrowing amount
 */
export function calculateMaxBorrowingByDeposit(
  savings: number,
  propertyState: string,
  isFirstHomeBuyer: boolean = false,
  isInvestmentProperty: boolean = false,
  maxLvr: number = MAX_LVR
): number {
  // Validation
  if (savings <= 0) return 0;
  if (maxLvr <= 0 || maxLvr > 1) maxLvr = MAX_LVR;
  
  // Initial estimate
  let propertyPrice = savings / (1 - maxLvr);
  let prevPropertyPrice = 0;
  let iterations = 0;
  const maxIterations = 20; // Prevent infinite loop
  const convergenceTolerance = 100; // Tolerance for convergence in dollars
  
  // Iterative approach to handle the circular dependency
  while (Math.abs(propertyPrice - prevPropertyPrice) > convergenceTolerance && iterations < maxIterations) {
    iterations++;
    prevPropertyPrice = propertyPrice;
    
    // Calculate stamp duty based on current property price
    const stampDuty = calculateStampDuty(
      propertyPrice,
      propertyState,
      isFirstHomeBuyer,
      isInvestmentProperty
    );
    
    // Calculate deposit required
    const totalCosts = stampDuty + UPFRONT_COSTS;
    const availableForDeposit = Math.max(0, savings - totalCosts);
    const requiredDeposit = propertyPrice * (1 - maxLvr);
    
    // Adjust property price based on available deposit
    if (availableForDeposit >= requiredDeposit) {
      // If we have more than enough deposit, we can increase property price
      propertyPrice = availableForDeposit / (1 - maxLvr);
    } else {
      // If we don't have enough deposit, we need to decrease property price
      propertyPrice = (savings - UPFRONT_COSTS) / ((1 - maxLvr) + (maxLvr * 0));
      // This simplification assumes stamp duty is roughly proportional to property price
      // For more accuracy, we could use the stamp duty rate directly
    }
  }
  
  // Calculate the final loan amount
  const finalStampDuty = calculateStampDuty(
    propertyPrice,
    propertyState,
    isFirstHomeBuyer,
    isInvestmentProperty
  );
  
  const availableForDeposit = Math.max(0, savings - finalStampDuty - UPFRONT_COSTS);
  const loanAmount = Math.max(0, propertyPrice - availableForDeposit);
  
  // Ensure we don't exceed global max borrowing
  return Math.min(loanAmount, MAX_BORROWING);
} 