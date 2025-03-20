I'll help you build a function/service that mimics the serviceability.swagger API, focusing on creating robust types, accurate mappings, and implementing the business logic as described in the PRD.

Based on the information provided, I need to create several components:

1. Type definitions matching the swagger schema
2. Tax calculation logic with configurable rates
3. HEM lookup implementation
4. Income shading and expense buffering logic
5. Serviceability calculation core logic
6. Postcode LVR lookup service

Let me start by structuring the solution with type definitions and then build up the business logic for each component.

Let's begin with the core types:

Now, let's create the constants file to manage parameters for income shading, expense buffering, and other constants:

Next, let's create a tax calculator service with configurable tax rates:



Now, let's implement the tax calculator service:



Now let's implement the HEM lookup service using the provided data:


// src/data/PostcodeLvrData.ts
import { PostcodeLVR } from '../types/ServiceabilityTypes';

export enum PropertyType {
  HOUSE = 'HOUSE',
  UNIT = 'UNIT',
  APARTMENT = 'APARTMENT',
  TOWNHOUSE = 'TOWNHOUSE',
  VILLA = 'VILLA',
  DUPLEX = 'DUPLEX',
  RURAL = 'RURAL',
  LAND = 'LAND'
}

// This would normally be loaded from a database or external file
// For this implementation, we'll use the provided data converted to objects
export const POSTCODE_LVR: PostcodeLVR[] = [
  // Sample data, you would load the full dataset from the CSV
  { propertyTypeId: PropertyType.HOUSE, postcode: '800', allowed: 80 },
  { propertyTypeId: PropertyType.HOUSE, postcode: '810', allowed: 80 },
  { propertyTypeId: PropertyType.HOUSE, postcode: '812', allowed: 80 },
  { propertyTypeId: PropertyType.HOUSE, postcode: '815', allowed: 0 },
  { propertyTypeId: PropertyType.HOUSE, postcode: '2000', allowed: 80 },
  { propertyTypeId: PropertyType.HOUSE, postcode: '2006', allowed: 80 },
  { propertyTypeId: PropertyType.HOUSE, postcode: '2007', allowed: 80 },
  { propertyTypeId: PropertyType.HOUSE, postcode: '2008', allowed: 80 },
  { propertyTypeId: PropertyType.HOUSE, postcode: '2009', allowed: 80 },
  { propertyTypeId: PropertyType.HOUSE, postcode: '2010', allowed: 80 },
  { propertyTypeId: PropertyType.HOUSE, postcode: '2011', allowed: 80 },
  { propertyTypeId: PropertyType.HOUSE, postcode: '2109', allowed: 0 },
  { propertyTypeId: PropertyType.HOUSE, postcode: '2139', allowed: 0 },
  { propertyTypeId: PropertyType.HOUSE, postcode: '3000', allowed: 80 },
  { propertyTypeId: PropertyType.HOUSE, postcode: '4000', allowed: 80 },
  // Add more entries as needed for testing
];

// Default mapping for property types without specific rules
export const DEFAULT_LVR: Record<PropertyType, number> = {
  [PropertyType.HOUSE]: 80,
  [PropertyType.UNIT]: 80,
  [PropertyType.APARTMENT]: 80,
  [PropertyType.TOWNHOUSE]: 80,
  [PropertyType.VILLA]: 80,
  [PropertyType.DUPLEX]: 80,
  [PropertyType.RURAL]: 70,
  [PropertyType.LAND]: 70
};

// Minimum allowed LVR to proceed with mortgage
export const MINIMUM_ALLOWED_LVR = 60;


// src/services/HemService.ts
import { HEM_LOOKUP, INCOME_RANGES, HEM_POSTCODE_MAPPING } from '../data/HemData';
import { GLOBAL_LIMITS } from '../constants/ServiceabilityConstants';
import { MaritalStatusType } from '../types/ServiceabilityTypes';

export class HemService {
  /**
   * Get the HEM location ID for a given postcode
   * @param postcode The postcode to lookup
   * @returns The HEM location ID, or 1 if not found (default to metropolitan)
   */
  public getHemLocationId(postcode: string): number {
    // Find the HEM location ID for the postcode
    const mapping = HEM_POSTCODE_MAPPING.find(
      item => item.postcode === postcode
    );
    
    // Default to metropolitan (hemLocationId = 1) if not found
    return mapping ? mapping.hemLocationId : 1;
  }

  /**
   * Get the income range ID for a given gross income
   * @param grossIncome Annual gross income
   * @returns The income range ID
   */
  public getIncomeRangeId(grossIncome: number): number {
    // Find the income range that the gross income falls into
    const incomeRange = INCOME_RANGES.find(
      range => grossIncome >= range.amountFrom && grossIncome <= range.amountTo
    );
    
    // Default to lowest income range if not found
    return incomeRange ? incomeRange.incomeRangeId : 1;
  }

  /**
   * Convert system marital status to HEM marital status format
   * @param maritalStatus The marital status to convert
   * @returns 'married' or 'single' for HEM lookup
   */
  public mapMaritalStatus(maritalStatus?: MaritalStatusType): 'married' | 'single' {
    if (!maritalStatus) return 'single';
    
    // Map marital status values to HEM format
    switch (maritalStatus) {
      case MaritalStatusType.MARRIED:
      case MaritalStatusType.DEFACTO:
        return 'married';
      default:
        return 'single';
    }
  }

  /**
   * Normalize dependents count for HEM lookup
   * @param dependents Number of dependents
   * @returns Normalized dependents count (max 3)
   */
  public normalizeDependents(dependents?: number): number {
    if (dependents === undefined || dependents < 0) return 0;
    
    // HEM only considers up to 3 dependents
    return Math.min(dependents, GLOBAL_LIMITS.MAX_DEPENDENTS_FOR_HEM);
  }

  /**
   * Calculate HEM value for a given set of parameters
   * @param postcode Postcode for location lookup
   * @param grossIncome Annual gross income
   * @param maritalStatus Marital status
   * @param dependents Number of dependents
   * @returns Annual HEM value
   */
  public calculateHem(
    postcode: string,
    grossIncome: number,
    maritalStatus?: MaritalStatusType,
    dependents?: number
  ): number {
    // Get parameters for HEM lookup
    const hemLocationId = this.getHemLocationId(postcode);
    const incomeRangeId = this.getIncomeRangeId(grossIncome);
    const hemMaritalStatus = this.mapMaritalStatus(maritalStatus);
    const normalizedDependents = this.normalizeDependents(dependents);
    
    // Find matching HEM record
    const hemRecord = HEM_LOOKUP.find(
      record =>
        record.hemLocationId === hemLocationId &&
        record.maritalStatusId === hemMaritalStatus &&
        record.dependants === normalizedDependents &&
        record.incomeRangeId === incomeRangeId
    );
    
    // Return annual HEM value, or 0 if not found
    return hemRecord ? hemRecord.annualValue : 0;
  }
}

export default HemService;


// src/services/LvrService.ts
import { POSTCODE_LVR, DEFAULT_LVR, PropertyType, MINIMUM_ALLOWED_LVR } from '../data/PostcodeLvrData';

export class LvrService {
  /**
   * Get the maximum allowed LVR for a property
   * @param postcode Property postcode
   * @param propertyType Type of property
   * @returns Maximum allowed LVR (as a percentage), 0 if lending not allowed
   */
  public getMaxAllowedLvr(postcode: string, propertyType: PropertyType = PropertyType.HOUSE): number {
    // Find the specific LVR rule for this postcode and property type
    const lvrRule = POSTCODE_LVR.find(
      rule => rule.postcode === postcode && rule.propertyTypeId === propertyType
    );
    
    // If specific rule found, return its allowed LVR
    if (lvrRule) {
      return lvrRule.allowed;
    }
    
    // Fall back to default LVR for this property type
    return DEFAULT_LVR[propertyType] || 0;
  }

  /**
   * Check if lending is allowed for a property
   * @param postcode Property postcode
   * @param propertyType Type of property
   * @returns Whether lending is allowed
   */
  public isLendingAllowed(postcode: string, propertyType: PropertyType = PropertyType.HOUSE): boolean {
    const maxLvr = this.getMaxAllowedLvr(postcode, propertyType);
    return maxLvr >= MINIMUM_ALLOWED_LVR;
  }

  /**
   * Calculate the maximum loan amount based on property value and LVR
   * @param propertyValue The value of the property
   * @param postcode Property postcode
   * @param propertyType Type of property
   * @returns Maximum loan amount
   */
  public calculateMaxLoanAmount(
    propertyValue: number,
    postcode: string,
    propertyType: PropertyType = PropertyType.HOUSE
  ): number {
    const maxLvr = this.getMaxAllowedLvr(postcode, propertyType);
    
    // If lending not allowed, return 0
    if (maxLvr <= 0) return 0;
    
    // Calculate max loan amount based on LVR
    return propertyValue * (maxLvr / 100);
  }

  /**
   * Calculate the LVR for a loan
   * @param loanAmount Requested loan amount
   * @param propertyValue Property value
   * @returns Calculated LVR as a percentage (e.g., 80 for 80%)
   */
  public calculateLvr(loanAmount: number, propertyValue: number): number {
    if (propertyValue <= 0) return 0;
    return (loanAmount / propertyValue) * 100;
  }

  /**
   * Check if a loan meets the LVR requirements
   * @param loanAmount Requested loan amount
   * @param propertyValue Property value
   * @param postcode Property postcode
   * @param propertyType Type of property
   * @returns Whether the loan meets LVR requirements
   */
  public meetsLvrRequirements(
    loanAmount: number,
    propertyValue: number,
    postcode: string,
    propertyType: PropertyType = PropertyType.HOUSE
  ): boolean {
    const maxLvr = this.getMaxAllowedLvr(postcode, propertyType);
    const calculatedLvr = this.calculateLvr(loanAmount, propertyValue);
    
    return calculatedLvr <= maxLvr;
  }
}

export default LvrService;

// src/services/UtilityService.ts
import { FrequencyType } from '../types/ServiceabilityTypes';
import { FREQUENCY_MULTIPLIERS } from '../constants/ServiceabilityConstants';

export class UtilityService {
  /**
   * Convert an amount from one frequency to another
   * @param amount The amount to convert
   * @param fromFrequency The source frequency
   * @param toFrequency The target frequency
   * @returns Converted amount
   */
  public convertFrequency(
    amount: number,
    fromFrequency: FrequencyType,
    toFrequency: FrequencyType
  ): number {
    if (amount <= 0) return 0;
    if (fromFrequency === toFrequency) return amount;
    
    // Convert to annual amount first
    const annualAmount = amount * FREQUENCY_MULTIPLIERS[fromFrequency];
    
    // Then convert from annual to target frequency
    return annualAmount / FREQUENCY_MULTIPLIERS[toFrequency];
  }

  /**
   * Convert an amount to annual frequency
   * @param amount The amount to convert
   * @param frequency The source frequency
   * @returns Annual amount
   */
  public convertToAnnual(amount: number, frequency: FrequencyType): number {
    return this.convertFrequency(amount, frequency, FrequencyType.YEARLY);
  }

  /**
   * Convert an amount to monthly frequency
   * @param amount The amount to convert
   * @param frequency The source frequency
   * @returns Monthly amount
   */
  public convertToMonthly(amount: number, frequency: FrequencyType): number {
    return this.convertFrequency(amount, frequency, FrequencyType.MONTHLY);
  }

  /**
   * Calculate mortgage repayment (principal and interest)
   * @param loanAmount Loan amount
   * @param interestRate Annual interest rate (as a decimal, e.g., 0.05 for 5%)
   * @param loanTerm Loan term in years
   * @returns Monthly repayment amount
   */
  public calculateMortgageRepayment(
    loanAmount: number,
    interestRate: number,
    loanTerm: number
  ): number {
    if (loanAmount <= 0 || interestRate <= 0 || loanTerm <= 0) return 0;
    
    // Convert annual interest rate to monthly
    const monthlyRate = interestRate / 12;
    
    // Convert loan term to months
    const termMonths = loanTerm * 12;
    
    // Calculate monthly repayment using the standard mortgage formula
    return (
      loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1)
    );
  }

  /**
   * Calculate interest-only repayment
   * @param loanAmount Loan amount
   * @param interestRate Annual interest rate (as a decimal, e.g., 0.05 for 5%)
   * @returns Monthly interest-only repayment
   */
  public calculateInterestOnlyRepayment(
    loanAmount: number,
    interestRate: number
  ): number {
    if (loanAmount <= 0 || interestRate <= 0) return 0;
    
    // Interest only is simply the interest amount
    return (loanAmount * interestRate) / 12;
  }
  
  /**
   * Round a number to a specified number of decimal places
   * @param value The value to round
   * @param decimals Number of decimal places
   * @returns Rounded value
   */
  public round(value: number, decimals: number = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}

export default UtilityService;



// src/services/IncomeService.ts
import { 
  IncomeBeforeRentalPropertyTier,
  Employment,
  RentalIncomeBeforeTier,
  OtherIncome,
  FrequencyType,
  JobType,
  OtherIncomeType
} from '../types/ServiceabilityTypes';
import { INCOME_SHADING } from '../constants/ServiceabilityConstants';
import UtilityService from './UtilityService';

export class IncomeService {
  private utilityService: UtilityService;

  constructor() {
    this.utilityService = new UtilityService();
  }

  /**
   * Calculate total annual gross income
   * @param income Income object
   * @returns Total annual gross income
   */
  public calculateGrossIncome(income: IncomeBeforeRentalPropertyTier): number {
    const employmentIncome = this.calculateEmploymentIncome(income.employments);
    const rentalIncome = this.calculateRentalIncome(income.rentals);
    const otherIncome = this.calculateOtherIncome(income.others);
    
    return employmentIncome + rentalIncome + otherIncome;
  }

  /**
   * Calculate shaded annual gross income
   * @param income Income object
   * @returns Total shaded annual gross income
   */
  public calculateShadedGrossIncome(income: IncomeBeforeRentalPropertyTier): number {
    const shadedEmploymentIncome = this.calculateShadedEmploymentIncome(income.employments);
    const shadedRentalIncome = this.calculateShadedRentalIncome(income.rentals);
    const shadedOtherIncome = this.calculateShadedOtherIncome(income.others);
    
    return shadedEmploymentIncome + shadedRentalIncome + shadedOtherIncome;
  }

  /**
   * Calculate total annual taxable income
   * @param income Income object
   * @returns Total annual taxable income
   */
  public calculateTaxableIncome(income: IncomeBeforeRentalPropertyTier): number {
    const employmentIncome = this.calculateEmploymentIncome(income.employments);
    const rentalIncome = this.calculateRentalIncome(income.rentals);
    
    // Filter other income to only include taxable income types
    const taxableOtherIncome = income.others.filter(
      other => this.isOtherIncomeTaxable(other.type)
    );
    
    const otherIncome = this.calculateOtherIncome(taxableOtherIncome);
    
    return employmentIncome + rentalIncome + otherIncome;
  }

  /**
   * Calculate shaded annual taxable income
   * @param income Income object
   * @returns Total shaded annual taxable income
   */
  public calculateShadedTaxableIncome(income: IncomeBeforeRentalPropertyTier): number {
    const shadedEmploymentIncome = this.calculateShadedEmploymentIncome(income.employments);
    const shadedRentalIncome = this.calculateShadedRentalIncome(income.rentals);
    
    // Filter other income to only include taxable income types
    const taxableOtherIncome = income.others.filter(
      other => this.isOtherIncomeTaxable(other.type)
    );
    
    const shadedOtherIncome = this.calculateShadedOtherIncome(taxableOtherIncome);
    
    return shadedEmploymentIncome + shadedRentalIncome + shadedOtherIncome;
  }

  /**
   * Calculate total annual employment income
   * @param employments List of employment records
   * @returns Total annual employment income
   */
  private calculateEmploymentIncome(employments: Employment[]): number {
    return employments.reduce((total, employment) => {
      // Convert salary to annual
      const annualSalary = this.utilityService.convertToAnnual(
        employment.salary,
        employment.salaryFrequency
      );
      
      // Add bonus if present
      const annualBonus = employment.bonus && employment.bonusFrequency 
        ? this.utilityService.convertToAnnual(employment.bonus, employment.bonusFrequency)
        : 0;
      
      // Add overtime if present
      const annualOvertime = employment.regularOvertimeAndShiftAllowance && employment.regularOvertimeAndShiftAllowanceFrequency
        ? this.utilityService.convertToAnnual(
            employment.regularOvertimeAndShiftAllowance,
            employment.regularOvertimeAndShiftAllowanceFrequency
          )
        : 0;
      
      // Add commission if present
      const annualCommission = employment.commission && employment.commissionFrequency
        ? this.utilityService.convertToAnnual(
            employment.commission,
            employment.commissionFrequency
          )
        : 0;
      
      // Add car allowance if present
      const annualCarAllowance = employment.carAllowance && employment.carAllowanceFrequency
        ? this.utilityService.convertToAnnual(
            employment.carAllowance,
            employment.carAllowanceFrequency
          )
        : 0;
      
      return total + annualSalary + annualBonus + annualOvertime + annualCommission + annualCarAllowance;
    }, 0);
  }

  /**
   * Calculate shaded annual employment income
   * @param employments List of employment records
   * @returns Total shaded annual employment income
   */
  private calculateShadedEmploymentIncome(employments: Employment[]): number {
    return employments.reduce((total, employment) => {
      // Get shading factor for this job type
      const shadingFactor = INCOME_SHADING.EMPLOYMENT[employment.jobType];
      
      // Convert salary to annual and apply shading
      const annualSalary = this.utilityService.convertToAnnual(
        employment.salary,
        employment.salaryFrequency
      ) * shadingFactor;
      
      // Add bonus if present
      const annualBonus = employment.bonus && employment.bonusFrequency 
        ? this.utilityService.convertToAnnual(employment.bonus, employment.bonusFrequency) * shadingFactor
        : 0;
      
      // Add overtime if present
      const annualOvertime = employment.regularOvertimeAndShiftAllowance && employment.regularOvertimeAndShiftAllowanceFrequency
        ? this.utilityService.convertToAnnual(
            employment.regularOvertimeAndShiftAllowance,
            employment.regularOvertimeAndShiftAllowanceFrequency
          ) * shadingFactor
        : 0;
      
      // Add commission if present
      const annualCommission = employment.commission && employment.commissionFrequency
        ? this.utilityService.convertToAnnual(
            employment.commission,
            employment.commissionFrequency
          ) * shadingFactor
        : 0;
      
      // Add car allowance if present
      const annualCarAllowance = employment.carAllowance && employment.carAllowanceFrequency
        ? this.utilityService.convertToAnnual(
            employment.carAllowance,
            employment.carAllowanceFrequency
          ) * shadingFactor
        : 0;
      
      return total + annualSalary + annualBonus + annualOvertime + annualCommission + annualCarAllowance;
    }, 0);
  }

  /**
   * Calculate total annual rental income
   * @param rentals List of rental income records
   * @returns Total annual rental income
   */
  private calculateRentalIncome(rentals: RentalIncomeBeforeTier[]): number {
    return rentals.reduce((total, rental) => {
      // Convert to annual
      const annualRental = this.utilityService.convertToAnnual(
        rental.proportionalAmount,
        rental.proportionalAmountFrequency
      );
      
      return total + annualRental;
    }, 0);
  }

  /**
   * Calculate shaded annual rental income
   * @param rentals List of rental income records
   * @returns Total shaded annual rental income
   */
  private calculateShadedRentalIncome(rentals: RentalIncomeBeforeTier[]): number {
    // Apply rental income shading factor
    const shadingFactor = INCOME_SHADING.OTHER.RENTAL_INCOME;
    
    return rentals.reduce((total, rental) => {
      // Convert to annual and apply shading
      const annualRental = this.utilityService.convertToAnnual(
        rental.proportionalAmount,
        rental.proportionalAmountFrequency
      ) * shadingFactor;
      
      return total + annualRental;
    }, 0);
  }

  /**
   * Calculate total annual other income
   * @param others List of other income records
   * @returns Total annual other income
   */
  private calculateOtherIncome(others: OtherIncome[]): number {
    return others.reduce((total, other) => {
      // Convert to annual
      const annualOther = this.utilityService.convertToAnnual(
        other.proportionalAmount,
        other.proportionalAmountFrequency
      );
      
      return total + annualOther;
    }, 0);
  }

  /**
   * Calculate shaded annual other income
   * @param others List of other income records
   * @returns Total shaded annual other income
   */
  private calculateShadedOtherIncome(others: OtherIncome[]): number {
    return others.reduce((total, other) => {
      // Get shading factor for this income type
      const shadingFactor = INCOME_SHADING.OTHER[other.type] || 0.8; // Default to 80% if not found
      
      // Convert to annual and apply shading
      const annualOther = this.utilityService.convertToAnnual(
        other.proportionalAmount,
        other.proportionalAmountFrequency
      ) * shadingFactor;
      
      return total + annualOther;
    }, 0);
  }

  /**
   * Check if an income type is taxable
   * @param incomeType Income type to check
   * @returns Whether the income is taxable
   */
  private isOtherIncomeTaxable(incomeType: OtherIncomeType): boolean {
    // These income types are typically not taxable
    const nonTaxableIncomeTypes = [
      OtherIncomeType.CHILD_SUPPORT_INCOME,
      OtherIncomeType.GOVERNMENT_BENEFITS_NEWSTART_OR_SICKNESS,
      OtherIncomeType.GOVERNMENT_FAMILY_PAYMENTS,
      OtherIncomeType.GOVERNMENT_INCOME_OTHER
    ];
    
    return !nonTaxableIncomeTypes.includes(incomeType);
  }
}

export default IncomeService;

// src/services/ExpenseService.ts
import { 
  Expense, 
  OtherDebt, 
  OtherDebtType, 
  OtherMortgage, 
  RepaymentType
} from '../types/ServiceabilityTypes';
import { 
  EXPENSE_CATEGORIES, 
  DEBT_CALCULATIONS, 
  RATE_BUFFERS 
} from '../constants/ServiceabilityConstants';
import UtilityService from './UtilityService';

export class ExpenseService {
  private utilityService: UtilityService;

  constructor() {
    this.utilityService = new UtilityService();
  }

  /**
   * Calculate annual fixed expenses
   * @param expenses List of expenses
   * @returns Total annual fixed expenses
   */
  public calculateFixedExpenses(expenses: Expense[]): number {
    return expenses
      .filter(expense => EXPENSE_CATEGORIES.FIXED.includes(expense.type))
      .reduce((total, expense) => {
        // Convert to annual
        const annualExpense = this.utilityService.convertToAnnual(
          expense.amount,
          expense.amountFrequency
        );
        
        return total + annualExpense;
      }, 0);
  }

  /**
   * Calculate annual living expenses
   * @param expenses List of expenses
   * @returns Total annual living expenses
   */
  public calculateLivingExpenses(expenses: Expense[]): number {
    return expenses
      .filter(expense => EXPENSE_CATEGORIES.LIVING.includes(expense.type))
      .reduce((total, expense) => {
        // Convert to annual
        const annualExpense = this.utilityService.convertToAnnual(
          expense.amount,
          expense.amountFrequency
        );
        
        return total + annualExpense;
      }, 0);
  }

  /**
   * Calculate annual investment expenses
   * @param expenses List of expenses
   * @returns Total annual investment expenses
   */
  public calculateInvestmentExpenses(expenses: Expense[]): number {
    return expenses
      .filter(expense => EXPENSE_CATEGORIES.INVESTMENT.includes(expense.type))
      .reduce((total, expense) => {
        // Convert to annual
        const annualExpense = this.utilityService.convertToAnnual(
          expense.amount,
          expense.amountFrequency
        );
        
        return total + annualExpense;
      }, 0);
  }

  /**
   * Calculate annual buffered other debt repayments
   * @param otherDebts List of other debts
   * @returns Total annual buffered repayments
   */
  public calculateOtherDebtRepayments(otherDebts: OtherDebt[]): number {
    return otherDebts.reduce((total, debt) => {
      let annualRepayment = 0;
      
      if (debt.type === OtherDebtType.CREDIT_CARD) {
        // Credit cards are calculated as a percentage of the limit
        annualRepayment = debt.limitValue * DEBT_CALCULATIONS.CREDIT_CARD_REPAYMENT_FACTOR * 12;
      } else if (debt.customerDeclaredRepaymentAmount && debt.repaymentFrequency) {
        // If repayment amount is provided, use that
        annualRepayment = this.utilityService.convertToAnnual(
          debt.customerDeclaredRepaymentAmount,
          debt.repaymentFrequency
        );
      } else if (debt.balance && debt.balance > 0) {
        // For other debts, assume a standard loan structure if no repayment amount provided
        // Use balance rather than limit for the calculation
        const balance = debt.balance || debt.limitValue;
        const monthlyRepayment = this.utilityService.calculateMortgageRepayment(
          balance,
          0.06, // Assume 6% interest for personal loans etc.
          DEBT_CALCULATIONS.LOAN_DEFAULT_TERM
        );
        annualRepayment = monthlyRepayment * 12;
      }
      
      return total + annualRepayment;
    }, 0);
  }

  /**
   * Calculate annual buffered mortgage repayments
   * @param otherMortgages List of other mortgages
   * @param useReducedBuffer Whether to use the reduced buffer rate
   * @returns Total annual buffered repayments
   */
  public calculateOtherMortgageRepayments(
    otherMortgages: OtherMortgage[], 
    useReducedBuffer: boolean = false
  ): number {
    const bufferRate = useReducedBuffer 
      ? RATE_BUFFERS.REDUCED 
      : RATE_BUFFERS.STANDARD;
      
    return otherMortgages.reduce((total, mortgage) => {
      // Apply buffer to the interest rate
      const bufferedRate = (mortgage.interestRate || 0) / 100 + bufferRate;
      
      // Get remaining term, or use default
      const remainingTerm = mortgage.remainingTerm || DEBT_CALCULATIONS.LOAN_DEFAULT_TERM;
      
      let annualRepayment = 0;
      
      if (mortgage.repaymentType === RepaymentType.IO) {
        // For IO loans, calculate interest-only repayment
        const monthlyRepayment = this.utilityService.calculateInterestOnlyRepayment(
          mortgage.outstandingBalance,
          bufferedRate
        );
        annualRepayment = monthlyRepayment * 12;
      } else {
        // For P&I loans, calculate full repayment
        const monthlyRepayment = this.utilityService.calculateMortgageRepayment(
          mortgage.outstandingBalance,
          bufferedRate,
          remainingTerm
        );
        annualRepayment = monthlyRepayment * 12;
      }
      
      return total + annualRepayment;
    }, 0);
  }

  /**
   * Calculate new loan repayment with buffered rate
   * @param loanAmount Loan amount
   * @param interestRate Base interest rate (%)
   * @param loanTerm Loan term in years
   * @param isInterestOnly Whether the loan is interest-only
   * @param interestOnlyPeriod Interest-only period in years
   * @param useReducedBuffer Whether to use the reduced buffer rate
   * @returns Annual buffered repayment
   */
  public calculateNewLoanRepayment(
    loanAmount: number,
    interestRate: number,
    loanTerm: number,
    isInterestOnly: boolean = false,
    interestOnlyPeriod: number = 0,
    useReducedBuffer: boolean = false
  ): number {
    // Convert interest rate to decimal and apply buffer
    const bufferRate = useReducedBuffer 
      ? RATE_BUFFERS.REDUCED 
      : RATE_BUFFERS.STANDARD;
    
    const bufferedRate = interestRate / 100 + bufferRate;
    
    let annualRepayment = 0;
    
    if (isInterestOnly && interestOnlyPeriod > 0) {
      // For IO loans, calculate interest-only repayment
      const monthlyRepayment = this.utilityService.calculateInterestOnlyRepayment(
        loanAmount,
        bufferedRate
      );
      annualRepayment = monthlyRepayment * 12;
    } else {
      // For P&I loans, calculate full repayment
      const monthlyRepayment = this.utilityService.calculateMortgageRepayment(
        loanAmount,
        bufferedRate,
        loanTerm
      );
      annualRepayment = monthlyRepayment * 12;
    }
    
    return annualRepayment;
  }
}

export default ExpenseService;

// src/services/ServiceabilityService.ts
import {
  ServiceabilityRequest,
  ServiceabilityResponse,
  ApplicantResponse,
  MaritalStatusType,
  RentalProperty,
  CollateralResponse,
  ApplicantType,
  RepaymentType
} from '../types/ServiceabilityTypes';
import TaxCalculatorService from './TaxCalculatorService';
import HemService from './HemService';
import LvrService from './LvrService';
import IncomeService from './IncomeService';
import ExpenseService from './ExpenseService';
import UtilityService from './UtilityService';
import { API_VERSION, GLOBAL_LIMITS } from '../constants/ServiceabilityConstants';
import { PropertyType } from '../data/PostcodeLvrData';

export class ServiceabilityService {
  private taxCalculator: TaxCalculatorService;
  private hemService: HemService;
  private lvrService: LvrService;
  private incomeService: IncomeService;
  private expenseService: ExpenseService;
  private utilityService: UtilityService;

  constructor() {
    this.taxCalculator = new TaxCalculatorService();
    this.hemService = new HemService();
    this.lvrService = new LvrService();
    this.incomeService = new IncomeService();
    this.expenseService = new ExpenseService();
    this.utilityService = new UtilityService();
  }

  /**
   * Calculate serviceability based on the request
   * @param request Serviceability request
   * @returns Serviceability response
   */
  public calculate(request: ServiceabilityRequest): ServiceabilityResponse {
    // Validate request
    this.validateRequest(request);

    // Process each applicant
    const applicantResponses: ApplicantResponse[] = request.applicants.map(applicant => {
      // Get household information for this applicant
      const household = request.households.find(household => 
        household.applicants.some(householdApplicant => 
          householdApplicant.partyId === applicant.partyId
        )
      );

      if (!household) {
        throw new Error(`No household found for applicant ${applicant.partyId}`);
      }

      // Calculate income
      const grossIncome = this.incomeService.calculateGrossIncome(applicant.incomes);
      const grossTaxableIncome = this.incomeService.calculateTaxableIncome(applicant.incomes);
      const shadedGrossTaxableIncome = this.incomeService.calculateShadedTaxableIncome(applicant.incomes);

      // Calculate negative gearing (deductible interest)
      const deductibleInterest = this.calculateDeductibleInterest(
        request.loanAmount,
        request.interestRateOngoing,
        request.negativeGearingPercentage || 0,
        request.otherMortgages || []
      );

      // Adjust income for deductible interest
      const grossIncomeAfterDeductible = grossIncome;
      const shadedGrossTaxableIncomeAfterDeductible = Math.max(0, shadedGrossTaxableIncome - deductibleInterest);

      // Calculate net income after tax
      const shadedNetIncome = this.taxCalculator.calculateNetIncome(shadedGrossTaxableIncomeAfterDeductible);

      // Calculate expenses
      const declaredFixedExpenses = this.expenseService.calculateFixedExpenses(applicant.expenses);
      const declaredLivingExpenses = this.expenseService.calculateLivingExpenses(applicant.expenses);

      // Calculate HEM
      let hem = applicant.hem || 0;
      if (!hem && household.addressPostcode) {
        // If HEM is not provided, calculate it
        const maritalStatus = request.applicants.length > 1 
          ? MaritalStatusType.MARRIED 
          : (applicant.maritalStatus || MaritalStatusType.SINGLE);
        
        hem = this.hemService.calculateHem(
          household.addressPostcode,
          grossIncome,
          maritalStatus,
          household.noOfDependents
        );
      }

      // Use higher of HEM or declared living expenses
      const higherOfHemOrLivingExpenses = Math.max(hem, declaredLivingExpenses);

      // Calculate total buffered expenses
      const bufferedTotalExpenses = declaredFixedExpenses + higherOfHemOrLivingExpenses;

      // Get rental property tiers
      const rentalProperties: RentalProperty[] = applicant.incomes.rentals.map(rental => ({
        incomeId: rental.incomeId,
        propertyTier: 1 // Default to Tier 1, would be determined by property attributes
      }));

      return {
        partyId: applicant.partyId,
        applicantType: applicant.applicantType,
        grossIncome,
        grossTaxableIncome,
        shadedGrossTaxableIncome,
        deductibleInterest,
        grossIncomeAfterDeductible,
        shadedGrossTaxableIncomeAfterDeductible,
        shadedNetIncome,
        declaredFixedExpenses,
        declaredLivingExpenses,
        hem,
        higherOfHemOrLivingExpenses,
        bufferedTotalExpenses,
        rentalProperties
      };
    });

    // Calculate external debt repayments
    const extBufferedDebtRepayments = 
      this.expenseService.calculateOtherDebtRepayments(request.otherDebts || []) +
      this.expenseService.calculateOtherMortgageRepayments(
        request.otherMortgages || [], 
        request.shouldUseLowerRateBuffer || false
      );

    // Calculate Athena loan repayments
    const isInterestOnly = request.interestOnlyPeriod && request.interestOnlyPeriod > 0;
    const athBufferedRepayments = this.expenseService.calculateNewLoanRepayment(
      request.loanAmount,
      request.interestRateOngoing,
      request.loanTerm,
      isInterestOnly,
      request.interestOnlyPeriod,
      request.shouldUseLowerRateBuffer || false
    );

    // Calculate the rate buffer used
    const rateBuffer = request.shouldUseLowerRateBuffer 
      ? RATE_BUFFERS.REDUCED 
      : RATE_BUFFERS.STANDARD;

    // Calculate total annual net income
    const totalNetIncome = applicantResponses.reduce(
      (total, applicant) => total + applicant.shadedNetIncome, 
      0
    );

    // Calculate total annual expenses including debt repayments
    const totalExpenses = applicantResponses.reduce(
      (total, applicant) => total + applicant.bufferedTotalExpenses, 
      0
    ) + extBufferedDebtRepayments + athBufferedRepayments;

    // Calculate net surplus or deficit
    const netSurplusOrDeficit = totalNetIncome - totalExpenses;

    // Calculate total gross income
    const totalGrossIncome = applicantResponses.reduce(
      (total, applicant) => total + applicant.grossIncome, 
      0
    );

    // Calculate debt-income ratio
    const totalDebt = request.loanAmount + 
      (request.otherMortgages || []).reduce((total, mortgage) => total + mortgage.outstandingBalance, 0) +
      (request.otherDebts || []).reduce((total, debt) => total + (debt.balance || debt.limitValue), 0);
    
    const debtIncomeRatio = totalGrossIncome > 0 
      ? (totalDebt / totalGrossIncome) * 100 
      : 0;

    // Calculate debt-service ratio
    const totalRepayments = extBufferedDebtRepayments + athBufferedRepayments;
    const debtServiceRatio = totalGrossIncome > 0 
      ? (totalRepayments / totalGrossIncome) * 100 
      : 0;

    // Determine collateral tiers
    const collaterals: CollateralResponse[] | undefined = request.collaterals 
      ? request.collaterals.map(collateral => ({
          id: collateral.id,
          tier: 1 // Default to Tier 1, would be determined by property attributes
        }))
      : undefined;

    // Build the response
    const response: ServiceabilityResponse = {
      applicants: applicantResponses,
      extBufferedDebtRepayments,
      athBufferedRepayments,
      rateBuffer,
      netSurplusOrDeficit,
      debtIncomeRatio,
      debtServiceRatio,
      collaterals,
      versions: {
        api: API_VERSION.API,
        logic: API_VERSION.LOGIC
      }
    };

    return response;
  }

  /**
   * Validate the request
   * @param request Serviceability request
   */
  private validateRequest(request: ServiceabilityRequest): void {
    // Check loan term
    if (request.loanTerm < GLOBAL_LIMITS.MIN_LOAN_TERM || request.loanTerm > GLOBAL_LIMITS.MAX_LOAN_TERM) {
      throw new Error(`Loan term must be between ${GLOBAL_LIMITS.MIN_LOAN_TERM} and ${GLOBAL_LIMITS.MAX_LOAN_TERM} years`);
    }

    // Check loan amount
    if (request.loanAmount <= 0 || request.loanAmount > GLOBAL_LIMITS.MAX_BORROWING) {
      throw new Error(`Loan amount must be positive and not exceed ${GLOBAL_LIMITS.MAX_BORROWING}`);
    }

    // Check interest rate
    if (request.interestRateOngoing <= 0) {
      throw new Error('Interest rate must be positive');
    }

    // Check applicants
    if (!request.applicants || request.applicants.length === 0) {
      throw new Error('At least one applicant is required');
    }

    // Check households
    if (!request.households || request.households.length === 0) {
      throw new Error('At least one household is required');
    }

    // Check ownership
    if (!request.ownerships || request.ownerships.length === 0) {
      throw new Error('At least one ownership is required');
    }

    // Check ownership proportions sum to 1
    const totalProportion = request.ownerships.reduce((total, ownership) => total + ownership.proportion, 0);
    if (Math.abs(totalProportion - 1) > 0.0001) {
      throw new Error('Ownership proportions must sum to 1');
    }
  }

  /**
   * Calculate deductible interest for negative gearing
   * @param loanAmount New loan amount
   * @param interestRate Interest rate (%)
   * @param negativeGearingPercentage Percentage of loan for negative gearing (0-1)
   * @param otherMortgages Other mortgages
   * @returns Total deductible interest
   */
  private calculateDeductibleInterest(
    loanAmount: number,
    interestRate: number,
    negativeGearingPercentage: number,
    otherMortgages: OtherMortgage[]
  ): number {
    // Calculate deductible interest for the new loan
    const newLoanDeductibleInterest = loanAmount * (interestRate / 100) * negativeGearingPercentage;

    // Calculate deductible interest for other mortgages
    const otherMortgagesDeductibleInterest = otherMortgages.reduce((total, mortgage) => {
      if (mortgage.purpose === 'INVESTMENT' && mortgage.negativeGearingPercentage) {
        // For investment properties, the interest is deductible
        const mortgageDeductibleInterest = 
          mortgage.outstandingBalance * 
          (mortgage.interestRate || 0) / 100 * 
          mortgage.negativeGearingPercentage;
        return total + mortgageDeductibleInterest;
      }
      return total;
    }, 0);

    return newLoanDeductibleInterest + otherMortgagesDeductibleInterest;
  }

  /**
   * Calculate maximum borrowing power based on serviceability
   * @param request Base serviceability request (without loan amount)
   * @returns Maximum borrowing power
   */
  public calculateMaxBorrowingPower(baseRequest: Omit<ServiceabilityRequest, 'loanAmount'> & { propertyValue: number }): number {
    // Try to estimate a reasonable loan amount to start with
    let targetLoanAmount = baseRequest.propertyValue * 0.7; // Start with 70% LVR as a guess
    let minLoanAmount = 0;
    let maxLoanAmount = GLOBAL_LIMITS.MAX_BORROWING;
    let iterations = 0;
    const maxIterations = 20; // Prevent infinite loop
    
    while (iterations < maxIterations) {
      iterations++;
      
      // Create a request with the current target loan amount
      const request: ServiceabilityRequest = {
        ...baseRequest,
        loanAmount: targetLoanAmount
      };
      
      try {
        // Calculate serviceability for this loan amount
        const response = this.calculate(request);
        
        if (response.netSurplusOrDeficit >= 0) {
          // If we have a surplus, we can potentially borrow more
          minLoanAmount = targetLoanAmount;
          targetLoanAmount = Math.min(maxLoanAmount, targetLoanAmount * 1.1);
          
          // If we're close to the max, we've found our answer
          if (Math.abs(targetLoanAmount - maxLoanAmount) < 1000) {
            return this.utilityService.round(targetLoanAmount);
          }
        } else {
          // If we have a deficit, we need to borrow less
          maxLoanAmount = targetLoanAmount;
          targetLoanAmount = (minLoanAmount + targetLoanAmount) / 2;
          
          // If the range is narrow enough, we've found our answer
          if (Math.abs(maxLoanAmount - minLoanAmount) < 1000) {
            return this.utilityService.round(minLoanAmount);
          }
        }
      } catch (error) {
        // If calculation fails, reduce loan amount
        maxLoanAmount = targetLoanAmount;
        targetLoanAmount = (minLoanAmount + targetLoanAmount) / 2;
      }
    }
    
    // If we've exhausted iterations, return the last known good value
    return this.utilityService.round(minLoanAmount);
  }

  /**
   * Calculate maximum borrowing power based on deposit
   * @param savings Total available savings
   * @param propertyPostcode Property postcode
   * @param isFirstHomeBuyer Whether the applicant is a first home buyer
   * @param isInvestmentProperty Whether the property is for investment
   * @returns Maximum borrowing power based on deposit
   */
  public calculateMaxBorrowingPowerByDeposit(
    savings: number,
    propertyPostcode: string,
    isFirstHomeBuyer: boolean = false,
    isInvestmentProperty: boolean = false
  ): number {
    // Get max LVR for the property
    const maxLvr = this.lvrService.getMaxAllowedLvr(propertyPostcode) / 100;
    
    if (maxLvr <= 0) {
      return 0; // No lending allowed for this postcode
    }
    
    // Estimate upfront costs - this would normally be calculated based on stamp duty tables
    const upfrontCostFactor = isFirstHomeBuyer ? 0.03 : 0.05; // Rough estimate including stamp duty
    
    // Use an iterative approach to find the maximum property price
    let targetPropertyPrice = savings / upfrontCostFactor;
    let minPropertyPrice = 0;
    let maxPropertyPrice = savings * 20; // Arbitrary large value
    let iterations = 0;
    const maxIterations = 20; // Prevent infinite loop
    
    while (iterations < maxIterations) {
      iterations++;
      
      // Calculate upfront costs for this property price
      const upfrontCosts = targetPropertyPrice * upfrontCostFactor;
      
      // Calculate available deposit after upfront costs
      const availableDeposit = savings - upfrontCosts;
      
      if (availableDeposit <= 0) {
        // If no deposit is available, reduce property price
        maxPropertyPrice = targetPropertyPrice;
        targetPropertyPrice = (minPropertyPrice + targetPropertyPrice) / 2;
        continue;
      }
      
      // Calculate required deposit
      const requiredDeposit = targetPropertyPrice * (1 - maxLvr);
      
      if (Math.abs(availableDeposit - requiredDeposit) < 1000) {
        // If we're close enough, we've found our answer
        break;
      }
      
      if (availableDeposit > requiredDeposit) {
        // If available deposit exceeds required, we can increase property price
        minPropertyPrice = targetPropertyPrice;
        targetPropertyPrice = Math.min(maxPropertyPrice, targetPropertyPrice * 1.1);
      } else {
        // If available deposit is less than required, we need to decrease property price
        maxPropertyPrice = targetPropertyPrice;
        targetPropertyPrice = (minPropertyPrice + targetPropertyPrice) / 2;
      }
    }
    
    // Calculate loan amount based on final property price
    const upfrontCosts = targetPropertyPrice * upfrontCostFactor;
    const availableDeposit = savings - upfrontCosts;
    const loanAmount = Math.max(0, targetPropertyPrice - availableDeposit);
    
    return this.utilityService.round(Math.min(loanAmount, GLOBAL_LIMITS.MAX_BORROWING));
  }
}

export default ServiceabilityService;


// src/index.ts
// Export all types
export * from './types/ServiceabilityTypes';

// Export services
export { default as ServiceabilityService } from './services/ServiceabilityService';
export { default as TaxCalculatorService } from './services/TaxCalculatorService';
export { default as HemService } from './services/HemService';
export { default as LvrService } from './services/LvrService';
export { default as IncomeService } from './services/IncomeService';
export { default as ExpenseService } from './services/ExpenseService';
export { default as UtilityService } from './services/UtilityService';

// Export constants
export { RATE_BUFFERS, GLOBAL_LIMITS, FREQUENCY_MULTIPLIERS } from './constants/ServiceabilityConstants';

// Export data and enums
export { PropertyType } from './data/PostcodeLvrData';
export { CURRENT_FINANCIAL_YEAR } from './data/TaxRates';