import { createContext, ReactNode, useState, useContext } from 'react';
import { AffordabilityContextType, ImprovementScenario } from '../types/affordability';

const initialState: Omit<AffordabilityContextType, 
  'setShowAffordability' | 
  'setMaxBorrowingPower' | 
  'setCurrentLoanAmount' | 
  'setImprovementScenarios' |
  'setLoanAmountRequiredMet' |
  'setMaxBorrowingLimitingFactor' |
  'setSelectedLoanAmount' |
  'setSelectedLVR' |
  'setSelectedPropertyValue' |
  'setSelectedDepositAmount' |
  'setSelectedStampDuty' |
  'setSelectedUpfrontCosts' |
  'setSelectedMonthlyRepayment' |
  'setAffordabilityScenarioUsed' |
  'setAppliedScenarios'
> = {
  // Show/hide affordability
  showAffordability: false,
  
  // Max borrowing
  maxBorrowingPower: 0,
  
  // Loan amount
  currentLoanAmount: 0,
  
  // Improvement scenarios
  improvementScenarios: [],
  
  // Serviceability flags
  loanAmountRequiredMet: false,
  
  // Max borrowing limiting factor
  maxBorrowingLimitingFactor: 'financials',
  
  // Selected loan amount (from slider)
  selectedLoanAmount: 0,
  
  // Selected LVR and property values
  selectedLVR: 0,
  selectedPropertyValue: 0,
  selectedDepositAmount: 0,
  selectedStampDuty: 0,
  selectedUpfrontCosts: 0,
  
  // Selected repayment information
  selectedMonthlyRepayment: 0,
  
  // Improvement scenario application
  affordabilityScenarioUsed: false,
  appliedScenarios: [],
};

export const AffordabilityContext = createContext<AffordabilityContextType>({
  ...initialState,
  setShowAffordability: () => {},
  setMaxBorrowingPower: () => {},
  setCurrentLoanAmount: () => {},
  setImprovementScenarios: () => {},
  setLoanAmountRequiredMet: () => {},
  setMaxBorrowingLimitingFactor: () => {},
  setSelectedLoanAmount: () => {},
  setSelectedLVR: () => {},
  setSelectedPropertyValue: () => {},
  setSelectedDepositAmount: () => {},
  setSelectedStampDuty: () => {},
  setSelectedUpfrontCosts: () => {},
  setSelectedMonthlyRepayment: () => {},
  setAffordabilityScenarioUsed: () => {},
  setAppliedScenarios: () => {},
});

export function AffordabilityProvider({ children }: { children: ReactNode }) {
  const [showAffordability, setShowAffordability] = useState(initialState.showAffordability);
  const [maxBorrowingPower, setMaxBorrowingPower] = useState(initialState.maxBorrowingPower);
  const [currentLoanAmount, setCurrentLoanAmount] = useState(initialState.currentLoanAmount);
  const [improvementScenarios, setImprovementScenarios] = useState<ImprovementScenario[]>(initialState.improvementScenarios);
  
  // Serviceability flags
  const [loanAmountRequiredMet, setLoanAmountRequiredMet] = useState(initialState.loanAmountRequiredMet);
  
  // Max borrowing limiting factor
  const [maxBorrowingLimitingFactor, setMaxBorrowingLimitingFactor] = useState(initialState.maxBorrowingLimitingFactor);
  
  // Selected loan amount (from slider)
  const [selectedLoanAmount, setSelectedLoanAmount] = useState(initialState.selectedLoanAmount);
  
  // Selected LVR and property values
  const [selectedLVR, setSelectedLVR] = useState(initialState.selectedLVR);
  const [selectedPropertyValue, setSelectedPropertyValue] = useState(initialState.selectedPropertyValue);
  const [selectedDepositAmount, setSelectedDepositAmount] = useState(initialState.selectedDepositAmount);
  const [selectedStampDuty, setSelectedStampDuty] = useState(initialState.selectedStampDuty);
  const [selectedUpfrontCosts, setSelectedUpfrontCosts] = useState(initialState.selectedUpfrontCosts);
  
  // Selected repayment information
  const [selectedMonthlyRepayment, setSelectedMonthlyRepayment] = useState(initialState.selectedMonthlyRepayment);
  
  // Improvement scenario application
  const [affordabilityScenarioUsed, setAffordabilityScenarioUsed] = useState(initialState.affordabilityScenarioUsed);
  const [appliedScenarios, setAppliedScenarios] = useState<string[]>(initialState.appliedScenarios);

  const value: AffordabilityContextType = {
    showAffordability,
    setShowAffordability,
    maxBorrowingPower,
    setMaxBorrowingPower,
    currentLoanAmount,
    setCurrentLoanAmount,
    improvementScenarios,
    setImprovementScenarios,
    loanAmountRequiredMet,
    setLoanAmountRequiredMet,
    maxBorrowingLimitingFactor,
    setMaxBorrowingLimitingFactor,
    selectedLoanAmount,
    setSelectedLoanAmount,
    selectedLVR,
    setSelectedLVR,
    selectedPropertyValue,
    setSelectedPropertyValue,
    selectedDepositAmount,
    setSelectedDepositAmount,
    selectedStampDuty,
    setSelectedStampDuty,
    selectedUpfrontCosts,
    setSelectedUpfrontCosts,
    selectedMonthlyRepayment,
    setSelectedMonthlyRepayment,
    affordabilityScenarioUsed,
    setAffordabilityScenarioUsed,
    appliedScenarios,
    setAppliedScenarios,
  };

  return (
    <AffordabilityContext.Provider value={value}>
      {children}
    </AffordabilityContext.Provider>
  );
}

export const useAffordability = () => {
  const context = useContext(AffordabilityContext);
  if (!context) {
    throw new Error('useAffordability must be used within an AffordabilityProvider');
  }
  return context;
}; 