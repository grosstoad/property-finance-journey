import { createContext, ReactNode, useState, useContext, useMemo } from 'react';
import { FinancialsInput, FrequencyType } from '../types/FinancialTypes';

// Initial values for financials
const initialFinancials: FinancialsInput = {
  applicantType: 'individual',
  numDependents: 0,
  applicant1: {
    baseSalaryIncome: { value: 0, frequency: 'yearly' },
    supplementaryIncome: { value: 0, frequency: 'yearly' },
    otherIncome: { value: 0, frequency: 'yearly' },
    rentalIncome: { value: 0, frequency: 'weekly' },
  },
  applicant2: {
    baseSalaryIncome: { value: 0, frequency: 'yearly' },
    supplementaryIncome: { value: 0, frequency: 'yearly' },
    otherIncome: { value: 0, frequency: 'yearly' },
    rentalIncome: { value: 0, frequency: 'weekly' },
  },
  liabilities: {
    expenses: { value: 0, frequency: 'monthly' },
    otherHomeLoanRepayments: { value: 0, frequency: 'monthly' },
    otherLoanRepayments: { value: 0, frequency: 'monthly' },
    creditCardLimit: 0,
  },
};

// Define the context type
interface FinancialsContextType {
  financials: FinancialsInput;
  setFinancials: (financials: FinancialsInput) => void;
  showFinancialsModal: boolean;
  setShowFinancialsModal: (show: boolean) => void;
}

// Create the context with default values
export const FinancialsContext = createContext<FinancialsContextType>({
  financials: initialFinancials,
  setFinancials: () => {},
  showFinancialsModal: false,
  setShowFinancialsModal: () => {},
});

// Provider component
interface FinancialsProviderProps {
  children: ReactNode;
}

export function FinancialsProvider({ children }: FinancialsProviderProps) {
  const [financials, setFinancials] = useState<FinancialsInput>(initialFinancials);
  const [showFinancialsModal, setShowFinancialsModal] = useState<boolean>(false);

  // Memoize the context value object
  const value = useMemo(() => ({
    financials,
    setFinancials,
    showFinancialsModal,
    setShowFinancialsModal,
  }), [
    financials, // Dependency: re-memoize only if financials changes
    showFinancialsModal // Dependency: re-memoize only if showFinancialsModal changes
  ]);

  return (
    <FinancialsContext.Provider value={value}>
      {children}
    </FinancialsContext.Provider>
  );
}

// Hook to use the financials context
export function useFinancials() {
  const context = useContext(FinancialsContext);
  if (!context) {
    throw new Error('useFinancials must be used within a FinancialsProvider');
  }
  return context;
} 