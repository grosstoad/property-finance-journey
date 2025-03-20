import { Box, Card, Typography, styled } from '@mui/material';
import { useContext, useEffect } from 'react';
import { AffordabilityContext } from '../../contexts/AffordabilityContext';
import { FinancialsContext } from '../../contexts/FinancialsContext';
import { AffordabilityCalculatorProps, ImprovementScenario } from '../../types';
import { BorrowingPowerDisplay } from './BorrowingPowerDisplay';
import { ImprovementSuggestions } from './ImprovementSuggestions';
import { LoanProductCard } from '../LoanProductCard';
import { calculateMaxBorrowingByDeposit } from '../../logic/calculateMaxBorrowingByDeposit';
import { calculateMaxBorrowingByFinancials } from '../../logic/calculateMaxBorrowingByFinancials';
import { formatCurrency } from '../../logic/formatters';
import { convertToMonthly } from '../../logic/frequencyConverter';
import { useLoanProducts } from '../../hooks';
import { ATHENA_LOGO_URL } from '../../constants';

const CardContainer = styled(Card)(({ theme }) => ({
  maxWidth: 700,
  margin: '0 auto',
  padding: theme.spacing(3),
}));

const InfoBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.info.light,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  color: theme.palette.info.contrastText,
}));

function getInfoBoxMessage(maxBorrowingPower: number, requiredLoanAmount: number) {
  if (maxBorrowingPower >= requiredLoanAmount) {
    return {
      title: 'Good news!',
      message: 'Based on your financial situation, you can borrow enough for this property.',
    };
  }
  return {
    title: 'Let\'s explore your options',
    message: 'Your current borrowing power is below the required loan amount. Here are some ways to improve it:',
  };
}

export function AffordabilityCalculator({
  propertyPrice,
  savings,
  propertyState,
  propertyPostcode,
  isInvestmentProperty,
  isFirstHomeBuyer,
  baseInterestRate,
  requiredLoanAmount,
  onShowLoanOptions,
}: AffordabilityCalculatorProps) {
  const { financials } = useContext(FinancialsContext);
  const {
    maxBorrowingPower,
    setMaxBorrowingPower,
    currentLoanAmount,
    setCurrentLoanAmount,
    improvementScenarios,
    setImprovementScenarios,
  } = useContext(AffordabilityContext);

  const { loanProductDetails, updateLoanPreferences } = useLoanProducts();

  // Calculate maximum borrowing powers
  useEffect(() => {
    if (!propertyPrice || !savings || !baseInterestRate || !financials) {
      console.log('Missing required values:', { propertyPrice, savings, baseInterestRate, financials });
      return;
    }

    console.log('Calculating with inputs:', {
      savings,
      propertyState,
      isFirstHomeBuyer,
      isInvestmentProperty,
      baseSalaryIncome: financials.applicant1.baseSalaryIncome,
      expenses: financials.liabilities.expenses,
      creditCardLimit: financials.liabilities.creditCardLimit
    });

    const maxDepositAmount = calculateMaxBorrowingByDeposit(
      savings,
      propertyState,
      isFirstHomeBuyer,
      isInvestmentProperty,
      0.8
    );
    console.log('Max borrowing by deposit:', maxDepositAmount);

    const termMonths = 30 * 12; // Assuming a 30-year loan term
    const maxLoanAmount = calculateMaxBorrowingByFinancials(
      financials,
      baseInterestRate,
      termMonths / 12, // Convert months to years
      propertyPrice,
      isInvestmentProperty
    ).maxLoanAmount;
    console.log('Max borrowing by financials:', maxLoanAmount);

    const calculatedMax = Math.min(
      maxDepositAmount,
      maxLoanAmount,
      2500000 // Global maximum
    );
    
    console.log('Final calculated max:', calculatedMax, 'Limited by:', 
      calculatedMax === maxDepositAmount ? 'deposit' :
      calculatedMax === maxLoanAmount ? 'financials' : 'global cap');
    
    setMaxBorrowingPower(calculatedMax);
    
    // Set initial loan amount based on required amount or max borrowing power
    const initialLoanAmount = calculatedMax >= requiredLoanAmount 
      ? requiredLoanAmount 
      : calculatedMax;
    setCurrentLoanAmount(initialLoanAmount);

    // Generate improvement scenarios based on constraints
    const scenarios: ImprovementScenario[] = [];
    
    // If deposit is the constraint
    if (maxDepositAmount < maxLoanAmount) {
      const depositIncreases = [20000, 50000, 100000];
      
      depositIncreases.forEach(increase => {
        const newSavings = savings + increase;
        const newMaxDeposit = calculateMaxBorrowingByDeposit(
          newSavings,
          propertyState,
          isFirstHomeBuyer,
          isInvestmentProperty,
          0.8
        );
        const borrowingIncrease = newMaxDeposit - maxDepositAmount;

        scenarios.push({
          title: 'Increase your deposit',
          description: `Save an additional ${formatCurrency(increase)} to increase your maximum borrowing power by ${formatCurrency(borrowingIncrease)}`,
          type: 'SAVINGS',
          potentialIncrease: increase,
          impact: borrowingIncrease,
          newMaxBorrowing: newMaxDeposit
        });
      });
    }

    // If financials are the constraint
    if (maxLoanAmount < maxDepositAmount) {
      // Calculate HEM
      let hem = 25000; // Base annual HEM
      if (financials.applicantType === 'joint') {
        hem += 25000 * 0.6; // Add 60% for second applicant
      }
      hem += financials.numDependents * 5000; // Add for dependents
      
      const monthlyHem = hem / 12;
      const monthlyExpenses = convertToMonthly(
        financials.liabilities.expenses.value,
        financials.liabilities.expenses.frequency
      );

      // Minimum expenses suggestion (if above HEM)
      if (monthlyExpenses > monthlyHem) {
        const expenseReduction = monthlyExpenses - monthlyHem;
        const annualReduction = expenseReduction * 12;
        scenarios.push({
          title: 'Reduce expenses to minimum',
          description: `Reducing your monthly expenses by ${formatCurrency(expenseReduction)} could increase your borrowing power`,
          type: 'EXPENSES',
          potentialIncrease: annualReduction,
          impact: annualReduction * 4, // Approximate impact on borrowing power
          newMaxBorrowing: maxLoanAmount + (annualReduction * 4)
        });
      }

      // Credit card reduction (if limit > 0)
      if (financials.liabilities.creditCardLimit > 0) {
        const creditImpact = financials.liabilities.creditCardLimit * 4;
        scenarios.push({
          title: 'Close credit cards',
          description: `Closing your credit cards with total limit of ${formatCurrency(financials.liabilities.creditCardLimit)} could increase your borrowing power`,
          type: 'CREDIT',
          potentialIncrease: financials.liabilities.creditCardLimit,
          impact: creditImpact,
          newMaxBorrowing: maxLoanAmount + creditImpact
        });
      }
    }

    setImprovementScenarios(scenarios);

  }, [financials, savings, propertyPrice, baseInterestRate, isInvestmentProperty, propertyState, isFirstHomeBuyer, requiredLoanAmount]);

  const infoBox = getInfoBoxMessage(maxBorrowingPower, requiredLoanAmount);

  // Calculate monthly repayment
  const monthlyRate = baseInterestRate / 100 / 12;
  const termMonths = 30 * 12;
  const monthlyRepayment = currentLoanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  return (
    <CardContainer>
      <Typography variant="h5" gutterBottom>
        Your Borrowing Power
      </Typography>

      <InfoBox>
        <Typography variant="h6" gutterBottom>
          {infoBox.title}
        </Typography>
        <Typography variant="body1">
          {infoBox.message}
        </Typography>
      </InfoBox>

      <BorrowingPowerDisplay
        minValue={100000}
        maxValue={maxBorrowingPower}
        defaultValue={currentLoanAmount}
        onSliderChange={setCurrentLoanAmount}
      />

      {loanProductDetails.athenaProduct && (
        <LoanProductCard
          product={{
            ...loanProductDetails.athenaProduct,
            brandLogoSrc: ATHENA_LOGO_URL
          }}
          showLoanAmount={false}
        />
      )}

      {maxBorrowingPower < requiredLoanAmount && (
        <>
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Options to improve your borrowing power:
          </Typography>
          
          <ImprovementSuggestions
            scenarios={improvementScenarios}
            onScenarioClick={(scenario) => {
              console.log('Improvement scenario selected:', scenario);
              // TODO: Implement scenario application logic
            }}
          />
        </>
      )}
    </CardContainer>
  );
} 