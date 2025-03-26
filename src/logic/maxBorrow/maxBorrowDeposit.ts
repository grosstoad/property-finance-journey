/**
 * Max Borrow Deposit Calculator
 * 
 * Calculates the maximum borrowing amount based on deposit/savings constraints
 * for all LVR bands using the approach specified in the requirements.
 */
import { depositService } from '../depositService';
import { LvrBand, DepositConstraintResult } from './types';
import { GLOBAL_LIMITS } from '../../constants';
import { safeNumber } from './utilities';

/**
 * Interface for deposit calculation results with calculated total
 */
interface DepositComponentsWithTotal {
  stampDuty: number;
  legalFees: number;
  otherUpfrontCosts: number;
  total: number;
}

/**
 * Helper function to format currency for logging
 */
function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/**
 * Helper function to format percentage for logging
 */
function formatPercent(value: number): string {
  return (value * 100).toFixed(2) + '%';
}

/**
 * Calculate deposit components with total amount
 */
function calculateDepositComponentsWithTotal(
  propertyValue: number,
  state: string,
  isFirstHomeBuyer: boolean,
  isInvestmentProperty: boolean
): DepositComponentsWithTotal {
  const components = depositService.calculateDepositComponents(
    propertyValue,
    state,
    isFirstHomeBuyer,
    isInvestmentProperty
  );
  
  // Add total property
  return {
    ...components,
    total: components.stampDuty + components.legalFees + components.otherUpfrontCosts
  };
}

/**
 * Logger factory for consistent logging
 */
class Logger {
  private prefix: string;

  constructor(category: string) {
    this.prefix = `[${category}]`;
  }

  debug(message: string): void {
    console.log(`${this.prefix} ${message}`);
  }
}

const LoggerFactory = {
  getLogger: (category: string): Logger => {
    return new Logger(category);
  }
};

/**
 * Get upper LVR bound from band
 */
export function getLvrUpperBound(lvrBand: LvrBand): number {
  switch(lvrBand) {
    case '0-50': return 0.50;
    case '50-60': return 0.60;
    case '60-70': return 0.70;
    case '70-80': return 0.80;
    case '80-85': return 0.85;
    default: throw new Error(`Unsupported LVR band: ${lvrBand}`);
  }
}

/**
 * Convert LVR value to LVR band
 */
export function getLvrBandFromLvr(lvr: number): LvrBand {
  const lvrPercentage = lvr * 100;
  if (lvrPercentage <= 50) return '0-50';
  if (lvrPercentage <= 60) return '50-60';
  if (lvrPercentage <= 70) return '60-70';
  if (lvrPercentage <= 80) return '70-80';
  if (lvrPercentage <= 85) return '80-85';
  return '80-85'; // Default to highest band if above 85% (shouldn't happen)
}

/**
 * Check if an LVR value falls within a specific LVR band
 */
export function isLvrWithinBand(lvr: number, band: LvrBand): boolean {
  const bandBounds = {
    '0-50': { min: 0, max: 0.50 },
    '50-60': { min: 0.50, max: 0.60 },
    '60-70': { min: 0.60, max: 0.70 },
    '70-80': { min: 0.70, max: 0.80 },
    '80-85': { min: 0.80, max: 0.85 }
  };
  
  const bounds = bandBounds[band];
  if (!bounds) return false;
  
  return lvr > bounds.min && lvr <= bounds.max;
}

/**
 * Calculates maximum borrowing amount based on deposit/savings constraints
 * for a specific LVR band.
 */
export function calculateMaxBorrowingByDeposit(
  savings: number,
  state: string,
  isFirstHomeBuyer: boolean,
  isInvestmentProperty: boolean,
  lvrBand: LvrBand,
  maxIterations: number = 20
): DepositConstraintResult {
  const logger = LoggerFactory.getLogger('MaxBorrowDeposit');
  
  // Ensure inputs are valid numbers
  savings = safeNumber(savings);
  maxIterations = safeNumber(maxIterations, 20);
  
  // Extract LVR upper bound from band
  const lvrUpperBound = getLvrUpperBound(lvrBand);
  logger.debug(`Calculating max borrowing by DEPOSIT for LVR band ${lvrBand}`);
  
  // Calculate bounds per requirements
  const upperBoundPropertyValue = safeNumber(savings / (1 - lvrUpperBound));
  const lowerBoundPropertyValue = safeNumber(savings / (1 - (lvrUpperBound - 0.10)));
  
  // Start with average as initial guess
  let propertyValue = safeNumber((upperBoundPropertyValue + lowerBoundPropertyValue) / 2);
  
  logger.debug(`Initial bounds calculation:`);
  logger.debug(`  Upper bound property value: $${formatCurrency(upperBoundPropertyValue)}`);
  logger.debug(`  Lower bound property value: $${formatCurrency(lowerBoundPropertyValue)}`);
  logger.debug(`  Starting property value: $${formatCurrency(propertyValue)}`);

  // Binary search implementation
  let iteration = 0;
  let lowerBound = safeNumber(lowerBoundPropertyValue);
  let upperBound = safeNumber(upperBoundPropertyValue);
  let found = false;
  
  while (iteration < maxIterations && !found) {
    // First calculate stamp duty and costs for this property value
    const depositComponents = calculateDepositComponentsWithTotal(
      propertyValue,
      state,
      isFirstHomeBuyer,
      isInvestmentProperty
    );
    
    // Then calculate available deposit (savings - costs)
    const availableDeposit = safeNumber(savings - depositComponents.total);
    
    // Then calculate loan amount (property - deposit)
    const loanAmount = safeNumber(propertyValue - availableDeposit);
    
    // Then calculate actual LVR (loan / property)
    const calculatedLvr = safeNumber(loanAmount / propertyValue);
    
    // Calculate difference from target LVR
    const lvrDifference = safeNumber(calculatedLvr - lvrUpperBound);
    
    logger.debug(`Iteration ${iteration + 1}: Property $${formatCurrency(propertyValue)}, ` +
      `Costs $${formatCurrency(depositComponents.total)}, Deposit $${formatCurrency(availableDeposit)}, ` +
      `Loan $${formatCurrency(loanAmount)}, LVR ${formatPercent(calculatedLvr)} ` +
      `(Target: ${formatPercent(lvrUpperBound)}, Diff: ${(lvrDifference * 100).toFixed(4)}%)`);
    
    // Check if we've found the solution (within small LVR tolerance)
    if (Math.abs(lvrDifference) < 0.0001) { // Within 0.01% tolerance
      found = true;
      logger.debug(`Convergence achieved at iteration ${iteration + 1} - LVR matches target`);
    } else if (calculatedLvr < lvrUpperBound) {
      // LVR is too low, increase property value
      lowerBound = propertyValue;
      propertyValue = safeNumber((upperBound + propertyValue) / 2);
      logger.debug(`  LVR too low, increasing property value, new bounds: [$${formatCurrency(lowerBound)}, $${formatCurrency(upperBound)}]`);
    } else {
      // LVR is too high, decrease property value
      upperBound = propertyValue;
      propertyValue = safeNumber((lowerBound + propertyValue) / 2);
      logger.debug(`  LVR too high, decreasing property value, new bounds: [$${formatCurrency(lowerBound)}, $${formatCurrency(upperBound)}]`);
    }
    
    iteration++;
  }
  
  logger.debug(`Binary search completed after ${iteration} iterations`);
  
  // Calculate final values
  const finalDepositComponents = calculateDepositComponentsWithTotal(
    propertyValue,
    state,
    isFirstHomeBuyer,
    isInvestmentProperty
  );
  
  const finalAvailableDeposit = safeNumber(savings - finalDepositComponents.total);
  const finalLoanAmount = Math.floor(safeNumber(propertyValue - finalAvailableDeposit));
  const finalCalculatedLvr = safeNumber(finalLoanAmount / propertyValue);
  const calculatedLvrBand = getLvrBandFromLvr(finalCalculatedLvr);
  
  logger.debug(`Final affordable property: $${formatCurrency(propertyValue)}, ` +
    `Costs $${formatCurrency(finalDepositComponents.total)}, ` +
    `Deposit $${formatCurrency(finalAvailableDeposit)}, ` +
    `Loan $${formatCurrency(finalLoanAmount)}, ` +
    `LVR ${formatPercent(finalCalculatedLvr)}`);
  
  return {
    maxLoanAmount: finalLoanAmount,
    maxPropertyAmount: propertyValue,
    calculatedLvr: finalCalculatedLvr,
    targetLvrBand: lvrBand,
    calculatedLvrBand: calculatedLvrBand,
    lvrBandMatchFlag: isLvrWithinBand(finalCalculatedLvr, lvrBand),
    investmentPurpose: isInvestmentProperty,
    propertyValueIterations: iteration,
    depositAmount: finalAvailableDeposit,
    stampDuty: finalDepositComponents.stampDuty,
    upfrontCosts: finalDepositComponents.legalFees + finalDepositComponents.otherUpfrontCosts,
    totalCosts: finalDepositComponents.total,
    requiredFromSavings: safeNumber(finalAvailableDeposit + finalDepositComponents.total),
    availableSavings: savings,
    remainingSavings: safeNumber(savings - (finalAvailableDeposit + finalDepositComponents.total))
  };
}

/**
 * Calculate max borrowing by deposit for all LVR bands
 */
export function calculateMaxBorrowingDeposit(
  savings: number,
  propertyState: string,
  isFirstHomeBuyer: boolean,
  isInvestmentProperty: boolean
): Record<LvrBand, DepositConstraintResult> {
  const logger = LoggerFactory.getLogger('MaxBorrowDeposit');
  logger.debug('Calculating MaxBorrowDeposit for all LVR bands');

  // Ensure inputs are valid
  savings = safeNumber(savings);

  const lvrBands: LvrBand[] = ['0-50', '50-60', '60-70', '70-80', '80-85'];
  const results: Record<LvrBand, DepositConstraintResult> = {} as Record<LvrBand, DepositConstraintResult>;

  // Calculate for each LVR band
  for (const lvrBand of lvrBands) {
    logger.debug(`--- Calculating deposit constraint for LVR band: ${lvrBand} ---`);
    
    results[lvrBand] = calculateMaxBorrowingByDeposit(
      savings,
      propertyState,
      isFirstHomeBuyer,
      isInvestmentProperty,
      lvrBand
    );
    
    logger.debug(`${lvrBand} result: Max loan $${formatCurrency(results[lvrBand].maxLoanAmount)}, ` +
      `Max property $${formatCurrency(results[lvrBand].maxPropertyAmount)}, ` +
      `LVR ${formatPercent(results[lvrBand].calculatedLvr)}, ` +
      `LVR within band: ${results[lvrBand].lvrBandMatchFlag ? 'YES' : 'NO'}`
    );
  }

  return results;
} 