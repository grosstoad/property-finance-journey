/**
 * Type definitions for Max Borrow calculations
 */

/**
 * LVR band type
 */
export type LvrBand = '0-50' | '50-60' | '60-70' | '70-80' | '80-85';

/**
 * Loan amount required scenario type
 */
export type LoanScenario = 'STRAIGHT_UP_POWER_UP_FIXED' | 'TAILORED' | 'OWN_HOME_COMBINED';

/**
 * Max borrow constraint type - identifies which constraint determined the max borrow amount
 */
export type MaxBorrowConstraint = 'FINANCIALS' | 'DEPOSIT' | 'GLOBAL_MAX';

/**
 * Financial constraint result for a specific LVR band
 */
export interface FinancialConstraintResult {
  maxLoanAmount: number;
  maxPropertyAmount: number;
  calculatedLvr: number;
  targetLvrBand: LvrBand;
  calculatedLvrBand: LvrBand;
  lvrBandMatchFlag: boolean;
  investmentPurpose: boolean;
  serviceabilityIterations: number;
  propertyValueIterations: number;
  validationSurplus: number;
  depositAmount: number;
  stampDuty: number;
  upfrontCosts: number;
  totalCosts: number;
  requiredFromSavings: number;
  availableSavings: number;
}

/**
 * Deposit constraint result for a specific LVR band
 */
export interface DepositConstraintResult {
  maxLoanAmount: number;
  maxPropertyAmount: number;
  calculatedLvr: number;
  targetLvrBand: LvrBand;
  calculatedLvrBand: LvrBand;
  lvrBandMatchFlag: boolean;
  investmentPurpose: boolean;
  propertyValueIterations: number;
  depositAmount: number;
  stampDuty: number;
  upfrontCosts: number;
  totalCosts: number;
  requiredFromSavings: number;
  availableSavings: number;
  remainingSavings: number;
}

/**
 * Complete Max Borrow calculation result
 */
export interface MaxBorrowResult {
  maxBorrowAmount: number;
  maxBorrowReason: MaxBorrowConstraint;
  maxBorrowingAmountFinancialsUsed: string; // e.g. 'maxBorrowingAmountFinancials_70_80'
  maxBorrowingAmountDepositUsed: string; // e.g. 'MaxBorrowingAmountDeposit_70_80'
  financialsResults: Record<LvrBand, FinancialConstraintResult>;
  depositResults: Record<LvrBand, DepositConstraintResult>;
  globalLoanMax: number;
}

/**
 * New loan details interface for passing to serviceability calculation
 */
export interface NewLoanDetails {
  loanAmount: number;
  interestRateOngoing: number;
  loanTerm: number;
  interestOnlyPeriod: number;
  negativeGearingPercentage: number;
} 