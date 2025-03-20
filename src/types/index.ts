// Export from deposit
export { 
  type DepositCalculationParams,
  type DepositCalculationResult,
  type LoanAmountParams,
  type LoanAmountResult
} from './deposit';

// Export from FinancialTypes
export { 
  type PropertyType,
  type LoanPurposeType,
  type PropertyDetails,
  type DepositDetails,
  type FrequencyType,
  type IncomeInput,
  type ApplicantFinancials,
  type LiabilitiesInput,
  type FinancialsInput,
  type ImprovementScenario,
  type BorrowingConstraint
} from './FinancialTypes';

// Export from loan
export {
  type LoanAmount,
  type LoanPurpose,
  type LoanProductDetails,
  type LoanPreferences
} from './loan';

// Export from stampDuty
export {
  type StampDutyResult,
  type StampDutyBreakdown
} from './stampDuty';

// Export from affordability
export { 
  type AffordabilityCalculatorProps,
  type AffordabilityContextType
} from './affordability';

// Export from property
export { 
  type Property,
  type PropertyAddress,
  type PropertyValuation 
} from './property';

// Export from proptrack
export {
  type PropertyAttributes
} from './proptrack'; 