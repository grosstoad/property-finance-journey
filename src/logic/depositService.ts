/**
 * Deposit calculation service
 * 
 * This service provides functions to calculate deposit and loan amounts
 * for property purchases. It takes into account stamp duty, upfront costs,
 * and available savings to determine deposit and required loan amounts.
 */

import { 
  DepositCalculationParams, 
  DepositCalculationResult,
  LoanAmountParams, 
  LoanAmountResult
} from '../types/deposit';
import {
  DEFAULT_UPFRONT_COSTS,
  DEFAULT_UPFRONT_COSTS_PERCENTAGE,
  DEFAULT_MAX_LVR
} from '../constants/defaultValues';
import { calculateStampDuty } from './stampDutyCalculator';
import { AustralianState } from '../types/stampDuty';

/**
 * Calculate upfront costs for a property purchase
 * 
 * @param propertyPrice - The price of the property
 * @returns The calculated upfront costs
 */
export const calculateUpfrontCosts = (propertyPrice: number): number => {
  if (propertyPrice <= 0) {
    return DEFAULT_UPFRONT_COSTS;
  }

  const calculatedAmount = propertyPrice * DEFAULT_UPFRONT_COSTS_PERCENTAGE;
  return Math.max(calculatedAmount, DEFAULT_UPFRONT_COSTS);
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

/**
 * Calculate deposit details and determine if there's a shortfall
 * 
 * @param params - Deposit calculation parameters
 * @returns Detailed deposit calculation result
 */
export const calculateDepositDetails = (params: DepositCalculationParams): DepositCalculationResult => {
  const { propertyPrice, savings, state } = params;
  
  // Calculate upfront costs and stamp duty
  const upfrontCosts = calculateUpfrontCosts(propertyPrice);
  const stampDutyResult = calculateStampDuty({
    propertyPrice,
    state: state as AustralianState,
    purpose: 'owner-occupied',
    firstHomeBuyer: false
  });
  
  // Calculate available deposit after costs
  const availableForDeposit = Math.max(0, savings - stampDutyResult.stampDuty - upfrontCosts);
  
  // Calculate required deposit (20% of property price)
  const totalRequiredDeposit = propertyPrice * (DEFAULT_MAX_LVR / 100);
  
  // Determine if there's a shortfall
  const hasShortfall = availableForDeposit < totalRequiredDeposit;
  const shortfallAmount = hasShortfall ? totalRequiredDeposit - availableForDeposit : 0;
  
  return {
    upfrontCosts,
    stampDuty: stampDutyResult.stampDuty,
    availableForDeposit,
    totalRequiredDeposit,
    hasShortfall,
    shortfallAmount
  };
}; 