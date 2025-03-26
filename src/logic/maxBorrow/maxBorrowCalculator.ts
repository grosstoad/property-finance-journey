/**
 * Max Borrow Calculator
 * 
 * Main module for calculating maximum borrowing amount based on both
 * financial and deposit constraints.
 */

import { LoanProductDetails } from '../../types/loan';
import { FinancialsInput } from '../../types/FinancialTypes';
import { GLOBAL_LIMITS } from '../../constants/financialConstants';
import { 
  MaxBorrowResult, 
  LvrBand, 
  MaxBorrowConstraint, 
  FinancialConstraintResult,
  DepositConstraintResult,
  LoanScenario
} from './types';
import { calculateMaxBorrowingFinancials } from './maxBorrowFinancials';
import { calculateMaxBorrowingDeposit } from './maxBorrowDeposit';
import { safeNumber } from './utilities';

/**
 * Logger class for consistent logging
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
 * Helper function to format currency for logging
 */
function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/**
 * Determine loan scenario based on product details and home component
 */
function determineLoanScenario(
  loanProductDetails: LoanProductDetails,
  hasOwnHomeComponent: boolean
): LoanScenario {
  if (loanProductDetails.productName?.toLowerCase()?.includes('tailored')) {
    return 'TAILORED';
  } else if (hasOwnHomeComponent) {
    return 'OWN_HOME_COMBINED';
  } else {
    return 'STRAIGHT_UP_POWER_UP_FIXED';
  }
}

/**
 * Find the matching financials result where lvrBandMatchFlag is true
 */
function getMatchingFinancialsResult(
  financialsResults: Record<LvrBand, FinancialConstraintResult>
): FinancialConstraintResult {
  // First try to find a result with a matching LVR band
  for (const lvrBand of ['80-85', '70-80', '60-70', '50-60', '0-50'] as LvrBand[]) {
    if (financialsResults[lvrBand].lvrBandMatchFlag) {
      return financialsResults[lvrBand];
    }
  }
  
  // If no matching band found, use the 70-80 band by default as specified in requirements
  return financialsResults['70-80'];
}

/**
 * Get appropriate deposit result based on loan scenario
 */
function getAppropriateDepositResult(
  depositResults: Record<LvrBand, DepositConstraintResult>,
  scenario: LoanScenario
): DepositConstraintResult {
  switch (scenario) {
    case 'TAILORED':
      return depositResults['80-85'];
    case 'OWN_HOME_COMBINED':
    case 'STRAIGHT_UP_POWER_UP_FIXED':
    default:
      return depositResults['70-80'];
  }
}

/**
 * Determine which constraint was used to determine the max borrow amount
 */
function determineConstraint(
  financialsResult: FinancialConstraintResult,
  depositResult: DepositConstraintResult,
  globalLoanMax: number,
  maxBorrowAmount: number
): MaxBorrowConstraint {
  if (maxBorrowAmount === globalLoanMax) {
    return 'GLOBAL_MAX';
  }
  
  if (maxBorrowAmount === financialsResult.maxLoanAmount) {
    return 'FINANCIALS';
  }
  
  return 'DEPOSIT';
}

/**
 * Main function to calculate maximum borrowing amount
 */
export function calculateMaxBorrowing(
  financials: FinancialsInput,
  loanProductDetails: LoanProductDetails,
  propertyPrice: number,
  isInvestmentProperty: boolean,
  propertyPostcode: string,
  savings: number,
  propertyState: string,
  isFirstHomeBuyer: boolean,
  requiredLoanAmount: number,
  hasOwnHomeComponent: boolean,
  loanPreferences: any
): MaxBorrowResult {
  const logger = LoggerFactory.getLogger('MaxBorrowCalculator');
  logger.debug('Starting max borrowing calculation');
  
  // Ensure inputs are valid numbers
  propertyPrice = safeNumber(propertyPrice);
  savings = safeNumber(savings);
  requiredLoanAmount = safeNumber(requiredLoanAmount);
  
  // 1. Determine loan scenario
  const loanScenario = determineLoanScenario(loanProductDetails, hasOwnHomeComponent);
  logger.debug(`Loan scenario: ${loanScenario}`);
  
  // 2. Calculate for all LVR bands
  // 2.1 Financial constraints
  const financialsResults = calculateMaxBorrowingFinancials(
    financials,
    loanProductDetails,
    isInvestmentProperty,
    propertyPostcode,
    loanPreferences,
    propertyState,
    isFirstHomeBuyer,
    savings,
    loanScenario
  );
  
  // 2.2 Deposit constraints
  const depositResults = calculateMaxBorrowingDeposit(
    savings,
    propertyState,
    isFirstHomeBuyer,
    isInvestmentProperty
  );
  
  // 2.3 Global loan max
  const globalLoanMax = safeNumber(GLOBAL_LIMITS.MAX_BORROWING || 3000000);
  logger.debug(`Global loan max: $${formatCurrency(globalLoanMax)}`);
  
  // 3. Get matching result from financials (where lvrBandMatchFlag is true)
  const matchingFinancialsResult = getMatchingFinancialsResult(financialsResults);
  logger.debug(`Matching financials result from LVR band: ${matchingFinancialsResult.targetLvrBand}`);
  logger.debug(`Max borrow amount by financials: $${formatCurrency(matchingFinancialsResult.maxLoanAmount)}`);
  
  // 4. Get appropriate deposit result based on scenario
  const appropriateDepositResult = getAppropriateDepositResult(depositResults, loanScenario);
  logger.debug(`Appropriate deposit result from LVR band: ${appropriateDepositResult.targetLvrBand}`);
  logger.debug(`Max borrow amount by deposit: $${formatCurrency(appropriateDepositResult.maxLoanAmount)}`);
  
  // 5. Apply MIN function
  const maxBorrowAmount = safeNumber(Math.min(
    safeNumber(matchingFinancialsResult.maxLoanAmount),
    safeNumber(appropriateDepositResult.maxLoanAmount),
    globalLoanMax
  ));
  
  // 6. Determine which constraint was used
  const maxBorrowReason = determineConstraint(
    matchingFinancialsResult,
    appropriateDepositResult,
    globalLoanMax,
    maxBorrowAmount
  );
  
  logger.debug(`Final max borrow amount: $${formatCurrency(maxBorrowAmount)}`);
  logger.debug(`Constraint used: ${maxBorrowReason}`);
  
  // 7. Create the maxBorrowingAmount variables for Financial and Deposit used
  const maxBorrowingAmountFinancialsUsed = `maxBorrowingAmountFinancials_${matchingFinancialsResult.targetLvrBand}`;
  let maxBorrowingAmountDepositUsed = '';
  
  switch (loanScenario) {
    case 'TAILORED':
      maxBorrowingAmountDepositUsed = 'MaxBorrowingAmountDeposit_80_85';
      break;
    case 'OWN_HOME_COMBINED':
    case 'STRAIGHT_UP_POWER_UP_FIXED':
    default:
      maxBorrowingAmountDepositUsed = 'MaxBorrowingAmountDeposit_70_80';
      break;
  }
  
  logger.debug(`Financials version used: ${maxBorrowingAmountFinancialsUsed}`);
  logger.debug(`Deposit version used: ${maxBorrowingAmountDepositUsed}`);
  
  // 8. Return comprehensive result
  return {
    maxBorrowAmount,
    maxBorrowReason,
    maxBorrowingAmountFinancialsUsed,
    maxBorrowingAmountDepositUsed,
    financialsResults,
    depositResults,
    globalLoanMax
  };
} 