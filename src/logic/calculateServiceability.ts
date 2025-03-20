import { FinancialsInput } from '../types/FinancialTypes';
import { convertToAnnual, convertToMonthly } from './frequencyConverter';

// Constants
const INCOME_SHADING = {
  BASE_SALARY: 0.9, // 90% of base salary is considered
  SUPPLEMENTARY: 0.8, // 80% of supplementary income is considered
  OTHER: 0.8, // 80% of other income is considered
  RENTAL: 0.8, // 80% of rental income is considered
};

const BUFFER_RATE = 0.02; // 2% buffer on interest rates
const CREDIT_CARD_REPAYMENT_FACTOR = 0.038; // 3.8% of credit card limit per month

// Simple progressive tax brackets for Australia (2023-2024)
const TAX_BRACKETS = [
  { min: 0, max: 18200, rate: 0, base: 0 },
  { min: 18201, max: 45000, rate: 0.19, base: 0 },
  { min: 45001, max: 120000, rate: 0.325, base: 5092 },
  { min: 120001, max: 180000, rate: 0.37, base: 29467 },
  { min: 180001, max: Infinity, rate: 0.45, base: 51667 },
];

// HEM values by income range - simplified for this example
const HEM_BASE = 25000; // Base annual HEM for a single person
const HEM_DEPENDENT_FACTOR = 5000; // Additional per dependent
const HEM_JOINT_FACTOR = 0.6; // Factor applied to second person in joint application

/**
 * Calculate annual tax based on taxable income
 * @param taxableIncome Annual taxable income
 * @returns Annual tax amount
 */
function calculateTax(taxableIncome: number): number {
  const bracket = TAX_BRACKETS.find(
    b => taxableIncome > b.min && taxableIncome <= b.max
  ) || TAX_BRACKETS[0];
  
  return bracket.base + (taxableIncome - bracket.min) * bracket.rate;
}

/**
 * Calculate serviceability based on financial inputs
 * @param financials Financial inputs
 * @param loanAmount Requested loan amount
 * @param interestRate Interest rate (percentage)
 * @param loanTerm Loan term in years
 * @param isInvestmentProperty Whether the property is for investment
 * @returns Serviceability result including surplus/deficit
 */
export function calculateServiceability(
  financials: FinancialsInput,
  loanAmount: number,
  interestRate: number,
  loanTerm: number = 30,
  isInvestmentProperty: boolean = false
): {
  netSurplusOrDeficit: number;
  totalNetIncome: number;
  totalExpenses: number;
  shadedGrossIncome: number;
  monthlyNetIncome: number;
  monthlyExpenses: number;
  monthlyLoanRepayment: number;
} {
  // Calculate shaded income for applicant 1
  const app1BaseSalary = convertToAnnual(
    financials.applicant1.baseSalaryIncome.value,
    financials.applicant1.baseSalaryIncome.frequency
  ) * INCOME_SHADING.BASE_SALARY;
  
  const app1Supplementary = convertToAnnual(
    financials.applicant1.supplementaryIncome.value,
    financials.applicant1.supplementaryIncome.frequency
  ) * INCOME_SHADING.SUPPLEMENTARY;
  
  const app1Other = convertToAnnual(
    financials.applicant1.otherIncome.value,
    financials.applicant1.otherIncome.frequency
  ) * INCOME_SHADING.OTHER;
  
  const app1Rental = convertToAnnual(
    financials.applicant1.rentalIncome.value,
    financials.applicant1.rentalIncome.frequency
  ) * INCOME_SHADING.RENTAL;
  
  // Calculate shaded income for applicant 2 if present
  let app2BaseSalary = 0;
  let app2Supplementary = 0;
  let app2Other = 0;
  let app2Rental = 0;
  
  if (financials.applicantType === 'joint' && financials.applicant2) {
    app2BaseSalary = convertToAnnual(
      financials.applicant2.baseSalaryIncome.value,
      financials.applicant2.baseSalaryIncome.frequency
    ) * INCOME_SHADING.BASE_SALARY;
    
    app2Supplementary = convertToAnnual(
      financials.applicant2.supplementaryIncome.value,
      financials.applicant2.supplementaryIncome.frequency
    ) * INCOME_SHADING.SUPPLEMENTARY;
    
    app2Other = convertToAnnual(
      financials.applicant2.otherIncome.value,
      financials.applicant2.otherIncome.frequency
    ) * INCOME_SHADING.OTHER;
    
    app2Rental = convertToAnnual(
      financials.applicant2.rentalIncome.value,
      financials.applicant2.rentalIncome.frequency
    ) * INCOME_SHADING.RENTAL;
  }
  
  // Calculate total shaded gross income
  const shadedGrossIncome = app1BaseSalary + app1Supplementary + app1Other + app1Rental +
    app2BaseSalary + app2Supplementary + app2Other + app2Rental;
  
  // Apply tax deduction for investment property if applicable
  let deductibleInterest = 0;
  let taxableIncome = shadedGrossIncome;
  
  if (isInvestmentProperty) {
    // For investment properties, interest is tax deductible
    deductibleInterest = loanAmount * (interestRate / 100);
    taxableIncome = Math.max(0, shadedGrossIncome - deductibleInterest);
  }
  
  // Calculate tax on taxable income
  const taxAmount = calculateTax(taxableIncome);
  
  // Calculate net income after tax
  const netIncome = shadedGrossIncome - taxAmount;
  const monthlyNetIncome = netIncome / 12;
  
  // Calculate expenses
  const monthlyExpenses = convertToMonthly(
    financials.liabilities.expenses.value,
    financials.liabilities.expenses.frequency
  );
  
  const monthlyOtherHomeLoanRepayments = convertToMonthly(
    financials.liabilities.otherHomeLoanRepayments.value,
    financials.liabilities.otherHomeLoanRepayments.frequency
  );
  
  const monthlyOtherLoanRepayments = convertToMonthly(
    financials.liabilities.otherLoanRepayments.value,
    financials.liabilities.otherLoanRepayments.frequency
  );
  
  const monthlyCreditCardRepayments = financials.liabilities.creditCardLimit * CREDIT_CARD_REPAYMENT_FACTOR;
  
  // Calculate HEM based on income and dependents
  let hem = HEM_BASE;
  
  if (financials.applicantType === 'joint') {
    hem += HEM_BASE * HEM_JOINT_FACTOR;
  }
  
  hem += financials.numDependents * HEM_DEPENDENT_FACTOR;
  const monthlyHem = hem / 12;
  
  // Use higher of declared expenses or HEM
  const monthlyLivingExpenses = Math.max(monthlyExpenses, monthlyHem);
  
  // Calculate loan repayment with buffer
  const bufferedInterestRate = interestRate / 100 + BUFFER_RATE;
  const monthlyRate = bufferedInterestRate / 12;
  const termMonths = loanTerm * 12;
  
  const monthlyLoanRepayment = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
    (Math.pow(1 + monthlyRate, termMonths) - 1);
  
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
  };
} 