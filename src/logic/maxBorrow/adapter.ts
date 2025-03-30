/**
 * Adapter Module for MaxBorrow Calculator
 * 
 * This module adapts the new maxBorrow implementation to be compatible with
 * the old MaxBorrowingResult interface expected by existing components.
 */
import { 
  FinancialsInput, 
  MaxBorrowingResult, 
  LvrFinancialsUsed, 
  LvrDepositUsed,
  LoanPreferences,
  LoanScenario as OldLoanScenario
} from '../../types/FinancialTypes';
import { LoanProductDetails } from '../../types/loan';
import { calculateMaxBorrowing as newCalculateMaxBorrowing } from './maxBorrowCalculator';
import { 
  MaxBorrowConstraint,
  LoanScenario as NewLoanScenario,
  LvrBand
} from './types';

/**
 * Maps the new loan scenario type to the old loan scenario type
 */
function mapLoanScenario(scenario: NewLoanScenario): OldLoanScenario {
  switch (scenario) {
    case 'STRAIGHT_UP_POWER_UP_FIXED':
      return 'SU_PU_FIXED';
    case 'TAILORED':
      return 'TAILORED';
    case 'OWN_HOME_COMBINED':
      return 'OWNHOME_COMBINED';
    default:
      return 'SU_PU_FIXED';
  }
}

/**
 * Maps the new constraint reason to the old reason format
 */
function mapConstraintReason(reason: MaxBorrowConstraint): 'deposit' | 'financials' | 'global' | 'unserviceable' {
  switch (reason) {
    case 'DEPOSIT':
      return 'deposit';
    case 'FINANCIALS':
      return 'financials';
    case 'GLOBAL_MAX':
      return 'global';
    default:
      return 'unserviceable';
  }
}

/**
 * Adapter function to make the new implementation compatible with the old interface
 */
export async function calculateMaxBorrowing(
  financials: FinancialsInput,
  loanProductDetails: LoanProductDetails,
  propertyPrice: number,
  isInvestmentProperty: boolean,
  propertyPostcode: string,
  savings: number,
  propertyState: string,
  isFirstHomeBuyer: boolean,
  requiredLoanAmount: number = 0,
  hasOwnHomeComponent: boolean = false,
  loanPreferences?: LoanPreferences,
  calculateScenarios: boolean = true
): Promise<MaxBorrowingResult> {
  // Call the new implementation
  const result = newCalculateMaxBorrowing(
    financials,
    loanProductDetails,
    propertyPrice,
    isInvestmentProperty,
    propertyPostcode,
    savings,
    propertyState,
    isFirstHomeBuyer,
    requiredLoanAmount,
    hasOwnHomeComponent,
    loanPreferences
  );
  
  // Adapt the result to match the old MaxBorrowingResult interface
  const maxFinancialsResult = result.financialsResults && 
    result.financialsResults[result.maxBorrowingAmountFinancialsUsed.replace('maxBorrowingAmountFinancials_', '') as LvrBand];
  
  const maxDepositResult = result.depositResults && 
    result.depositResults[result.maxBorrowingAmountDepositUsed.replace('MaxBorrowingAmountDeposit_', '') as LvrBand];
  
  // Create compatible result with null checks
  const adaptedResult: MaxBorrowingResult = {
    maxBorrowAmount: result.maxBorrowAmount,
    maxBorrowAmountReason: mapConstraintReason(result.maxBorrowReason),
    
    // Find the matching financials and deposit values with null safety
    maxBorrowingAmountFinancials: maxFinancialsResult?.maxLoanAmount || 0,
    maxBorrowingAmountDeposit: maxDepositResult?.maxLoanAmount || 0,
    
    // Map LVR and property values with null safety
    lvr: maxFinancialsResult?.calculatedLvr || 0,
    depositAmount: maxFinancialsResult?.depositAmount || 0,
    propertyValue: maxFinancialsResult?.maxPropertyAmount || 0,
    
    // Extract all financials band results with null safety
    maxBorrowingAmountFinancials_0_50: result.financialsResults?.['0-50']?.maxLoanAmount || 0,
    maxBorrowingAmountFinancials_50_60: result.financialsResults?.['50-60']?.maxLoanAmount || 0,
    maxBorrowingAmountFinancials_60_70: result.financialsResults?.['60-70']?.maxLoanAmount || 0,
    maxBorrowingAmountFinancials_70_80: result.financialsResults?.['70-80']?.maxLoanAmount || 0,
    maxBorrowingAmountFinancials_80_85: result.financialsResults?.['80-85']?.maxLoanAmount || 0,
    
    // Extract all deposit band results with null safety
    maxBorrowingAmountDeposit_0_50: result.depositResults?.['0-50']?.maxLoanAmount || 0,
    maxBorrowingAmountDeposit_50_60: result.depositResults?.['50-60']?.maxLoanAmount || 0,
    maxBorrowingAmountDeposit_60_70: result.depositResults?.['60-70']?.maxLoanAmount || 0,
    maxBorrowingAmountDeposit_70_80: result.depositResults?.['70-80']?.maxLoanAmount || 0,
    maxBorrowingAmountDeposit_80_85: result.depositResults?.['80-85']?.maxLoanAmount || 0,
    
    // Used version labels
    maxBorrowingAmountFinancialsUsed: result.maxBorrowingAmountFinancialsUsed as LvrFinancialsUsed,
    maxBorrowingAmountDepositUsed: result.maxBorrowingAmountDepositUsed as LvrDepositUsed,
    
    // Map loan scenario
    loanAmountRequiredScenario: mapLoanScenario(
      (result as any).loanScenario || 'STRAIGHT_UP_POWER_UP_FIXED' as NewLoanScenario
    ),
    // Initialize scenarios and appliedScenarioIds as empty arrays initially
    scenarios: [],
    appliedScenarioIds: [],
    // Keep deprecated fields null/undefined for now
    appliedSuggestions_DEPRECATED: undefined,
    suggestionImpacts_DEPRECATED: undefined,
    baseBorrowingAmount: result.maxBorrowAmount // Base amount is the initial calculation
  };
  
  // Calculate improvement scenarios if requested
  if (calculateScenarios) {
    try {
      // Dynamically import to avoid circular dependency issues at module load time
      const { calculateImprovementScenarios } = await import('../calculateImprovementScenarios');
      
      adaptedResult.scenarios = await calculateImprovementScenarios(
        financials,
        adaptedResult, // Pass the partially adapted result
        loanProductDetails,
        savings,
        propertyPrice, // Use original property price for scenario context
        propertyState,
        propertyPostcode,
        isFirstHomeBuyer,
        isInvestmentProperty,
        requiredLoanAmount,
        loanPreferences
      );
      // For now, appliedScenarioIds remains empty until we implement the logic
      // to track applied suggestions within the main journey component.
      // adaptedResult.appliedScenarioIds = ... // Logic to get applied IDs needed here
      
      console.log('[ADAPTER] Improvement scenarios calculated:', adaptedResult.scenarios);
    } catch (error) {
      console.error('[ADAPTER] Error calculating improvement scenarios:', error);
      adaptedResult.scenarios = []; // Ensure it's an empty array on error
      adaptedResult.appliedScenarioIds = [];
    }
  }
  
  return adaptedResult;
} 