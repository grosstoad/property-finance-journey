import { createContext, ReactNode, useState, useContext } from 'react';
import { AffordabilityContextType, ImprovementScenario } from '../types/affordability';

const initialState: Omit<AffordabilityContextType, 'setShowAffordability' | 'setMaxBorrowingPower' | 'setCurrentLoanAmount' | 'setImprovementScenarios'> = {
  showAffordability: false,
  maxBorrowingPower: 0,
  currentLoanAmount: 0,
  improvementScenarios: [],
};

export const AffordabilityContext = createContext<AffordabilityContextType>({
  ...initialState,
  setShowAffordability: () => {},
  setMaxBorrowingPower: () => {},
  setCurrentLoanAmount: () => {},
  setImprovementScenarios: () => {},
});

export function AffordabilityProvider({ children }: { children: ReactNode }) {
  const [showAffordability, setShowAffordability] = useState(initialState.showAffordability);
  const [maxBorrowingPower, setMaxBorrowingPower] = useState(initialState.maxBorrowingPower);
  const [currentLoanAmount, setCurrentLoanAmount] = useState(initialState.currentLoanAmount);
  const [improvementScenarios, setImprovementScenarios] = useState<ImprovementScenario[]>(initialState.improvementScenarios);

  const value: AffordabilityContextType = {
    showAffordability,
    setShowAffordability,
    maxBorrowingPower,
    setMaxBorrowingPower,
    currentLoanAmount,
    setCurrentLoanAmount,
    improvementScenarios,
    setImprovementScenarios,
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