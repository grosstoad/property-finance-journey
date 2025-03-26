/**
 * Max Borrow Financials Calculator
 * 
 * Calculates the maximum borrowing amount based on financial serviceability constraints
 * for all LVR bands using the approach specified in the requirements.
 */
import { FinancialsInput } from '../../types/FinancialTypes';
import { calculateServiceability } from '../calculateServiceability';
import { LvrBand, FinancialConstraintResult, NewLoanDetails } from './types';
import { LoanProductDetails } from '../../types/loan';
import { getProductForLvr } from '../productSelector';
import { depositService } from '../depositService';
import { getLvrBandFromLvr, getLvrUpperBound, isLvrWithinBand } from './maxBorrowDeposit';
import { BUFFER_RATE } from '../../constants/financialConstants';
import { safeNumber } from './utilities';

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
 * Interface for deposit calculation results with calculated total
 */
interface DepositComponentsWithTotal {
  stampDuty: number;
  legalFees: number;
  otherUpfrontCosts: number;
  total: number;
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
 * Calculate the maximum loan amount using Present Value formula for a monthly payment
 * 
 * @param monthlyPayment - The monthly payment amount
 * @param interestRate - The annual interest rate as a decimal
 * @param termInYears - The loan term in years
 * @returns The maximum loan amount
 */
function calculateLoanAmountPV(
  monthlyPayment: number,
  interestRate: number,
  termInYears: number
): number {
  // Ensure inputs are valid numbers
  monthlyPayment = safeNumber(monthlyPayment);
  interestRate = safeNumber(interestRate);
  termInYears = safeNumber(termInYears);
  
  const monthlyRate = interestRate / 12;
  const numberOfPayments = termInYears * 12;
  
  // PV formula: PMT * ((1 - (1 + r)^-n) / r)
  const presentValue = safeNumber(monthlyPayment * ((1 - Math.pow(1 + monthlyRate, -numberOfPayments)) / monthlyRate));
  
  return Math.floor(presentValue); // Round down to whole dollars
}

/**
 * Calculate maximum borrowing amount based on financial serviceability constraints
 * for a specific LVR band.
 */
export function calculateMaxBorrowingByFinancials(
  financials: FinancialsInput,
  loanProductDetails: LoanProductDetails,
  isInvestmentProperty: boolean,
  propertyPostcode: string,
  loanPreferences: any,
  propertyState: string,
  isFirstHomeBuyer: boolean,
  savings: number,
  lvrBand: LvrBand,
  maxIterations: number = 20
): FinancialConstraintResult {
  const logger = LoggerFactory.getLogger('MaxBorrowFinancials');
  
  // Ensure inputs are valid numbers
  savings = safeNumber(savings);
  maxIterations = safeNumber(maxIterations, 20);
  
  // Create safe loan preferences with defaults
  const safePreferences = {
    interestOnlyTerm: loanPreferences?.interestOnlyTerm || 0,
    interestRateType: loanPreferences?.interestRateType || 'VARIABLE',
    fixedTerm: loanPreferences?.fixedTerm || 0,
    loanFeatureType: loanPreferences?.loanFeatureType || 'redraw',
    loanTerm: loanPreferences?.loanTerm || 30
  };
  
  // Extract LVR upper bound from band
  const lvrUpperBound = getLvrUpperBound(lvrBand);
  logger.debug(`Calculating max borrowing by FINANCIALS for LVR band ${lvrBand}`);
  
  // Initialize with a reasonable starting loan amount based on savings and LVR
  const initialLoanAmount = Math.floor(savings * (lvrUpperBound / (1 - lvrUpperBound)));
  
  // Get the product for this LVR band
  const product = getProductForLvr(
    lvrUpperBound, 
    initialLoanAmount, // Use initial loan amount instead of 0
    isInvestmentProperty,
    safePreferences.interestOnlyTerm > 0,
    safePreferences.interestRateType === 'FIXED',
    safePreferences.fixedTerm,
    safePreferences.loanFeatureType
  );
  
  logger.debug(`Selected product: ${product.productName} with rate ${product.interestRate}%`);
  
  // First calculate available surplus with zero loan amount
  const initialServiceability = calculateServiceability(
    financials,
    0, // Zero loan amount to get baseline surplus
    product.interestRate,
    safePreferences.loanTerm,
    isInvestmentProperty,
    propertyPostcode,
    safePreferences.interestOnlyTerm > 0
  );
  
  const availableSurplus = safeNumber(initialServiceability.netSurplusOrDeficit);
  logger.debug(`Initial surplus with zero loan: $${formatCurrency(availableSurplus)}`);
  
  // For owner-occupied loans, do direct calculation using PV formula
  if (!isInvestmentProperty) {
    return calculateMaxLoanForOwnerOccupied(
      financials,
      product,
      loanPreferences,
      propertyPostcode,
      propertyState,
      isFirstHomeBuyer,
      isInvestmentProperty,
      savings,
      lvrBand,
      availableSurplus
    );
  } else {
    // For investment loans, use iterative approach due to tax deductibility
    return calculateMaxLoanForInvestor(
      financials,
      product,
      loanPreferences,
      propertyPostcode,
      propertyState,
      isFirstHomeBuyer,
      isInvestmentProperty,
      savings,
      lvrBand,
      availableSurplus,
      maxIterations
    );
  }
}

/**
 * Calculate max loan for owner-occupied property using PV formula
 */
function calculateMaxLoanForOwnerOccupied(
  financials: FinancialsInput,
  product: LoanProductDetails,
  loanPreferences: any,
  propertyPostcode: string,
  propertyState: string,
  isFirstHomeBuyer: boolean,
  isInvestmentProperty: boolean,
  savings: number,
  lvrBand: LvrBand,
  availableSurplus: number
): FinancialConstraintResult {
  const logger = LoggerFactory.getLogger('MaxBorrowFinancials:OOC');
  
  // Ensure inputs are valid numbers
  savings = safeNumber(savings);
  availableSurplus = safeNumber(availableSurplus);
  
  // Convert annual surplus to monthly
  const monthlyPayment = safeNumber(availableSurplus / 12);
  
  // Apply buffer to interest rate
  const effectiveRate = safeNumber((product.interestRate / 100) + BUFFER_RATE);
  
  // Calculate effective P&I term
  const effectivePITerm = safeNumber(loanPreferences.loanTerm - (loanPreferences.interestOnlyTerm || 0));
  
  logger.debug(`PV Calculation Parameters:`);
  logger.debug(`- Monthly payment: $${monthlyPayment.toFixed(2)}`);
  logger.debug(`- Effective rate: ${(effectiveRate * 100).toFixed(2)}%`);
  logger.debug(`- P&I term: ${effectivePITerm} years`);
  
  // Calculate max loan amount using PV formula
  const maxLoanAmount = calculateLoanAmountPV(
    monthlyPayment,
    effectiveRate,
    effectivePITerm
  );
  
  logger.debug(`Direct PV calculation result: $${formatCurrency(maxLoanAmount)}`);
  
  // Verify with serviceability check
  const validationResult = calculateServiceability(
    financials,
    maxLoanAmount,
    product.interestRate,
    loanPreferences.loanTerm || 30,
    isInvestmentProperty,
    propertyPostcode,
    loanPreferences.interestOnlyTerm > 0
  );
  
  const validationSurplus = safeNumber(validationResult.netSurplusOrDeficit);
  logger.debug(`Validation surplus: $${formatCurrency(validationSurplus)} (should be near 0)`);
  
  // Calculate property value using iterative approach
  const propertyValueResult = calculatePropertyValueFromLoanAmount(
    maxLoanAmount,
    savings,
    propertyState,
    isFirstHomeBuyer,
    isInvestmentProperty
  );
  
  const propertyValue = propertyValueResult.propertyValue;
  const calculatedLvr = maxLoanAmount / propertyValue;
  
  logger.debug(`Property value calculation:`);
  logger.debug(`- Property value: $${formatCurrency(propertyValue)}`);
  logger.debug(`- Calculated LVR: ${formatPercent(calculatedLvr)}`);
  logger.debug(`- Iterations: ${propertyValueResult.iterations}`);
  
  // Determine if LVR is within the target band
  const calculatedLvrBand = getLvrBandFromLvr(calculatedLvr);
  const lvrBandMatchFlag = isLvrWithinBand(calculatedLvr, lvrBand);
  
  logger.debug(`LVR Band Check: Calculated band ${calculatedLvrBand}, Target band ${lvrBand}, Match: ${lvrBandMatchFlag}`);
  
  // Create deposit components for reporting
  const depositComponents = calculateDepositComponentsWithTotal(
    propertyValue,
    propertyState,
    isFirstHomeBuyer,
    isInvestmentProperty
  );
  
  const depositAmount = savings - depositComponents.total;
  
  return {
    maxLoanAmount,
    maxPropertyAmount: propertyValue,
    calculatedLvr,
    targetLvrBand: lvrBand,
    calculatedLvrBand,
    lvrBandMatchFlag,
    investmentPurpose: isInvestmentProperty,
    serviceabilityIterations: 0, // Direct calculation, no iterations
    propertyValueIterations: propertyValueResult.iterations,
    validationSurplus,
    depositAmount,
    stampDuty: depositComponents.stampDuty,
    upfrontCosts: depositComponents.legalFees + depositComponents.otherUpfrontCosts,
    totalCosts: depositComponents.total,
    requiredFromSavings: depositAmount + depositComponents.total,
    availableSavings: savings
  };
}

/**
 * Calculate max loan for investment property using iterative approach
 */
function calculateMaxLoanForInvestor(
  financials: FinancialsInput,
  product: LoanProductDetails,
  loanPreferences: any,
  propertyPostcode: string,
  propertyState: string,
  isFirstHomeBuyer: boolean,
  isInvestmentProperty: boolean,
  savings: number,
  lvrBand: LvrBand,
  initialSurplus: number,
  maxIterations: number
): FinancialConstraintResult {
  const logger = LoggerFactory.getLogger('MaxBorrowFinancials:INV');
  
  // Start with initial estimate from PV formula
  // Convert annual surplus to monthly
  const monthlyPayment = initialSurplus / 12;
  
  // Apply buffer to interest rate
  const effectiveRate = (product.interestRate / 100) + BUFFER_RATE;
  
  // Calculate effective P&I term
  const effectivePITerm = loanPreferences.loanTerm - (loanPreferences.interestOnlyTerm || 0);
  
  logger.debug(`Initial PV Calculation Parameters:`);
  logger.debug(`- Monthly payment: $${monthlyPayment.toFixed(2)}`);
  logger.debug(`- Effective rate: ${(effectiveRate * 100).toFixed(2)}%`);
  logger.debug(`- P&I term: ${effectivePITerm} years`);
  
  // Calculate initial loan amount using PV formula
  let currentLoanAmount = calculateLoanAmountPV(
    monthlyPayment,
    effectiveRate,
    effectivePITerm
  );
  
  logger.debug(`Initial PV calculation result: $${formatCurrency(currentLoanAmount)}`);
  
  // Iterative approach for investor loans
  let iteration = 0;
  let previousSurplus = initialSurplus;
  let currentSurplus = 0;
  let converged = false;
  
  // Binary search approach
  let lowerBound = 0;
  let upperBound = currentLoanAmount * 2; // Start with a generous upper bound
  
  while (iteration < maxIterations && !converged) {
    // Calculate serviceability with current loan amount
    const serviceabilityResult = calculateServiceability(
      financials,
      currentLoanAmount,
      product.interestRate,
      loanPreferences.loanTerm || 30,
      isInvestmentProperty,
      propertyPostcode,
      loanPreferences.interestOnlyTerm > 0
    );
    
    currentSurplus = serviceabilityResult.netSurplusOrDeficit;
    
    logger.debug(`Iteration ${iteration + 1}:`);
    logger.debug(`- Loan amount: $${formatCurrency(currentLoanAmount)}`);
    logger.debug(`- Surplus: $${formatCurrency(currentSurplus)}`);
    
    // Check if we've converged (close enough to zero surplus)
    if (Math.abs(currentSurplus) < 100) { // $100 tolerance as specified in requirements
      converged = true;
      logger.debug(`Converged at iteration ${iteration + 1} with surplus $${formatCurrency(currentSurplus)}`);
    } else {
      // Binary search approach
      if (currentSurplus > 0) {
        // We can borrow more
        lowerBound = currentLoanAmount;
        currentLoanAmount = Math.min(upperBound, currentLoanAmount * 1.1); // Increase by up to 10%
        if (currentLoanAmount === upperBound) {
          // We're at upper bound, take midpoint
          currentLoanAmount = (lowerBound + upperBound) / 2;
        }
      } else {
        // We need to borrow less
        upperBound = currentLoanAmount;
        currentLoanAmount = (lowerBound + currentLoanAmount) / 2;
      }
      
      logger.debug(`- New loan amount: $${formatCurrency(currentLoanAmount)}`);
      logger.debug(`- New bounds: [$${formatCurrency(lowerBound)}, $${formatCurrency(upperBound)}]`);
    }
    
    iteration++;
    previousSurplus = currentSurplus;
  }
  
  // Final value
  const maxLoanAmount = Math.floor(currentLoanAmount);
  
  // Calculate property value using iterative approach
  const propertyValueResult = calculatePropertyValueFromLoanAmount(
    maxLoanAmount,
    savings,
    propertyState,
    isFirstHomeBuyer,
    isInvestmentProperty
  );
  
  const propertyValue = propertyValueResult.propertyValue;
  const calculatedLvr = maxLoanAmount / propertyValue;
  
  logger.debug(`Property value calculation:`);
  logger.debug(`- Property value: $${formatCurrency(propertyValue)}`);
  logger.debug(`- Calculated LVR: ${formatPercent(calculatedLvr)}`);
  logger.debug(`- Iterations: ${propertyValueResult.iterations}`);
  
  // Determine if LVR is within the target band
  const calculatedLvrBand = getLvrBandFromLvr(calculatedLvr);
  const lvrBandMatchFlag = isLvrWithinBand(calculatedLvr, lvrBand);
  
  logger.debug(`LVR Band Check: Calculated band ${calculatedLvrBand}, Target band ${lvrBand}, Match: ${lvrBandMatchFlag}`);
  
  // Create deposit components for reporting
  const depositComponents = calculateDepositComponentsWithTotal(
    propertyValue,
    propertyState,
    isFirstHomeBuyer,
    isInvestmentProperty
  );
  
  const depositAmount = savings - depositComponents.total;
  
  return {
    maxLoanAmount,
    maxPropertyAmount: propertyValue,
    calculatedLvr,
    targetLvrBand: lvrBand,
    calculatedLvrBand,
    lvrBandMatchFlag,
    investmentPurpose: isInvestmentProperty,
    serviceabilityIterations: iteration,
    propertyValueIterations: propertyValueResult.iterations,
    validationSurplus: currentSurplus,
    depositAmount,
    stampDuty: depositComponents.stampDuty,
    upfrontCosts: depositComponents.legalFees + depositComponents.otherUpfrontCosts,
    totalCosts: depositComponents.total,
    requiredFromSavings: depositAmount + depositComponents.total,
    availableSavings: savings
  };
}

/**
 * Calculate property value from loan amount using iterative approach
 */
function calculatePropertyValueFromLoanAmount(
  loanAmount: number,
  savings: number,
  propertyState: string,
  isFirstHomeBuyer: boolean,
  isInvestmentProperty: boolean,
  maxIterations: number = 20
): { propertyValue: number; iterations: number } {
  const logger = LoggerFactory.getLogger('PropertyValueCalculator');
  
  // Define initial bounds for property value
  // Upper bound: loan amount + savings (assuming no costs)
  const upperBoundPropertyValue = loanAmount + savings;
  // Lower bound: 90% of upper bound (reasonable starting point)
  const lowerBoundPropertyValue = (loanAmount + savings) * 0.90;
  
  // Start with average as initial guess
  let propertyValue = (upperBoundPropertyValue + lowerBoundPropertyValue) / 2;
  
  logger.debug(`Initial property value bounds calculation:`);
  logger.debug(`  Upper bound property value: $${formatCurrency(upperBoundPropertyValue)}`);
  logger.debug(`  Lower bound property value: $${formatCurrency(lowerBoundPropertyValue)}`);
  logger.debug(`  Starting property value: $${formatCurrency(propertyValue)}`);

  // Binary search implementation
  let iteration = 0;
  let lowerBound = lowerBoundPropertyValue;
  let upperBound = upperBoundPropertyValue;
  let found = false;
  
  while (iteration < maxIterations && !found) {
    // Calculate stamp duty and costs for this property value
    const depositComponents = calculateDepositComponentsWithTotal(
      propertyValue,
      propertyState,
      isFirstHomeBuyer,
      isInvestmentProperty
    );
    
    // Calculate available deposit from savings after costs
    const availableDeposit = savings - depositComponents.total;
    
    // Calculate required deposit for this property value
    const requiredDeposit = propertyValue - loanAmount;
    
    // Calculate difference between available and required deposit
    const depositDifference = availableDeposit - requiredDeposit;
    
    logger.debug(`Iteration ${iteration + 1}: Property $${formatCurrency(propertyValue)}, ` +
      `Loan $${formatCurrency(loanAmount)}, ` +
      `Required deposit $${formatCurrency(requiredDeposit)}, ` +
      `Costs $${formatCurrency(depositComponents.total)}, ` +
      `Available $${formatCurrency(availableDeposit)}, ` +
      `Difference $${formatCurrency(depositDifference)}`);
    
    // Check if we've found the solution (within $10 tolerance)
    if (Math.abs(depositDifference) < 10) {
      found = true;
      logger.debug(`Convergence achieved at iteration ${iteration + 1}`);
    } else if (depositDifference > 0) {
      // We have more deposit than needed, increase property value
      lowerBound = propertyValue;
      propertyValue = (upperBound + propertyValue) / 2;
    } else {
      // We don't have enough deposit, decrease property value
      upperBound = propertyValue;
      propertyValue = (lowerBound + propertyValue) / 2;
    }
    
    iteration++;
  }
  
  logger.debug(`Property value calculation completed after ${iteration} iterations`);
  logger.debug(`Final property value: $${formatCurrency(propertyValue)}`);
  
  return {
    propertyValue,
    iterations: iteration
  };
}

/**
 * Calculate max borrowing by financials for all LVR bands
 */
export function calculateMaxBorrowingFinancials(
  financials: FinancialsInput,
  loanProductDetails: LoanProductDetails,
  isInvestmentProperty: boolean,
  propertyPostcode: string,
  loanPreferences: any,
  propertyState: string,
  isFirstHomeBuyer: boolean,
  savings: number,
  loanAmountRequiredScenario: string
): Record<LvrBand, FinancialConstraintResult> {
  const logger = LoggerFactory.getLogger('MaxBorrowFinancials');
  logger.debug(`Calculating MaxBorrowFinancials for all LVR bands (scenario: ${loanAmountRequiredScenario})`);

  const lvrBands: LvrBand[] = ['0-50', '50-60', '60-70', '70-80', '80-85'];
  const results: Record<LvrBand, FinancialConstraintResult> = {} as Record<LvrBand, FinancialConstraintResult>;

  // Create safe loan preferences with defaults
  const safePreferences = {
    interestOnlyTerm: loanPreferences?.interestOnlyTerm || 0,
    interestRateType: loanPreferences?.interestRateType || 'VARIABLE',
    fixedTerm: loanPreferences?.fixedTerm || 0,
    loanFeatureType: loanPreferences?.loanFeatureType || 'redraw',
    loanTerm: loanPreferences?.loanTerm || 30
  };

  // Calculate for each LVR band
  for (const lvrBand of lvrBands) {
    logger.debug(`--- Calculating financial constraint for LVR band: ${lvrBand} ---`);
    
    // Get the LVR upper bound for product selection
    const lvrUpperBound = getLvrUpperBound(lvrBand);
    const isTailoredProduct = loanProductDetails.productName.toLowerCase().includes('tailored');
    
    // Get the appropriate product for this LVR band
    let effectiveProduct;
    
    if (lvrBand === '80-85' && !isTailoredProduct && loanAmountRequiredScenario !== 'TAILORED') {
      // For 80-85% band with non-Tailored product, use Tailored product parameters
      logger.debug('Using Tailored product for 80-85% band');
      effectiveProduct = getProductForLvr(
        lvrUpperBound,
        0, // initial loan amount
        isInvestmentProperty,
        safePreferences.interestOnlyTerm > 0,
        false, // Force variable rate for Tailored
        0, // No fixed term for Tailored
        'offset' // Tailored products always have offset
      );
    } else if (lvrBand !== '80-85' && isTailoredProduct && loanAmountRequiredScenario === 'TAILORED') {
      // For lower bands with Tailored product, use Straight Up product parameters
      logger.debug('Using Straight Up product for lower band');
      effectiveProduct = getProductForLvr(
        lvrUpperBound,
        0, // initial loan amount
        isInvestmentProperty,
        safePreferences.interestOnlyTerm > 0,
        safePreferences.interestRateType === 'FIXED',
        safePreferences.fixedTerm,
        'redraw' // Straight Up products use redraw
      );
    } else {
      // Standard product selection
      effectiveProduct = getProductForLvr(
        lvrUpperBound,
        0, // initial loan amount
        isInvestmentProperty,
        safePreferences.interestOnlyTerm > 0,
        safePreferences.interestRateType === 'FIXED',
        safePreferences.fixedTerm,
        safePreferences.loanFeatureType
      );
    }
    
    logger.debug(`Selected product for ${lvrBand}: ${effectiveProduct.productName} with rate ${effectiveProduct.interestRate}%`);
    
    results[lvrBand] = calculateMaxBorrowingByFinancials(
      financials,
      effectiveProduct, // Use the LVR-specific product
      isInvestmentProperty,
      propertyPostcode,
      safePreferences, // Pass safe preferences
      propertyState,
      isFirstHomeBuyer,
      savings,
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