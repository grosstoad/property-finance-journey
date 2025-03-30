import { LoanProductDetails } from './loan'; // Assuming loan.ts is in the same directory or adjust path

export enum PropertyType {
  HOUSE = 'HOUSE',
  UNIT = 'UNIT',
  TOWNHOUSE = 'TOWNHOUSE',
  LAND = 'LAND'
}

export enum LoanPurposeType {
  OWNER_OCCUPIED = 'OWNER_OCCUPIED',
  INVESTMENT = 'INVESTMENT'
}

export interface PropertyDetails {
  address: string;
  postcode: string;
  propertyType: PropertyType;
  propertyValue: number;
  purpose: LoanPurposeType;
  isFirstHomeBuyer: boolean;
}

export interface DepositDetails {
  savings: number;
  depositAmount: number;
  stampDuty: number;
  otherCosts: number;
}

export type FrequencyType = 'weekly' | 'fortnightly' | 'monthly' | 'yearly';

export interface IncomeInput {
  value: number;
  frequency: FrequencyType;
}

export interface ApplicantFinancials {
  baseSalaryIncome: IncomeInput;
  supplementaryIncome: IncomeInput;
  otherIncome: IncomeInput;
  rentalIncome: IncomeInput;
}

export interface LiabilitiesInput {
  expenses: IncomeInput;
  otherHomeLoanRepayments: IncomeInput;
  otherLoanRepayments: IncomeInput;
  creditCardLimit: number;
}

export interface FinancialsInput {
  applicantType: 'individual' | 'joint';
  numDependents: number;
  applicant1: ApplicantFinancials;
  applicant2?: ApplicantFinancials;
  liabilities: LiabilitiesInput;
}

export interface ImprovementScenario {
  title: string;
  description: string;
  potentialIncrease: number;
  type: 'SAVINGS' | 'EXPENSES' | 'CREDIT' | 'INCOME' | 'GLOBAL_MAX';
  impact: number;
  newMaxBorrowing: number;
  id: string;
  isApplied?: boolean;
  evaluationCriteria?: string;
}

export type BorrowingConstraint = 'deposit' | 'financials' | 'global' | 'unserviceable';

// HEM-related types
export type MaritalStatusType = 'single' | 'married';

export interface HEMParameters {
  postcode: string;
  grossIncome: number;
  maritalStatus: MaritalStatusType;
  dependents: number;
}

export interface HEMResult {
  weeklyValue: number;
  annualValue: number;
  locationId: number;
  incomeRangeId: number;
}

export interface PostcodeLVR {
  propertyTypeId: PropertyType;
  postcode: string;
  allowed: number; // Maximum allowed LVR percentage
}

// New types for serviceability calculations

export interface ApplicantIncome {
  grossIncome: number;
  grossShadedIncome: number;
  grossShadedGearingIncome: number;
  incomeTax: number;
  lowIncomeTaxOffset: number;
  medicareLevy: number;
  tax: number;
  netIncome: number;
}

export interface TaxCalculationResult {
  incomeTax: number;
  lowIncomeTaxOffset: number;
  medicareLevy: number;
  totalTax: number;
}

export interface BufferedLiabilities {
  bufferedHomeLoanRepayments: number;
  bufferedOtherLoanRepayments: number;
  bufferedCreditCardRepayments: number;
  totalBufferedLiabilities: number;
}

export interface NewLoanDetails {
  loanAmount: number;
  interestRateOngoing: number;
  loanTerm: number;
  interestOnlyPeriod: number;
  negativeGearingPercentage: number;
}

export interface NewLoanCalculation {
  principalAndInterestTerm: number;
  averageAnnualInterest: number;
  bufferedRate: number;
  monthlyRepayment: number;
  annualRepayment: number;
}

export interface ServiceabilityResult {
  isServiceable: boolean;
  loanAmountRequiredMet: boolean;
  netSurplusOrDeficit: number;
  householdGrossIncome: number;
  householdGrossShadedIncome: number;
  householdNetIncome: number;
  serviceabilityExpenses: number;
  isUsingHEM: boolean;
  hemAmount: number;
  declaredExpenses: number;
  applicant1Income?: ApplicantIncome;
  applicant2Income?: ApplicantIncome;
  bufferedLiabilities: BufferedLiabilities;
  newLoansInterestDeduction: number;
  newLoansBufferedRepayments: number;
  newLoanCalculations?: { [key: string]: any }; // Details for individual loans
  applicantCount?: number; // Number of applicants in the calculation
}

export interface LVRBand {
  min: number;
  max: number;
}

// Add LVR band identifier types
export type LvrFinancialsUsed = 
  | 'maxBorrowingAmountFinancials_0_50'
  | 'maxBorrowingAmountFinancials_50_60'
  | 'maxBorrowingAmountFinancials_60_70'
  | 'maxBorrowingAmountFinancials_70_80'
  | 'maxBorrowingAmountFinancials_80_85';

export type LvrDepositUsed = 
  | 'maxBorrowingAmountDeposit_0_50'
  | 'maxBorrowingAmountDeposit_50_60'
  | 'maxBorrowingAmountDeposit_60_70'
  | 'maxBorrowingAmountDeposit_70_80'
  | 'maxBorrowingAmountDeposit_80_85';

export type LoanScenario = 'SU_PU_FIXED' | 'TAILORED' | 'OWNHOME_COMBINED';

// Import and re-export the correct type
export type { LoanPreferences } from './loan';

// Add interface for affordability suggestions
export interface AffordabilitySuggestions {
  longerLoanTerm?: boolean;
  jointApplication?: boolean;
  lowerInterestRate?: boolean;
  increaseSavings?: boolean;
  reduceExpenses?: boolean;
}

export interface SuggestionImpacts {
  longerLoanTerm?: number;
  jointApplication?: number;
  lowerInterestRate?: number;
  increaseSavings?: number;
  reduceExpenses?: number;
}

/**
 * Reason why max borrowing amount was determined
 * - 'financials': Limited by serviceability calculation
 * - 'unserviceable': Cannot service any loan amount
 * - 'deposit': Limited by available deposit
 * - 'global': Hit global lending limit
 */
export type MaxBorrowAmountReason = 'financials' | 'unserviceable' | 'deposit' | 'global';

export interface MaxBorrowingResult {
  maxBorrowAmount: number;
  maxBorrowAmountReason: MaxBorrowAmountReason;
  maxBorrowingAmountFinancials: number;
  maxBorrowingAmountDeposit: number;
  lvr: number;
  depositAmount: number;
  propertyValue: number;
  maxBorrowingAmountFinancials_0_50: number;
  maxBorrowingAmountFinancials_50_60: number;
  maxBorrowingAmountFinancials_60_70: number;
  maxBorrowingAmountFinancials_70_80: number;
  maxBorrowingAmountFinancials_80_85: number;
  maxBorrowingAmountDeposit_0_50: number;
  maxBorrowingAmountDeposit_50_60: number;
  maxBorrowingAmountDeposit_60_70: number;
  maxBorrowingAmountDeposit_70_80: number;
  maxBorrowingAmountDeposit_80_85: number;
  maxBorrowingAmountFinancialsUsed: LvrFinancialsUsed;
  maxBorrowingAmountDepositUsed: LvrDepositUsed;
  loanAmountRequiredScenario: LoanScenario;
  // Update properties for affordability suggestions
  scenarios?: ImprovementScenario[]; // Store the full scenario objects
  appliedScenarioIds?: string[]; // Store IDs of applied scenarios
  // Keep original fields for potential backward compatibility or detailed logging if needed
  appliedSuggestions_DEPRECATED?: AffordabilitySuggestions; 
  suggestionImpacts_DEPRECATED?: SuggestionImpacts; 
  baseBorrowingAmount?: number; // Base amount before applying suggestions
} 