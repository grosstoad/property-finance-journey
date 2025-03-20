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
  type: 'SAVINGS' | 'EXPENSES' | 'CREDIT' | 'INCOME';
  impact: number;
  newMaxBorrowing: number;
}

export type BorrowingConstraint = 'deposit' | 'financials' | 'global'; 