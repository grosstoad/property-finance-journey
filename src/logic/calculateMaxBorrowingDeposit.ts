import { DepositDetails, PropertyDetails } from '../types/FinancialTypes';
import { GLOBAL_LIMITS } from '../constants/financialConstants';

export function calculateDepositDetails(
  propertyValue: number,
  savings: number,
  propertyDetails: PropertyDetails
): DepositDetails {
  // Calculate stamp duty (simplified for testing)
  const stampDuty = propertyDetails.isFirstHomeBuyer 
    ? 0 // First home buyers exempt in this test
    : propertyValue * GLOBAL_LIMITS.DEFAULT_STAMP_DUTY_RATE;

  // Calculate deposit amount (savings minus costs)
  const depositAmount = Math.max(0, savings - stampDuty - GLOBAL_LIMITS.DEFAULT_UPFRONT_COSTS);

  return {
    savings,
    depositAmount,
    stampDuty,
    otherCosts: GLOBAL_LIMITS.DEFAULT_UPFRONT_COSTS
  };
} 