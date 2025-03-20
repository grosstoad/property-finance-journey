export interface ImprovementScenario {
  title: string;
  description: string;
  potentialIncrease: number;
  type: 'SAVINGS' | 'EXPENSES' | 'CREDIT' | 'INCOME';
  impact: number;
  newMaxBorrowing: number;
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
} 