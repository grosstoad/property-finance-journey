// src/services/TaxCalculatorService.ts
import { TaxBracket, TaxRates } from '../types/ServiceabilityTypes';
import { TAX_RATES, CURRENT_FINANCIAL_YEAR } from '../data/TaxRates';

export class TaxCalculatorService {
  private taxRates: TaxRates;

  constructor(financialYear: string = CURRENT_FINANCIAL_YEAR) {
    if (!TAX_RATES[financialYear]) {
      throw new Error(`Tax rates for financial year ${financialYear} not found`);
    }
    this.taxRates = TAX_RATES[financialYear];
  }

  /**
   * Calculate income tax based on taxable income
   * @param taxableIncome Annual taxable income
   * @returns Tax amount
   */
  public calculateIncomeTax(taxableIncome: number): number {
    if (taxableIncome <= 0) return 0;
    
    const bracket = this.findTaxBracket(taxableIncome);
    return this.calculateTaxForBracket(taxableIncome, bracket);
  }

  /**
   * Calculate Medicare levy
   * @param taxableIncome Annual taxable income
   * @returns Medicare levy amount
   */
  public calculateMedicareLevy(taxableIncome: number): number {
    if (taxableIncome <= 0) return 0;
    
    // Below threshold, no Medicare levy
    if (taxableIncome <= (this.taxRates.medicareThreshold || 0)) {
      return 0;
    }
    
    return taxableIncome * this.taxRates.medicareLevy;
  }

  /**
   * Calculate total tax payable including Medicare levy
   * @param taxableIncome Annual taxable income
   * @returns Total tax amount
   */
  public calculateTotalTax(taxableIncome: number): number {
    if (taxableIncome <= 0) return 0;
    
    const incomeTax = this.calculateIncomeTax(taxableIncome);
    const medicareLevy = this.calculateMedicareLevy(taxableIncome);
    
    return incomeTax + medicareLevy;
  }

  /**
   * Calculate net income after tax
   * @param taxableIncome Annual taxable income
   * @returns Net income after tax
   */
  public calculateNetIncome(taxableIncome: number): number {
    if (taxableIncome <= 0) return 0;
    
    const totalTax = this.calculateTotalTax(taxableIncome);
    return taxableIncome - totalTax;
  }

  /**
   * Find the applicable tax bracket for the income
   * @param income Taxable income
   * @returns Applicable tax bracket
   */
  private findTaxBracket(income: number): TaxBracket {
    return this.taxRates.brackets.find(bracket => 
      income >= bracket.min && (bracket.max === null || income <= bracket.max)
    ) || this.taxRates.brackets[0];
  }

  /**
   * Calculate tax for a specific bracket
   * @param income Taxable income
   * @param bracket Tax bracket
   * @returns Tax amount
   */
  private calculateTaxForBracket(income: number, bracket: TaxBracket): number {
    return bracket.base + (bracket.rate * (income - bracket.min));
  }
}

export default TaxCalculatorService;


// src/data/TaxRates.ts
import { TaxRates } from '../types/ServiceabilityTypes';

/**
 * Australian tax rates that can be updated as they change
 * Data for financial years in format 'YYYY-YYYY'
 */
export const TAX_RATES: Record<string, TaxRates> = {
  // 2024-2025 tax rates - sample based on previous years
  "2024-2025": {
    financialYear: "2024-2025",
    brackets: [
      { min: 0, max: 18200, rate: 0.0, base: 0 },
      { min: 18201, max: 45000, rate: 0.19, base: 0 },
      { min: 45001, max: 120000, rate: 0.325, base: 5092 },
      { min: 120001, max: 180000, rate: 0.37, base: 29467 },
      { min: 180001, max: null, rate: 0.45, base: 51667 }
    ],
    medicareLevy: 0.02,
    medicareThreshold: 22800
  },
  
  // 2023-2024 tax rates
  "2023-2024": {
    financialYear: "2023-2024",
    brackets: [
      { min: 0, max: 18200, rate: 0.0, base: 0 },
      { min: 18201, max: 45000, rate: 0.19, base: 0 },
      { min: 45001, max: 120000, rate: 0.325, base: 5092 },
      { min: 120001, max: 180000, rate: 0.37, base: 29467 },
      { min: 180001, max: null, rate: 0.45, base: 51667 }
    ],
    medicareLevy: 0.02,
    medicareThreshold: 22801
  }
};

// Default to most recent financial year if not specified
export const CURRENT_FINANCIAL_YEAR = "2024-2025";