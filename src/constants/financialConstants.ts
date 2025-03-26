export const GLOBAL_LIMITS = {
  MIN_PROPERTY_VALUE: 100000,
  MAX_PROPERTY_VALUE: 10000000,
  MIN_DEPOSIT_PERCENTAGE: 5,
  DEFAULT_UPFRONT_COSTS: 5000, // Legal fees, inspections, etc.
  DEFAULT_STAMP_DUTY_RATE: 0.04, // 4% for testing
  MAX_DEPENDENTS_FOR_HEM: 3, // Maximum dependents considered for HEM
  MAX_BORROWING: 3000000, // $3M maximum loan amount
  MIN_LOAN_AMOUNT: 100000, // $100K minimum loan amount
  MIN_LOAN_TERM: 10, // 10 years minimum loan term
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
export const BUFFER_RATE = 0.03; // Buffer rate as decimal (3%)

// Loan repayment buffering factors
export const LOAN_BUFFERING = {
  HOME_LOAN: 1.3, // 30% buffer for existing home loans
  OTHER_LOAN: 1.0  // No additional buffer for other loans
};

// Income shading factors (what % of income is considered)
export const INCOME_SHADING = {
  EMPLOYMENT: {
    FULL_TIME: 0.9, // 90% of full-time income
    PART_TIME: 0.9, // 90% of part-time income
    CASUAL: 0.8, // 80% of casual income
    CONTRACT: 0.8, // 80% of contract income
    SELF_EMPLOYED: 0.8 // 80% of self-employed income
  },
  OTHER: {
    RENTAL_INCOME: 0.8, // 80% of rental income
    DIVIDENDS: 0.8, // 80% of dividend income
    INTEREST: 0.8, // 80% of interest income
    GOVERNMENT_BENEFITS: 0.8, // 80% of government benefits
    CHILD_SUPPORT: 0.8 // 80% of child support
  }
};

// Frequency multipliers
export const FREQUENCY_MULTIPLIERS = {
  weekly: 52,
  fortnightly: 26,
  monthly: 12,
  yearly: 1
};

// HEM-related constants
export const HEM_CONSTANTS = {
  DEFAULT_LOCATION_ID: 1, // Default to metropolitan if postcode not found
  MAX_DEPENDENTS: 3 // Max dependents for HEM calculation
};

// Expense categories
export const EXPENSE_CATEGORIES = {
  FIXED: ['HOUSING', 'UTILITIES', 'INSURANCE', 'TRANSPORT', 'EDUCATION'],
  LIVING: ['GROCERIES', 'DINING', 'HEALTH', 'PERSONAL', 'ENTERTAINMENT'],
  INVESTMENT: ['INVESTMENT_PROPERTY', 'SHARES', 'OTHER_INVESTMENTS']
};

// Debt calculations
export const DEBT_CALCULATIONS = {
  CREDIT_CARD_REPAYMENT_FACTOR: 0.038, // 3.8% of credit card limit per month
  LOAN_DEFAULT_TERM: 5 // Default term for personal loans (years)
};

// Expense assumptions
export const MONTHLY_UTILITIES = 200;
export const MONTHLY_INSURANCE = 150;
export const MONTHLY_MAINTENANCE = 200;
export const MONTHLY_STRATA = 500;
export const MONTHLY_COUNCIL_RATES = 150;

// Income multipliers
export const SINGLE_INCOME_MULTIPLIER = 5;
export const DUAL_INCOME_MULTIPLIER = 6;

// Deposit thresholds
export const RECOMMENDED_DEPOSIT_PERCENTAGE = 20;

// LMI thresholds
export const LMI_THRESHOLD_LVR = 80; // percentage
export const LMI_RATE = 0.02; // 2% of loan amount 

// Income shading factors
export const INCOME_SHADING_FACTORS = {
  BASE_INCOME: 1.0,
  SUPPLEMENTARY_INCOME: 0.9,
  OTHER_INCOME: 0.8,
  RENTAL_INCOME: 0.8,
};

// Expense shading factors
export const EXPENSE_SHADING_FACTORS = {
  HOME_LOAN_REPAYMENTS: 1.3,
  OTHER_LOAN_REPAYMENTS: 1.0,
  CREDIT_CARD_REPAYMENT_FACTOR: 0.038, // 3.8% monthly payment on credit card limit
};

// Loan assessment factors
export const LOAN_ASSESSMENT_FACTORS = {
  NEW_LOAN_BUFFER: 0.02, // Additional 2% buffer on interest rate for assessment
};

// Tax calculation constants
export const TAX_BRACKETS = [
  { lowBound: 0, highBound: 18200, rate: 0, base: 0 },
  { lowBound: 18200, highBound: 45000, rate: 0.16, base: 0 },
  { lowBound: 45000, highBound: 135000, rate: 0.3, base: 4288 },
  { lowBound: 135000, highBound: 190000, rate: 0.37, base: 31288 },
  { lowBound: 190000, highBound: 999999999, rate: 0.45, base: 51638 },
];

export const LOW_INCOME_TAX_OFFSET = [
  { lowBound: 0, highBound: 37500, rate: 0, base: 700 },
  { lowBound: 37500, highBound: 45000, rate: 0.05, base: 700 },
  { lowBound: 45000, highBound: 66667, rate: 0.02, base: 325 },
  { lowBound: 66667, highBound: 999999999, rate: 0, base: 0 },
];

export const MEDICARE_LEVY = [
  { lowBound: 0, highBound: 24276, rate: 0, base: 0 },
  { lowBound: 24277, highBound: 30345, rate: 0.1, base: 0 },
  { lowBound: 30346, highBound: 999999999, rate: 0.02, base: 606.9 },
];

// Frequency conversion factors
export const FREQUENCY_CONVERSION = {
  WEEKLY_TO_ANNUAL: 52,
  FORTNIGHTLY_TO_ANNUAL: 26,
  MONTHLY_TO_ANNUAL: 12,
  ANNUAL_TO_WEEKLY: 1/52,
  ANNUAL_TO_FORTNIGHTLY: 1/26,
  ANNUAL_TO_MONTHLY: 1/12,
};

// LVR bands
export const LVR_BANDS = {
  BAND_0_50: { min: 0, max: 50 },
  BAND_50_60: { min: 50, max: 60 },
  BAND_60_70: { min: 60, max: 70 },
  BAND_70_80: { min: 70, max: 80 },
  BAND_80_85: { min: 80, max: 85 },
};

// Rounding rules
export const ROUNDING_RULES = {
  LOAN_AMOUNT: 'floor', // Round down to nearest dollar
  TAX_CALCULATION: 'twoDecimal', // Round to two decimal places
}; 