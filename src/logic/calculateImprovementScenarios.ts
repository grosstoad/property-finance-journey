import { BorrowingConstraint, FinancialsInput, ImprovementScenario, FrequencyType } from '../types/FinancialTypes';
import { calculateMaxBorrowingByDeposit } from './calculateMaxBorrowingByDeposit';
import { calculateMaxBorrowingByFinancials } from './calculateMaxBorrowingByFinancials';
import { calculateServiceability } from './calculateServiceability';
import { convertToMonthly } from './frequencyConverter';

/**
 * Calculate improvement scenarios based on the borrowing constraint
 * @param financials Financial inputs
 * @param borrowingConstraint Current borrowing constraint
 * @param currentMaxBorrowing Current maximum borrowing amount
 * @param savings Total available savings
 * @param propertyPrice Property price
 * @param propertyState Property state
 * @param isFirstHomeBuyer Whether the buyer is a first home buyer
 * @param isInvestmentProperty Whether the property is for investment
 * @param baseInterestRate Base interest rate
 * @param maxLvr Maximum LVR ratio (0-1)
 * @returns List of improvement scenarios
 */
export function calculateImprovementScenarios(
  financials: FinancialsInput,
  borrowingConstraint: BorrowingConstraint,
  currentMaxBorrowing: number,
  savings: number,
  propertyPrice: number,
  propertyState: string,
  isFirstHomeBuyer: boolean = false,
  isInvestmentProperty: boolean = false,
  baseInterestRate: number = 5.0,
  maxLvr: number = 0.8,
): ImprovementScenario[] {
  const scenarios: ImprovementScenario[] = [];
  
  // Global max borrowing constraint can't be improved
  if (borrowingConstraint === 'global') {
    return [];
  }
  
  // For deposit constraint, suggest increasing savings
  if (borrowingConstraint === 'deposit') {
    // Scenario 1: Increase savings by $20,000
    const increasedSavings20k = calculateMaxBorrowingByDeposit(
      savings + 20000,
      propertyState,
      isFirstHomeBuyer,
      isInvestmentProperty,
      maxLvr
    );
    
    scenarios.push({
      title: 'Increase savings by $20,000',
      description: 'Adding more to your deposit can increase your borrowing power',
      potentialIncrease: 20000,
      type: 'SAVINGS',
      impact: increasedSavings20k - currentMaxBorrowing,
      newMaxBorrowing: increasedSavings20k,
    });
    
    // Scenario 2: Increase savings by $50,000
    const increasedSavings50k = calculateMaxBorrowingByDeposit(
      savings + 50000,
      propertyState,
      isFirstHomeBuyer,
      isInvestmentProperty,
      maxLvr
    );
    
    scenarios.push({
      title: 'Increase savings by $50,000',
      description: 'A larger deposit significantly increases your borrowing power',
      potentialIncrease: 50000,
      type: 'SAVINGS',
      impact: increasedSavings50k - currentMaxBorrowing,
      newMaxBorrowing: increasedSavings50k,
    });
    
    // Scenario 3: Increase savings by $100,000
    const increasedSavings100k = calculateMaxBorrowingByDeposit(
      savings + 100000,
      propertyState,
      isFirstHomeBuyer,
      isInvestmentProperty,
      maxLvr
    );
    
    scenarios.push({
      title: 'Increase savings by $100,000',
      description: 'A substantial deposit boost can maximize your borrowing power',
      potentialIncrease: 100000,
      type: 'SAVINGS',
      impact: increasedSavings100k - currentMaxBorrowing,
      newMaxBorrowing: increasedSavings100k,
    });
  }
  
  // For financials constraint, suggest reducing expenses or credit card
  if (borrowingConstraint === 'financials') {
    // Calculate HEM for comparison
    let hem = 25000; // Base annual HEM (simplified)
    if (financials.applicantType === 'joint') {
      hem += 25000 * 0.6; // Add 60% for second applicant
    }
    hem += financials.numDependents * 5000; // Add for dependents
    const monthlyHem = hem / 12;
    
    // Scenario 1: Reduce expenses to minimum (HEM)
    const monthlyExpenses = convertToMonthly(
      financials.liabilities.expenses.value,
      financials.liabilities.expenses.frequency
    );
    
    if (monthlyExpenses > monthlyHem) {
      const financialsWithMinExpenses = {
        ...financials,
        liabilities: {
          ...financials.liabilities,
          expenses: {
            value: monthlyHem,
            frequency: 'monthly' as FrequencyType,
          },
        },
      };
      
      const { maxLoanAmount } = calculateMaxBorrowingByFinancials(
        financialsWithMinExpenses,
        baseInterestRate,
        30,
        propertyPrice,
        isInvestmentProperty
      );
      
      scenarios.push({
        title: 'Reduce expenses to minimum',
        description: 'Lowering your living expenses can improve serviceability',
        potentialIncrease: monthlyExpenses - monthlyHem,
        type: 'EXPENSES',
        impact: maxLoanAmount - currentMaxBorrowing,
        newMaxBorrowing: maxLoanAmount,
      });
    }
    
    // Scenario 2: Close credit cards
    if (financials.liabilities.creditCardLimit > 0) {
      const financialsWithoutCreditCards = {
        ...financials,
        liabilities: {
          ...financials.liabilities,
          creditCardLimit: 0,
        },
      };
      
      const { maxLoanAmount } = calculateMaxBorrowingByFinancials(
        financialsWithoutCreditCards,
        baseInterestRate,
        30,
        propertyPrice,
        isInvestmentProperty
      );
      
      scenarios.push({
        title: 'Close credit cards',
        description: 'Cancelling or reducing your credit card limits can improve borrowing power',
        potentialIncrease: financials.liabilities.creditCardLimit,
        type: 'CREDIT',
        impact: maxLoanAmount - currentMaxBorrowing,
        newMaxBorrowing: maxLoanAmount,
      });
    }
  }
  
  return scenarios;
} 