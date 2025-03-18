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