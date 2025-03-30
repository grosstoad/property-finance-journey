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
 * @returns The total upfront costs
 */
export const calculateUpfrontCosts = (propertyPrice: number): number => {
  // Base upfront costs are calculated as a percentage of the property price
  // This includes legal fees, inspections, transfer fees, loan establishment fees
  const basePercentage = 0.0015; // .5% of property price for total upfront costs
  
  const baseCosts = propertyPrice * basePercentage;
  
  // Add fixed costs for standard expenses
  const fixedCosts = 1000; // $1000 fixed costs
  
  // Calculate total upfront costs
  const totalUpfrontCosts = baseCosts + fixedCosts;
  
  console.log('Calculated upfront costs:', {
    propertyPrice,
    basePercentage,
    baseCosts,
    fixedCosts,
    totalUpfrontCosts
  });
  
  return totalUpfrontCosts;
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
  const { propertyPrice, savings, state, purpose = 'owner-occupied', firstHomeBuyer = false } = params;
  
  // Calculate upfront costs and stamp duty
  const upfrontCosts = calculateUpfrontCosts(propertyPrice);
  const stampDutyResult = calculateStampDuty({
    propertyPrice,
    state: state as AustralianState,
    purpose,
    firstHomeBuyer
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

/**
 * Calculate the deposit components for a property
 * 
 * @param propertyValue - The value of the property
 * @param state - The Australian state where the property is located
 * @param isFirstHomeBuyer - Whether the buyer is a first home buyer
 * @param isInvestmentProperty - Whether the property is for investment
 * @returns The deposit components (stamp duty, legal fees, upfront costs)
 */
export const calculateDepositComponents = (
  propertyValue: number,
  state: string,
  isFirstHomeBuyer: boolean,
  isInvestmentProperty: boolean
): { 
  stampDuty: number;
  legalFees: number;
  otherUpfrontCosts: number;
} => {
  console.log('Calculating deposit components with:', {
    propertyValue,
    state,
    isFirstHomeBuyer,
    isInvestmentProperty
  });

  // Validate propertyValue to ensure it's not negative
  if (typeof propertyValue !== 'number' || isNaN(propertyValue) || propertyValue < 0) {
    console.error(`Invalid property value: ${propertyValue}, using safe default of 0`);
    // Return safe default values instead of throwing an error
    return {
      stampDuty: 0,
      legalFees: 0,
      otherUpfrontCosts: 0
    };
  }

  // Calculate stamp duty
  const stampDutyResult = calculateStampDuty({
    propertyPrice: propertyValue,
    state: state as AustralianState,
    purpose: isInvestmentProperty ? 'investment' : 'owner-occupied',
    firstHomeBuyer: isFirstHomeBuyer
  });
  
  // Calculate upfront costs
  const upfrontCosts = calculateUpfrontCosts(propertyValue);
  
  // Legal fees are part of upfront costs - assume 30% of upfront costs are legal fees
  const legalFees = upfrontCosts * 0.3;
  const otherUpfrontCosts = upfrontCosts * 0.7;
  
  const result = {
    stampDuty: stampDutyResult.stampDuty,
    legalFees,
    otherUpfrontCosts
  };
  
  console.log('Deposit components calculation result:', {
    stampDuty: result.stampDuty,
    legalFees: result.legalFees, 
    otherUpfrontCosts: result.otherUpfrontCosts,
    total: result.stampDuty + result.legalFees + result.otherUpfrontCosts
  });
  
  return result;
};

export const depositService = {
  calculateUpfrontCosts,
  calculateLoanAmountRequired,
  calculateDepositDetails,
  calculateDepositComponents
}; 