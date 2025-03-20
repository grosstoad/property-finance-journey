/**
 * Deposit calculation service
 * 
 * This service provides functions to calculate deposit and loan amounts
 * for property purchases. It takes into account stamp duty, upfront costs,
 * and available savings to determine deposit and required loan amounts.
 */

import { 
  DepositParams, 
  DepositResult, 
  LoanAmountParams, 
  LoanAmountResult, 
  UpfrontCostsConfig 
} from '../types/deposit';
import {
  DEFAULT_MIN_UPFRONT_COSTS,
  DEFAULT_UPFRONT_COSTS_PERCENTAGE
} from '../constants/defaultValues';
import { calculateStampDuty } from './stampDutyCalculator';
import { PropertyPurpose } from '../types/stampDuty';
import { LoanPurpose } from '../types/loan';

/**
 * Calculate upfront costs for a property purchase
 * 
 * Uses either the configured minimum amount or a percentage of the property price,
 * whichever is greater.
 * 
 * @param propertyPrice - The price of the property
 * @param config - Optional upfront costs configuration
 * @returns The calculated upfront costs
 */
export const calculateUpfrontCosts = (
  propertyPrice: number,
  config?: UpfrontCostsConfig
): number => {
  // Use default values if config not provided
  const minAmount = config?.minAmount ?? DEFAULT_MIN_UPFRONT_COSTS;
  const percentage = config?.percentageOfPrice ?? DEFAULT_UPFRONT_COSTS_PERCENTAGE;
  
  // Calculate upfront costs as the greater of the minimum amount or percentage of price
  const percentageAmount = propertyPrice * percentage;
  return Math.max(minAmount, percentageAmount);
};

/**
 * Calculate deposit and available funds for a property purchase
 * 
 * @param params - Deposit calculation parameters
 * @returns Detailed deposit calculation result
 * @throws Error if property price is negative
 */
export const calculateDeposit = (params: DepositParams): DepositResult => {
  // Debug log: Input parameters
  console.log('Deposit calculation params:', params);
  
  const { 
    propertyPrice, 
    savings, 
    state, 
    purpose, 
    firstHomeBuyer,
    upfrontCostsConfig
  } = params;
  
  // Input validation
  if (propertyPrice < 0) {
    throw new Error('Property price cannot be negative');
  }
  
  if (savings < 0) {
    throw new Error('Savings amount cannot be negative');
  }
  
  // Map loan purpose to stamp duty property purpose
  const stampDutyPurpose: PropertyPurpose = 
    purpose === 'OWNER_OCCUPIED' ? 'owner-occupied' : 'investment';
  
  console.log('Mapped purpose:', { 
    originalPurpose: purpose, 
    stampDutyPurpose, 
    firstHomeBuyer 
  });
  
  // Calculate stamp duty
  const stampDutyParams = {
    state,
    propertyPrice,
    purpose: stampDutyPurpose,
    firstHomeBuyer
  };
  
  const stampDutyResult = calculateStampDuty(stampDutyParams);
  console.log('Stamp duty result:', stampDutyResult);
  
  const stampDuty = stampDutyResult.stampDuty;
  
  // Calculate upfront costs
  const upfrontCosts = calculateUpfrontCosts(propertyPrice, upfrontCostsConfig);
  
  // Calculate available for deposit (cannot be negative)
  const availableForDeposit = Math.max(0, savings - stampDuty - upfrontCosts);
  
  const result = {
    propertyPrice,
    savings,
    stampDuty,
    upfrontCosts,
    availableForDeposit,
    stampDutyDetails: stampDutyResult // Include full stamp duty calculation details
  };
  
  console.log('Final deposit calculation result:', result);
  
  return result;
};

/**
 * Calculate the loan amount required for a property purchase
 * 
 * @param params - Loan amount calculation parameters
 * @returns Loan amount calculation result
 * @throws Error if property price is negative
 */
export const calculateLoanAmountRequired = (params: LoanAmountParams): LoanAmountResult => {
  const { propertyPrice, availableForDeposit } = params;
  
  // Input validation
  if (propertyPrice < 0) {
    throw new Error('Property price cannot be negative');
  }
  
  if (availableForDeposit < 0) {
    throw new Error('Available for deposit cannot be negative');
  }
  
  // Calculate loan amount required (cannot be negative)
  const required = Math.max(0, propertyPrice - availableForDeposit);
  
  // Calculate loan-to-value ratio (LVR)
  const lvr = propertyPrice > 0 ? (required / propertyPrice) * 100 : 0;
  
  return {
    required,
    lvr
  };
}; 