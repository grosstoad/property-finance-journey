/**
 * Types for deposit and loan amount calculations
 */
import { PropertyPurpose, AustralianState, StampDutyResult } from './stampDuty';
import { LoanPurpose } from './loan';

// Upfront costs configuration
export interface UpfrontCostsConfig {
  minAmount: number;
  percentageOfPrice: number;
}

// Deposit calculation parameters
export interface DepositParams {
  propertyPrice: number;
  savings: number;
  state: AustralianState;
  purpose: LoanPurpose;
  firstHomeBuyer: boolean;
  upfrontCostsConfig?: UpfrontCostsConfig;
}

// Deposit calculation result
export interface DepositResult {
  propertyPrice: number;
  savings: number;
  stampDuty: number;
  upfrontCosts: number;
  availableForDeposit: number;
  stampDutyDetails?: StampDutyResult; // Optional details about stamp duty calculation
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