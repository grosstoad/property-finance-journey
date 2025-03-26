/**
 * Types for deposit and loan amount calculations
 */
import { PropertyPurpose, AustralianState, StampDutyResult } from './stampDuty';
import { LoanPurpose } from './loan';

// Deposit calculation parameters
export interface DepositCalculationParams {
  propertyPrice: number;
  savings: number;
  state: AustralianState;
  purpose?: PropertyPurpose;
  firstHomeBuyer?: boolean;
}

// Deposit calculation result
export interface DepositCalculationResult {
  upfrontCosts: number;
  stampDuty: number;
  availableForDeposit: number;
  totalRequiredDeposit: number;
  hasShortfall: boolean;
  shortfallAmount: number;
}

// Loan amount calculation parameters
export interface LoanAmountParams {
  propertyPrice: number;
  availableForDeposit: number;
}

// Loan amount calculation result
export interface LoanAmountResult {
  required: number;
  lvr: number;
} 