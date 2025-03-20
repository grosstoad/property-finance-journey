export interface LoanDeposit {
  propertyPrice: number;
  savings: number;
  stampDuty: number;
  upfrontCosts: number;
  availableForDeposit: number;
}

export interface LoanAmount {
  required: number;
  lvr: number; // Loan-to-Value Ratio as a percentage
  maxLvr: number; // Maximum allowed LVR for this property
}

export type LoanPurpose = 'OWNER_OCCUPIED' | 'INVESTMENT';
export type RepaymentType = 'PRINCIPAL_AND_INTEREST' | 'INTEREST_ONLY';
export type InterestRateType = 'VARIABLE' | 'FIXED';
export type LoanFeatureType = 'redraw' | 'offset';

export interface LoanDetails {
  purpose: LoanPurpose;
  amount: number;
  interestRate: number;
  interestRateType: InterestRateType;
  repaymentType: RepaymentType;
  loanTerm: number; // in years
  monthlyRepayment: number;
  isFirstHomeBuyer: boolean;
}

export interface LoanProduct {
  name: string;
  interestRate: number;
  monthlyRepayment: number;
  loanTerm: number; // in years
  features: {
    redraw: boolean;
    offset: boolean;
  };
  fees?: {
    application?: number;
    ongoing?: number;
  };
}

export interface LoanPreferences {
  interestRateType: InterestRateType;
  fixedTerm?: number; // 1-3 years
  loanFeatureType?: LoanFeatureType; // only applicable for Variable
  repaymentType: RepaymentType;
  interestOnlyTerm?: number; // 1-5 years
  loanTerm: number; // 10-30 years
}

export interface LoanProductDetails {
  productName: string;
  brandLogoSrc?: string;
  interestRate: number;
  monthlyRepayment: number;
  loanAmount: number;
  upfrontFee?: number;
  upfrontFeeAmount?: number;
  revertingInterestRate?: number;
  revertingMonthlyRepayment?: number;
  revertingProductName?: string;
}

export interface OwnHomeProductDetails {
  productName: string;
  brandLogoSrc?: string;
  interestRate: number;
  monthlyRepayment: number;
  loanAmount: number;
  upfrontFee?: number;
  upfrontFeeAmount?: number;
  term: number;
} 