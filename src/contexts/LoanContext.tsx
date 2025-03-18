import { createContext, ReactNode, useContext, useState } from 'react';
import { LoanDeposit, LoanAmount, LoanDetails, LoanPurpose } from '../types/loan';

interface LoanContextType {
  loanDeposit: LoanDeposit | null;
  setLoanDeposit: (deposit: LoanDeposit | null) => void;
  loanAmount: LoanAmount | null;
  setLoanAmount: (amount: LoanAmount | null) => void;
  loanDetails: LoanDetails | null;
  setLoanDetails: (details: LoanDetails | null) => void;
  loanPurpose: LoanPurpose;
  setLoanPurpose: (purpose: LoanPurpose) => void;
  isFirstHomeBuyer: boolean;
  setIsFirstHomeBuyer: (isFirstHomeBuyer: boolean) => void;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

interface LoanProviderProps {
  children: ReactNode;
}

export const LoanProvider = ({ children }: LoanProviderProps) => {
  const [loanDeposit, setLoanDeposit] = useState<LoanDeposit | null>(null);
  const [loanAmount, setLoanAmount] = useState<LoanAmount | null>(null);
  const [loanDetails, setLoanDetails] = useState<LoanDetails | null>(null);
  const [loanPurpose, setLoanPurpose] = useState<LoanPurpose>('OWNER_OCCUPIED');
  const [isFirstHomeBuyer, setIsFirstHomeBuyer] = useState<boolean>(false);

  const value = {
    loanDeposit,
    setLoanDeposit,
    loanAmount,
    setLoanAmount,
    loanDetails,
    setLoanDetails,
    loanPurpose,
    setLoanPurpose,
    isFirstHomeBuyer,
    setIsFirstHomeBuyer,
  };

  return (
    <LoanContext.Provider value={value}>
      {children}
    </LoanContext.Provider>
  );
};

export const useLoan = (): LoanContextType => {
  const context = useContext(LoanContext);
  if (context === undefined) {
    throw new Error('useLoan must be used within a LoanProvider');
  }
  return context;
}; 