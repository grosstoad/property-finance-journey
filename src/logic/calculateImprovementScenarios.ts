import { 
  BorrowingConstraint, 
  FinancialsInput, 
  ImprovementScenario, 
  FrequencyType,
  MaxBorrowingResult,
  HEMParameters,
  MaxBorrowAmountReason
} from '../types/FinancialTypes';

import { LoanProductDetails, LoanPreferences } from '../types/loan';
import { calculateMaxBorrowing } from './maxBorrow/adapter';
import { getHigherOfDeclaredOrHEM } from './hemService';
import { formatCurrency } from './formatters';
import { v4 as uuidv4 } from 'uuid';
import { GLOBAL_LIMITS } from '../constants/financialConstants';

/**
 * Calculate improvement scenarios based on the borrowing constraint
 * @param financials Financial inputs
 * @param currentMaxBorrowing Current maximum borrowing calculation result
 * @param loanProductDetails Loan product details
 * @param savings Total available savings
 * @param propertyValue Property value
 * @param propertyState Property state
 * @param propertyPostcode Property postcode
 * @param isFirstHomeBuyer Whether the buyer is a first home buyer
 * @param isInvestmentProperty Whether the property is for investment
 * @param loanAmountRequired Required loan amount
 * @param loanPreferences Loan preferences from UI
 * @returns List of improvement scenarios
 */
export async function calculateImprovementScenarios(
  financials: FinancialsInput,
  currentMaxBorrowing: MaxBorrowingResult,
  loanProductDetails: LoanProductDetails,
  savings: number,
  propertyValue: number,
  propertyState: string,
  propertyPostcode: string,
  isFirstHomeBuyer: boolean = false,
  isInvestmentProperty: boolean = false,
  loanAmountRequired: number = 0,
  loanPreferences?: LoanPreferences
): Promise<ImprovementScenario[]> {
  // 1. Entry Point Logging
  console.log('[SCENARIOS_DETAIL] Starting scenario calculation with:', {
    maxBorrowAmount: currentMaxBorrowing.maxBorrowAmount,
    maxBorrowAmountReason: currentMaxBorrowing.maxBorrowAmountReason,
    loanAmountRequired,
    shortfall: loanAmountRequired - currentMaxBorrowing.maxBorrowAmount,
    financialsData: {
      hasExpenses: !!financials.liabilities?.expenses,
      expenseAmount: financials.liabilities?.expenses?.value,
      expenseFrequency: financials.liabilities?.expenses?.frequency,
      hasCreditCard: !!financials.liabilities?.creditCardLimit,
      creditCardLimit: financials.liabilities?.creditCardLimit,
    }
  });
  
  const scenarios: ImprovementScenario[] = [];
  const startTime = performance.now();
  
  // Initial check logging
  console.log('[SCENARIOS_DETAIL] Initial requirement check:', {
    loanAmountRequired,
    maxBorrowAmount: currentMaxBorrowing.maxBorrowAmount,
    needsScenarios: loanAmountRequired > currentMaxBorrowing.maxBorrowAmount
  });
  
  if (loanAmountRequired === 0 || loanAmountRequired <= currentMaxBorrowing.maxBorrowAmount) {
    console.log('[SCENARIOS_DETAIL] No improvement scenarios needed - loan amount required is covered');
    return [];
  }
  
  // Global max check logging
  console.log('[SCENARIOS_DETAIL] Checking global max constraint:', {
    reason: currentMaxBorrowing.maxBorrowAmountReason,
    isGlobalMax: currentMaxBorrowing.maxBorrowAmountReason === 'global'
  });
  
  // Handle each constraint type
  switch (currentMaxBorrowing.maxBorrowAmountReason) {
    case 'global':
      console.log('[SCENARIOS_DETAIL] Global max borrowing constraint reached - returning global max message');
      return [{
        title: 'Maximum lending limit reached',
        description: `$${formatCurrency(GLOBAL_LIMITS.MAX_BORROWING)} is the maximum amount we lend to a property at Athena.`,
        potentialIncrease: 0,
        type: 'GLOBAL_MAX',
        impact: 0,
        newMaxBorrowing: currentMaxBorrowing.maxBorrowAmount,
        id: uuidv4()
      }];

    case 'financials':
    case 'unserviceable':
      return await calculateFinancialScenarios(
        financials,
        currentMaxBorrowing,
        loanProductDetails,
        savings,
        propertyValue,
        propertyState,
        propertyPostcode,
        isFirstHomeBuyer,
        isInvestmentProperty,
        loanAmountRequired,
        loanPreferences
      );

    case 'deposit':
      return await calculateDepositScenarios(
        financials,
        currentMaxBorrowing,
        loanProductDetails,
        savings,
        propertyValue,
        propertyState,
        propertyPostcode,
        isFirstHomeBuyer,
        isInvestmentProperty,
        loanAmountRequired,
        loanPreferences
      );

    default:
      console.warn('[SCENARIOS_DETAIL] Unknown constraint type:', currentMaxBorrowing.maxBorrowAmountReason);
      return [];
  }
}

/**
 * Calculate scenarios for financial/serviceability constraints
 */
async function calculateFinancialScenarios(
  financials: FinancialsInput,
  currentMaxBorrowing: MaxBorrowingResult,
  loanProductDetails: LoanProductDetails,
  savings: number,
  propertyValue: number,
  propertyState: string,
  propertyPostcode: string,
  isFirstHomeBuyer: boolean,
  isInvestmentProperty: boolean,
  loanAmountRequired: number,
  loanPreferences?: LoanPreferences
): Promise<ImprovementScenario[]> {
  const scenarios: ImprovementScenario[] = [];
  const startTime = performance.now();
  
  const maritalStatus = (financials.applicantType === 'joint') ? 'married' as const : 'single' as const;
  
  const hemParameters: HEMParameters = {
    postcode: propertyPostcode,
    grossIncome: financials.applicant1.baseSalaryIncome.value * getFrequencyMultiplier(financials.applicant1.baseSalaryIncome.frequency) + 
               (financials.applicant2 ? financials.applicant2.baseSalaryIncome.value * getFrequencyMultiplier(financials.applicant2?.baseSalaryIncome.frequency || 'yearly') : 0),
    maritalStatus,
    dependents: financials.numDependents
  };
  
  const declaredExpenses = financials.liabilities.expenses.value;
  const expensesFrequency = financials.liabilities.expenses.frequency;
  const annualizedDeclaredExpenses = declaredExpenses * getFrequencyMultiplier(expensesFrequency);
  const creditCardLimit = financials.liabilities.creditCardLimit || 0;
  
  const hemResult = getHigherOfDeclaredOrHEM(annualizedDeclaredExpenses, hemParameters);
  const isUsingHEM = hemResult.isHEM;
  const hemAmount = hemResult.hemAmount;
  
  // 2. HEM Calculation Logging
  console.log('[SCENARIOS_DETAIL] HEM calculation:', {
    declaredExpenses: annualizedDeclaredExpenses,
    hemAmount,
    isUsingHEM,
    wouldShowExpenseScenario: !isUsingHEM && annualizedDeclaredExpenses > hemAmount
  });
  
  // 3. Scenario Generation Logging
  console.log('[SCENARIOS_DETAIL] Scenario eligibility:', {
    canShowExpenseScenario: !isUsingHEM && annualizedDeclaredExpenses > hemAmount,
    canShowCreditCardScenario: creditCardLimit > 0,
    canShowLVRScenario: currentMaxBorrowing.maxBorrowingAmountFinancialsUsed !== 'maxBorrowingAmountFinancials_0_50',
    isDepositConstrained: currentMaxBorrowing.maxBorrowAmountReason === 'deposit'
  });
  
  // Expense reduction scenario
  if (!isUsingHEM && annualizedDeclaredExpenses > hemAmount) {
    console.log('[SCENARIOS_DETAIL] Calculating expense reduction scenario:', {
      currentExpenses: annualizedDeclaredExpenses,
      targetExpenses: hemAmount,
      potentialReduction: annualizedDeclaredExpenses - hemAmount
    });
    
    const modifiedFinancials = JSON.parse(JSON.stringify(financials));
    const reducedExpenses = hemAmount / getFrequencyMultiplier(expensesFrequency);
    modifiedFinancials.liabilities.expenses.value = reducedExpenses;
    
    const newMaxBorrowing = await calculateMaxBorrowing(
      modifiedFinancials,
      loanProductDetails,
      propertyValue,
      isInvestmentProperty, 
      propertyPostcode,
      savings,
      propertyState,
      isFirstHomeBuyer,
      loanAmountRequired,
      false,
      loanPreferences,
      false
    );
    
    // 4. Individual Scenario Calculation Results
    console.log('[SCENARIOS_DETAIL] Expense scenario calculation result:', {
      scenarioType: 'EXPENSES',
      originalAmount: currentMaxBorrowing.maxBorrowAmount,
      newAmount: newMaxBorrowing.maxBorrowAmount,
      impact: newMaxBorrowing.maxBorrowAmount - currentMaxBorrowing.maxBorrowAmount,
      wasScenarioAdded: newMaxBorrowing.maxBorrowAmount > currentMaxBorrowing.maxBorrowAmount
    });
    
    if (newMaxBorrowing.maxBorrowAmount > currentMaxBorrowing.maxBorrowAmount) {
      const impact = newMaxBorrowing.maxBorrowAmount - currentMaxBorrowing.maxBorrowAmount;
      const monthlyReduction = (annualizedDeclaredExpenses - hemAmount) / 12;
      
      scenarios.push({
        id: uuidv4(),
        title: 'Reduce expenses to minimum',
        description: `Reducing your expenses by ${formatCurrency(monthlyReduction)}/month could increase your borrowing power by ${formatCurrency(impact)}`,
        type: 'EXPENSES',
        potentialIncrease: reducedExpenses,
        impact,
        newMaxBorrowing: newMaxBorrowing.maxBorrowAmount,
        evaluationCriteria: `Expenses > HEM (${formatCurrency(annualizedDeclaredExpenses)} > ${formatCurrency(hemAmount)})`
      });
    }
  }
  
  // Credit card scenario
  if (creditCardLimit > 0) {
    console.log('[SCENARIOS_DETAIL] Calculating credit card removal scenario:', {
      currentCreditCardLimit: creditCardLimit
    });
    
    const modifiedFinancials = JSON.parse(JSON.stringify(financials));
    modifiedFinancials.liabilities.creditCardLimit = 0;
    
    const newMaxBorrowing = await calculateMaxBorrowing(
      modifiedFinancials,
      loanProductDetails,
      propertyValue,
      isInvestmentProperty, 
      propertyPostcode,
      savings,
      propertyState,
      isFirstHomeBuyer,
      loanAmountRequired,
      false,
      loanPreferences,
      false
    );
    
    console.log('[SCENARIOS_DETAIL] Credit card scenario calculation result:', {
      scenarioType: 'CREDIT',
      originalAmount: currentMaxBorrowing.maxBorrowAmount,
      newAmount: newMaxBorrowing.maxBorrowAmount,
      impact: newMaxBorrowing.maxBorrowAmount - currentMaxBorrowing.maxBorrowAmount,
      wasScenarioAdded: newMaxBorrowing.maxBorrowAmount > currentMaxBorrowing.maxBorrowAmount
    });
    
    if (newMaxBorrowing.maxBorrowAmount > currentMaxBorrowing.maxBorrowAmount) {
      const impact = newMaxBorrowing.maxBorrowAmount - currentMaxBorrowing.maxBorrowAmount;
      
      scenarios.push({
        id: uuidv4(),
        title: 'Close credit cards',
        description: `Closing your credit cards with a total limit of ${formatCurrency(creditCardLimit)} could increase your borrowing power by ${formatCurrency(impact)}`,
        type: 'CREDIT',
        potentialIncrease: creditCardLimit,
        impact,
        newMaxBorrowing: newMaxBorrowing.maxBorrowAmount,
        evaluationCriteria: `Credit card limit > $0 (${formatCurrency(creditCardLimit)})`
      });
    }
  }
  
  // LVR improvement scenarios
  if (currentMaxBorrowing.maxBorrowingAmountFinancialsUsed !== 'maxBorrowingAmountFinancials_0_50') {
    console.log('[SCENARIOS_DETAIL] Calculating LVR improvement scenarios');
    
    const additionalSavingsAmounts = [20000, 50000, 100000];
    
    for (const additionalAmount of additionalSavingsAmounts) {
      console.log('[SCENARIOS_DETAIL] Calculating savings increase scenario:', {
        additionalAmount,
        currentSavings: savings,
        newTotalSavings: savings + additionalAmount
      });
      
      const newMaxBorrowing = await calculateMaxBorrowing(
        financials,
        loanProductDetails,
        propertyValue,
        isInvestmentProperty, 
        propertyPostcode,
        savings + additionalAmount,
        propertyState,
        isFirstHomeBuyer,
        loanAmountRequired,
        false,
        loanPreferences,
        false
      );
      
      console.log('[SCENARIOS_DETAIL] Savings scenario calculation result:', {
        scenarioType: 'SAVINGS',
        additionalAmount,
        originalAmount: currentMaxBorrowing.maxBorrowAmount,
        newAmount: newMaxBorrowing.maxBorrowAmount,
        impact: newMaxBorrowing.maxBorrowAmount - currentMaxBorrowing.maxBorrowAmount,
        wasScenarioAdded: newMaxBorrowing.maxBorrowAmount > currentMaxBorrowing.maxBorrowAmount
      });
      
      if (newMaxBorrowing.maxBorrowAmount > currentMaxBorrowing.maxBorrowAmount) {
        const impact = newMaxBorrowing.maxBorrowAmount - currentMaxBorrowing.maxBorrowAmount;
        const newTotal = savings + additionalAmount;
        
        scenarios.push({
          id: uuidv4(),
          title: `Increase savings by ${formatCurrency(additionalAmount)}`,
          description: `Increasing your savings to ${formatCurrency(newTotal)} could improve your LVR and increase your borrowing power by ${formatCurrency(impact)}`,
          type: 'SAVINGS',
          potentialIncrease: additionalAmount,
          impact,
          newMaxBorrowing: newMaxBorrowing.maxBorrowAmount,
          evaluationCriteria: `Current LVR > 50%`
        });
      }
    }
  }
  
  // Log completion
  console.log('[SCENARIOS_DETAIL] Completed financial scenario generation:', {
    totalScenariosGenerated: scenarios.length,
    scenarioTypes: scenarios.map(s => s.type),
    totalPotentialIncrease: scenarios.reduce((sum, s) => sum + s.impact, 0),
    executionTimeMs: performance.now() - startTime
  });
  
  return scenarios;
}

/**
 * Calculate scenarios for deposit constraints
 */
async function calculateDepositScenarios(
  financials: FinancialsInput,
  currentMaxBorrowing: MaxBorrowingResult,
  loanProductDetails: LoanProductDetails,
  savings: number,
  propertyValue: number,
  propertyState: string,
  propertyPostcode: string,
  isFirstHomeBuyer: boolean,
  isInvestmentProperty: boolean,
  loanAmountRequired: number,
  loanPreferences?: LoanPreferences
): Promise<ImprovementScenario[]> {
  const scenarios: ImprovementScenario[] = [];
  const startTime = performance.now();
  
  const additionalSavingsAmounts = [20000, 50000, 100000];
  
  for (const additionalAmount of additionalSavingsAmounts) {
    console.log('[SCENARIOS_DETAIL] Calculating deposit scenario:', {
      additionalAmount,
      currentSavings: savings,
      newTotalSavings: savings + additionalAmount
    });
    
    const newMaxBorrowing = await calculateMaxBorrowing(
      financials,
      loanProductDetails,
      propertyValue,
      isInvestmentProperty, 
      propertyPostcode,
      savings + additionalAmount,
      propertyState,
      isFirstHomeBuyer,
      loanAmountRequired,
      false,
      loanPreferences,
      false
    );
    
    console.log('[SCENARIOS_DETAIL] Deposit scenario calculation result:', {
      scenarioType: 'SAVINGS',
      additionalAmount,
      originalAmount: currentMaxBorrowing.maxBorrowAmount,
      newAmount: newMaxBorrowing.maxBorrowAmount,
      impact: newMaxBorrowing.maxBorrowAmount - currentMaxBorrowing.maxBorrowAmount,
      wasScenarioAdded: newMaxBorrowing.maxBorrowAmount > currentMaxBorrowing.maxBorrowAmount
    });
    
    if (newMaxBorrowing.maxBorrowAmount > currentMaxBorrowing.maxBorrowAmount) {
      const impact = newMaxBorrowing.maxBorrowAmount - currentMaxBorrowing.maxBorrowAmount;
      const newTotal = savings + additionalAmount;
      
      scenarios.push({
        id: uuidv4(),
        title: `Increase savings by ${formatCurrency(additionalAmount)}`,
        description: `Increasing your savings to ${formatCurrency(newTotal)} could break your deposit constraint and increase your borrowing power by ${formatCurrency(impact)}`,
        type: 'SAVINGS',
        potentialIncrease: additionalAmount,
        impact,
        newMaxBorrowing: newMaxBorrowing.maxBorrowAmount,
        evaluationCriteria: `Limited by deposit constraint`
      });
    }
  }
  
  // Log completion
  console.log('[SCENARIOS_DETAIL] Completed deposit scenario generation:', {
    totalScenariosGenerated: scenarios.length,
    executionTimeMs: performance.now() - startTime
  });
  
  return scenarios;
}

// Helper function to get frequency multiplier
function getFrequencyMultiplier(frequency: FrequencyType): number {
  switch(frequency) {
    case 'weekly': return 52;
    case 'fortnightly': return 26;
    case 'monthly': return 12;
    case 'yearly': 
    default: return 1;
  }
}

