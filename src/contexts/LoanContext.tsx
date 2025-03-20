import { createContext, ReactNode, useContext, useState } from 'react';
import { LoanDeposit, LoanAmount, LoanDetails, LoanPurpose, LoanPreferences, LoanProductDetails, OwnHomeProductDetails } from '../types/loan';

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
  loanPreferences: LoanPreferences;
  setLoanPreferences: (preferences: LoanPreferences) => void;
  loanProductDetails: {
    athenaProduct: LoanProductDetails | null;
    ownHomeProduct?: OwnHomeProductDetails | null;
  };
  setLoanProductDetails: (details: {
    athenaProduct: LoanProductDetails | null;
    ownHomeProduct?: OwnHomeProductDetails | null;
  }) => void;
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
  const [loanPreferences, setLoanPreferences] = useState<LoanPreferences>({
    interestRateType: 'VARIABLE',
    repaymentType: 'PRINCIPAL_AND_INTEREST',
    loanFeatureType: 'redraw',
    loanTerm: 30
  });
  const [loanProductDetails, setLoanProductDetails] = useState<{
    athenaProduct: LoanProductDetails | null;
    ownHomeProduct?: OwnHomeProductDetails | null;
  }>({
    athenaProduct: null
  });

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
    loanPreferences,
    setLoanPreferences,
    loanProductDetails,
    setLoanProductDetails
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