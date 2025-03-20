export const GLOBAL_LIMITS = {
  MIN_PROPERTY_VALUE: 100000,
  MAX_PROPERTY_VALUE: 10000000,
  MIN_DEPOSIT_PERCENTAGE: 5,
  DEFAULT_UPFRONT_COSTS: 5000, // Legal fees, inspections, etc.
  DEFAULT_STAMP_DUTY_RATE: 0.04 // 4% for testing
}; 

// Default values for financial calculations
export const DEFAULT_LOAN_TERM = 30; // years
export const DEFAULT_INTEREST_RATE = 5.5; // percentage
export const DEFAULT_MONTHLY_EXPENSES = 2500; // dollars
export const DEFAULT_ANNUAL_INCOME = 80000; // dollars
export const DEFAULT_MONTHLY_INCOME = DEFAULT_ANNUAL_INCOME / 12;

// Loan-to-Value Ratio (LVR) thresholds
export const MIN_LVR = 60; // percentage
export const MAX_LVR = 95; // percentage
export const STANDARD_LVR = 80; // percentage

// Serviceability thresholds
export const MIN_DSR = 0.3; // Debt Service Ratio
export const MAX_DSR = 0.4;
export const BUFFER_RATE = 3.0; // percentage points added to actual rate

// Income multipliers
export const SINGLE_INCOME_MULTIPLIER = 5;
export const DUAL_INCOME_MULTIPLIER = 6;

// Deposit thresholds
export const RECOMMENDED_DEPOSIT_PERCENTAGE = 20;

// LMI thresholds
export const LMI_THRESHOLD_LVR = 80; // percentage
export const LMI_RATE = 0.02; // 2% of loan amount

// Expense assumptions
export const MONTHLY_UTILITIES = 200;
export const MONTHLY_INSURANCE = 150;
export const MONTHLY_MAINTENANCE = 200;
export const MONTHLY_STRATA = 500;
export const MONTHLY_COUNCIL_RATES = 150; 