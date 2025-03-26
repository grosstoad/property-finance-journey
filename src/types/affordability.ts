export interface ImprovementScenario {
  title: string;
  description: string;
  potentialIncrease: number;
  type: 'SAVINGS' | 'EXPENSES' | 'CREDIT' | 'INCOME';
  impact: number;
  newMaxBorrowing: number;
  id: string;
  isApplied?: boolean;
}

export interface AffordabilityCalculatorProps {
  propertyPrice: number;
  savings: number;
  propertyState: string;
  propertyPostcode: string;
  isInvestmentProperty: boolean;
  isFirstHomeBuyer: boolean;
  baseInterestRate: number;
  requiredLoanAmount: number;
  onShowLoanOptions: () => void;
}

export interface AffordabilityContextType {
  showAffordability: boolean;
  setShowAffordability: (show: boolean) => void;
  maxBorrowingPower: number;
  setMaxBorrowingPower: (amount: number) => void;
  currentLoanAmount: number;
  setCurrentLoanAmount: (amount: number) => void;
  improvementScenarios: ImprovementScenario[];
  setImprovementScenarios: (scenarios: ImprovementScenario[]) => void;
  loanAmountRequiredMet: boolean;
  setLoanAmountRequiredMet: (isMet: boolean) => void;
  maxBorrowingLimitingFactor: 'deposit' | 'financials' | 'global' | 'unserviceable';
  setMaxBorrowingLimitingFactor: (factor: 'deposit' | 'financials' | 'global' | 'unserviceable') => void;
  selectedLoanAmount: number;
  setSelectedLoanAmount: (amount: number) => void;
  selectedLVR: number;
  setSelectedLVR: (lvr: number) => void;
  selectedPropertyValue: number;
  setSelectedPropertyValue: (value: number) => void;
  selectedDepositAmount: number;
  setSelectedDepositAmount: (amount: number) => void;
  selectedStampDuty: number;
  setSelectedStampDuty: (amount: number) => void;
  selectedUpfrontCosts: number;
  setSelectedUpfrontCosts: (amount: number) => void;
  selectedMonthlyRepayment: number;
  setSelectedMonthlyRepayment: (amount: number) => void;
  affordabilityScenarioUsed: boolean;
  setAffordabilityScenarioUsed: (used: boolean) => void;
  appliedScenarios: string[];
  setAppliedScenarios: (scenarios: string[]) => void;
}

export interface ScenarioState {
  affordabilityScenarioUsed: boolean;
  affordabilityScenarioReasonsUsed: ImprovementScenario[];
}

export interface CustomerMessage {
  title: string;
  message: string;
  isPositive: boolean;
} 