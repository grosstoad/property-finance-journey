/**
 * Max Borrow Calculation Module
 * 
 * This module exports functions for calculating maximum borrowing amounts based on
 * financial constraints, deposit constraints, and global limits.
 */

// Export main calculation function
export { calculateMaxBorrowing } from './maxBorrowCalculator';

// We can't export the adapter here because it imports from this file
// This would create a circular dependency
// The adapter should be imported directly where needed

// Export types
export type {
  LvrBand,
  LoanScenario,
  MaxBorrowConstraint,
  FinancialConstraintResult,
  DepositConstraintResult,
  MaxBorrowResult,
  NewLoanDetails
} from './types';

// Export helper functions for testing/debugging
export { calculateMaxBorrowingFinancials } from './maxBorrowFinancials';
export { calculateMaxBorrowingDeposit } from './maxBorrowDeposit';

// Export utilities
export {
  LoggerFactory,
  Logger,
  formatCurrency,
  formatPercent,
  roundToDollar,
  calculateLoanAmountPV,
  deepClone
} from './utilities'; 