import { FinancialsInput, HEMParameters, MaritalStatusType } from '../types/FinancialTypes';
import { calculateHEM, getHigherOfDeclaredOrHEM } from './hemService';
import { convertToAnnual, convertToMonthly } from './frequencyConverter';
import { DEBT_CALCULATIONS, INCOME_SHADING, LOAN_BUFFERING, LOAN_ASSESSMENT_FACTORS } from '../constants/financialConstants';
import { calculateTotalTax } from './taxService';

/**
 * Calculate deductible interest for investment properties
 * @param loanAmount Loan amount
 * @param interestRate Annual interest rate as a decimal
 * @param isPrincipalAndInterest Whether the loan is P&I or IO
 * @param loanTerm Loan term in years
 * @returns Annual deductible interest
 */
function calculateDeductibleInterest(
  loanAmount: number,
  interestRate: number,
  isPrincipalAndInterest: boolean = true,
  loanTerm: number = 30
): number {
  // For Interest Only loans, all repayments are interest
  if (!isPrincipalAndInterest) {
    return loanAmount * interestRate;
  }
  
  // For Principal & Interest, calculate average interest over first 5 years
  const monthlyRate = interestRate / 12;
  const termMonths = loanTerm * 12;
  
  // Calculate the monthly payment
  const monthlyPayment = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
    (Math.pow(1 + monthlyRate, termMonths) - 1);
  
  // Calculate interest for first 5 years
  let remainingPrincipal = loanAmount;
  let totalInterest = 0;
  
  // Track first 5 years (60 months) of payments
  const calculationPeriod = Math.min(60, termMonths);
  
  for (let month = 1; month <= calculationPeriod; month++) {
    // Calculate interest portion of this payment
    const interestPayment = remainingPrincipal * monthlyRate;
    totalInterest += interestPayment;
    
    // Calculate principal portion of this payment
    const principalPayment = monthlyPayment - interestPayment;
    
    // Update remaining principal
    remainingPrincipal -= principalPayment;
  }
  
  // Return average annual interest over 5 years
  return totalInterest / 5;
}

/**
 * Calculate serviceability based on financial inputs
 * @param financials Financial inputs
 * @param loanAmount Requested loan amount
 * @param interestRate Interest rate (percentage)
 * @param loanTerm Loan term in years
 * @param isInvestmentProperty Whether the property is for investment
 * @param postcode Property postcode (for HEM calculation)
 * @param isPrincipalAndInterest Whether the loan is Principal & Interest or Interest Only
 * @returns Serviceability result including surplus/deficit
 */
export function calculateServiceability(
  financials: FinancialsInput,
  loanAmount: number,
  interestRate: number,
  loanTerm: number = 30,
  isInvestmentProperty: boolean = false,
  postcode: string = '2000', // Default to Sydney if not provided
  isPrincipalAndInterest: boolean = true // Default to P&I
): {
  netSurplusOrDeficit: number;
  totalNetIncome: number;
  totalExpenses: number;
  shadedGrossIncome: number;
  monthlyNetIncome: number;
  monthlyExpenses: number;
  monthlyLoanRepayment: number;
  isUsingHEM: boolean;
  hemAmount: number;
  declaredExpenses: number;
} {
  // Calculate shaded income for applicant 1
  const app1BaseSalary = convertToAnnual(
    financials.applicant1.baseSalaryIncome.value,
    financials.applicant1.baseSalaryIncome.frequency
  ) * INCOME_SHADING.EMPLOYMENT.FULL_TIME;
  
  const app1Supplementary = convertToAnnual(
    financials.applicant1.supplementaryIncome.value,
    financials.applicant1.supplementaryIncome.frequency
  ) * INCOME_SHADING.EMPLOYMENT.PART_TIME;
  
  const app1Other = convertToAnnual(
    financials.applicant1.otherIncome.value,
    financials.applicant1.otherIncome.frequency
  ) * INCOME_SHADING.OTHER.INTEREST;
  
  const app1Rental = convertToAnnual(
    financials.applicant1.rentalIncome.value,
    financials.applicant1.rentalIncome.frequency
  ) * INCOME_SHADING.OTHER.RENTAL_INCOME;
  
  // Total shaded income for applicant 1
  const app1ShadedGrossIncome = app1BaseSalary + app1Supplementary + app1Other + app1Rental;
  
  // Calculate shaded income for applicant 2 if present
  let app2BaseSalary = 0;
  let app2Supplementary = 0;
  let app2Other = 0;
  let app2Rental = 0;
  let app2ShadedGrossIncome = 0;
  
  if (financials.applicantType === 'joint' && financials.applicant2) {
    app2BaseSalary = convertToAnnual(
      financials.applicant2.baseSalaryIncome.value,
      financials.applicant2.baseSalaryIncome.frequency
    ) * INCOME_SHADING.EMPLOYMENT.FULL_TIME;
    
    app2Supplementary = convertToAnnual(
      financials.applicant2.supplementaryIncome.value,
      financials.applicant2.supplementaryIncome.frequency
    ) * INCOME_SHADING.EMPLOYMENT.PART_TIME;
    
    app2Other = convertToAnnual(
      financials.applicant2.otherIncome.value,
      financials.applicant2.otherIncome.frequency
    ) * INCOME_SHADING.OTHER.INTEREST;
    
    app2Rental = convertToAnnual(
      financials.applicant2.rentalIncome.value,
      financials.applicant2.rentalIncome.frequency
    ) * INCOME_SHADING.OTHER.RENTAL_INCOME;
    
    app2ShadedGrossIncome = app2BaseSalary + app2Supplementary + app2Other + app2Rental;
  }
  
  // Calculate total shaded gross income
  const shadedGrossIncome = app1ShadedGrossIncome + app2ShadedGrossIncome;
  
  // Apply tax deduction for investment property if applicable
  let deductibleInterest = 0;
  let app1TaxableIncome = app1ShadedGrossIncome;
  let app2TaxableIncome = app2ShadedGrossIncome;
  
  if (isInvestmentProperty && loanAmount > 0) {
    // For investment properties, interest is tax deductible
    // Calculate deductible interest based on loan type
    const annualInterestRate = interestRate / 100; // Convert percentage to decimal
    deductibleInterest = calculateDeductibleInterest(
      loanAmount, 
      annualInterestRate,
      isPrincipalAndInterest,
      loanTerm
    );
    
    console.log(`Investment property: deductible interest = $${deductibleInterest.toFixed(2)} (${isPrincipalAndInterest ? 'P&I' : 'IO'})`);
    
    // Split the deduction proportionally based on income
    if (shadedGrossIncome > 0) {
      const app1Proportion = app1ShadedGrossIncome / shadedGrossIncome;
      const app2Proportion = app2ShadedGrossIncome / shadedGrossIncome;
      
      app1TaxableIncome = Math.max(0, app1ShadedGrossIncome - (deductibleInterest * app1Proportion));
      app2TaxableIncome = Math.max(0, app2ShadedGrossIncome - (deductibleInterest * app2Proportion));
    }
  }
  
  // Calculate tax for applicant 1
  const app1TaxResult = calculateTotalTax(app1TaxableIncome);
  const app1TaxAmount = app1TaxResult.totalTax;
  
  // Calculate tax for applicant 2 if present
  let app2TaxAmount = 0;
  if (financials.applicantType === 'joint' && financials.applicant2) {
    const app2TaxResult = calculateTotalTax(app2TaxableIncome);
    app2TaxAmount = app2TaxResult.totalTax;
  }
  
  // Calculate total tax
  const totalTaxAmount = app1TaxAmount + app2TaxAmount;
  
  // Calculate net income after tax
  const netIncome = shadedGrossIncome - totalTaxAmount;
  const monthlyNetIncome = netIncome / 12;
  
  // Calculate declared expenses (annual)
  const declaredAnnualExpenses = convertToAnnual(
    financials.liabilities.expenses.value,
    financials.liabilities.expenses.frequency
  );
  
  // Calculate HEM based on income, marital status, and dependents
  const maritalStatus: MaritalStatusType = financials.applicantType === 'joint' ? 'married' : 'single';
  
  const hemParameters: HEMParameters = {
    postcode,
    grossIncome: shadedGrossIncome,
    maritalStatus,
    dependents: financials.numDependents
  };
  
  // Compare HEM with declared expenses and use the higher value
  const expensesResult = getHigherOfDeclaredOrHEM(declaredAnnualExpenses, hemParameters);
  const annualLivingExpenses = expensesResult.higherAmount;
  const monthlyLivingExpenses = annualLivingExpenses / 12;
  
  // Calculate other repayments
  const rawMonthlyOtherHomeLoanRepayments = convertToMonthly(
    financials.liabilities.otherHomeLoanRepayments.value,
    financials.liabilities.otherHomeLoanRepayments.frequency
  );
  
  // Apply buffering factor to existing home loans
  const monthlyOtherHomeLoanRepayments = rawMonthlyOtherHomeLoanRepayments * LOAN_BUFFERING.HOME_LOAN;
  
  // Calculate other loan repayments
  const rawMonthlyOtherLoanRepayments = convertToMonthly(
    financials.liabilities.otherLoanRepayments.value,
    financials.liabilities.otherLoanRepayments.frequency
  );
  
  // Apply buffering factor to other loans
  const monthlyOtherLoanRepayments = rawMonthlyOtherLoanRepayments * LOAN_BUFFERING.OTHER_LOAN;
  
  const monthlyCreditCardRepayments = financials.liabilities.creditCardLimit * 
    DEBT_CALCULATIONS.CREDIT_CARD_REPAYMENT_FACTOR;
  
  // Calculate loan repayment with buffer
  const bufferedInterestRate = (interestRate / 100) + LOAN_ASSESSMENT_FACTORS.NEW_LOAN_BUFFER;
  const monthlyRate = bufferedInterestRate / 12;
  const termMonths = loanTerm * 12;
  
  // Handle division by zero when loanAmount is 0
  let monthlyLoanRepayment = 0;
  if (loanAmount > 0) {
    monthlyLoanRepayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
      (Math.pow(1 + monthlyRate, termMonths) - 1);
  }
  
  // Calculate total monthly expenses
  const totalMonthlyExpenses = monthlyLivingExpenses + 
    monthlyOtherHomeLoanRepayments + 
    monthlyOtherLoanRepayments + 
    monthlyCreditCardRepayments + 
    monthlyLoanRepayment;
  
  // Calculate surplus or deficit
  const monthlySurplusOrDeficit = monthlyNetIncome - totalMonthlyExpenses;
  
  return {
    netSurplusOrDeficit: monthlySurplusOrDeficit * 12, // Annual surplus/deficit
    totalNetIncome: netIncome,
    totalExpenses: totalMonthlyExpenses * 12,
    shadedGrossIncome,
    monthlyNetIncome,
    monthlyExpenses: totalMonthlyExpenses,
    monthlyLoanRepayment,
    isUsingHEM: expensesResult.isHEM,
    hemAmount: expensesResult.hemAmount,
    declaredExpenses: declaredAnnualExpenses
  };
} 