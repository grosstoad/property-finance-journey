import { LoanDeposit, LoanAmount, LoanDetails, LoanPurpose } from '../types/loan';
import { DEFAULT_UPFRONT_COSTS, DEFAULT_MAX_LVR } from '../constants/defaultValues';
import { calculateStampDuty } from './stampDutyService';
import { calculateDeposit } from './depositService';
import { calculateLoanAmountRequired } from './depositService';

/**
 * Calculate deposit and available funds
 */
export const calculateLoanDeposit = (
  propertyPrice: number,
  savings: number,
  state: string,
  purpose: LoanPurpose,
  isFirstHomeBuyer: boolean
): LoanDeposit => {
  const stampDuty = calculateStampDuty(propertyPrice, state, purpose, isFirstHomeBuyer);
  const upfrontCosts = DEFAULT_UPFRONT_COSTS;
  const availableForDeposit = Math.max(0, savings - stampDuty - upfrontCosts);
  
  return {
    propertyPrice,
    savings,
    stampDuty,
    upfrontCosts,
    availableForDeposit,
  };
};

/**
 * Calculate loan amount required and LVR
 * This is a wrapper around the deposit and loan amount calculation functions
 * that adds the maxLvr calculation based on postcode
 */
export const calculateLoanAmount = (
  propertyPrice: number,
  savings: number,
  state: string,
  purpose: LoanPurpose,
  firstHomeBuyer: boolean,
  postcode: string
): LoanAmount => {
  // Calculate deposit using depositService
  const depositResult = calculateDeposit({
    propertyPrice,
    savings,
    state: state as any, // Using any as a temporary solution
    purpose,
    firstHomeBuyer
  });
  
  // Calculate loan amount using depositService
  const loanAmountResult = calculateLoanAmountRequired({
    propertyPrice,
    availableForDeposit: depositResult.availableForDeposit
  });
  
  // Determine max LVR based on property postcode
  let maxLvr = DEFAULT_MAX_LVR;
  
  // If the postcode is in a high-density area, reduce maxLvr
  if (['2000', '3000', '4000'].includes(postcode)) {
    maxLvr = 70;
  }
  
  return {
    required: loanAmountResult.required,
    lvr: loanAmountResult.lvr,
    maxLvr
  };
};

/**
 * Calculate monthly repayments for a loan
 * Uses a simplified formula for demonstration purposes
 */
export const calculateMonthlyRepayment = (
  loanAmount: number,
  interestRate: number,
  loanTerm: number
): number => {
  // Convert annual interest rate to monthly rate
  const monthlyRate = interestRate / 100 / 12;
  
  // Calculate total number of payments
  const numberOfPayments = loanTerm * 12;
  
  // Calculate monthly payment using the formula for fixed-rate mortgage
  const monthlyPayment = 
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  return monthlyPayment;
}; 