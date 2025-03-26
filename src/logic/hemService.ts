import { HEM_LOOKUP } from '../data/hemLookupTable';
import { INCOME_RANGES } from '../data/hemIncomeRanges';
import { getHemLocationId } from '../data/hemPostcodeMapping';
import { HEMParameters, HEMResult, MaritalStatusType } from '../types/FinancialTypes';
import { GLOBAL_LIMITS } from '../constants/financialConstants';

/**
 * Get the income range ID for a given gross income
 * @param grossIncome Annual gross income
 * @returns The income range ID
 */
export function getIncomeRangeId(grossIncome: number): number {
  const range = INCOME_RANGES.find(
    range => grossIncome >= range.amountFrom && grossIncome <= range.amountTo
  );
  
  if (!range) {
    console.log(`No income range found for $${grossIncome.toLocaleString()}, defaulting to lowest range (1)`);
    return 1; // Default to lowest range
  }
  
  console.log(`Income range for $${grossIncome.toLocaleString()}: ${range.incomeRangeId} ($${range.amountFrom.toLocaleString()} to $${range.amountTo.toLocaleString()})`);
  return range.incomeRangeId;
}

/**
 * Normalize marital status for HEM lookup
 * @param maritalStatus Marital status input (can be undefined)
 * @returns 'single' or 'married' for HEM calculation
 */
export function normalizeMaritalStatus(maritalStatus?: MaritalStatusType): MaritalStatusType {
  const normalized = maritalStatus || 'single';
  console.log(`Marital status normalized to: "${normalized}"`);
  return normalized;
}

/**
 * Normalize dependents count for HEM lookup
 * @param dependents Number of dependents
 * @returns Normalized dependents count (max 3 for HEM)
 */
export function normalizeDependents(dependents: number): number {
  if (dependents < 0) {
    console.log(`Negative dependents value (${dependents}), normalizing to 0`);
    return 0;
  }
  
  const maxDependents = GLOBAL_LIMITS.MAX_DEPENDENTS_FOR_HEM;
  const normalized = Math.min(dependents, maxDependents);
  
  if (normalized < dependents) {
    console.log(`Dependents capped from ${dependents} to ${normalized} (HEM max: ${maxDependents})`);
  } else {
    console.log(`Dependents: ${normalized}`);
  }
  
  return normalized;
}

/**
 * Calculate HEM value based on financial inputs
 * @param params HEM calculation parameters
 * @returns HEM calculation result
 */
export function calculateHEM(params: HEMParameters): HEMResult {
  console.log(`\n--- HEM CALCULATION ---`);
  console.log(`Input parameters: postcode="${params.postcode}", grossIncome=$${params.grossIncome.toLocaleString()}, maritalStatus="${params.maritalStatus}", dependents=${params.dependents}`);
  
  const { postcode, grossIncome, maritalStatus, dependents } = params;
  
  // Get HEM location ID from postcode
  const locationId = getHemLocationId(postcode);
  console.log(`Location ID for postcode ${postcode}: ${locationId}`);
  
  // Get income range ID from gross income
  const incomeRangeId = getIncomeRangeId(grossIncome);
  
  // Normalize marital status and dependents
  const normalizedMaritalStatus = normalizeMaritalStatus(maritalStatus);
  const normalizedDependents = normalizeDependents(dependents);
  
  console.log(`Looking up HEM value with: locationId=${locationId}, maritalStatus="${normalizedMaritalStatus}", dependents=${normalizedDependents}, incomeRangeId=${incomeRangeId}`);
  
  // Find matching HEM record
  const hemRecord = HEM_LOOKUP.find(
    record => 
      record.hemLocationId === locationId &&
      record.maritalStatusId === normalizedMaritalStatus &&
      record.dependants === normalizedDependents &&
      record.incomeRangeId === incomeRangeId
  );
  
  if (!hemRecord) {
    console.log(`No exact HEM match found, attempting fallback strategies...`);
    
    // If no exact match, find the closest match
    // Try with a different income range
    const closestIncomeMatch = HEM_LOOKUP.find(
      record => 
        record.hemLocationId === locationId &&
        record.maritalStatusId === normalizedMaritalStatus &&
        record.dependants === normalizedDependents
    );
    
    if (closestIncomeMatch) {
      console.log(`Found match with different income range: incomeRangeId=${closestIncomeMatch.incomeRangeId}, weeklyValue=$${closestIncomeMatch.weeklyValue}, annualValue=$${closestIncomeMatch.annualValue.toLocaleString()}`);
      
      return {
        weeklyValue: closestIncomeMatch.weeklyValue,
        annualValue: closestIncomeMatch.annualValue,
        locationId,
        incomeRangeId: closestIncomeMatch.incomeRangeId
      };
    }
    
    // If still no match, try with a default location (metropolitan)
    console.log(`No match with location ${locationId}, trying with default metropolitan location (1)`);
    
    const defaultLocationMatch = HEM_LOOKUP.find(
      record => 
        record.hemLocationId === 1 && // Default to metropolitan (1)
        record.maritalStatusId === normalizedMaritalStatus &&
        record.dependants === normalizedDependents &&
        record.incomeRangeId === incomeRangeId
    );
    
    if (defaultLocationMatch) {
      console.log(`Found match with default metropolitan location: weeklyValue=$${defaultLocationMatch.weeklyValue}, annualValue=$${defaultLocationMatch.annualValue.toLocaleString()}`);
      
      return {
        weeklyValue: defaultLocationMatch.weeklyValue,
        annualValue: defaultLocationMatch.annualValue,
        locationId: 1,
        incomeRangeId
      };
    }
    
    // Last resort: use a default value
    // This should rarely happen with a complete dataset
    const weeklyValue = normalizedMaritalStatus === 'single' ? 450 : 650;
    const annualValue = weeklyValue * 52;
    
    console.log(`No matches found with any strategy, using default fallback values: weeklyValue=$${weeklyValue}, annualValue=$${annualValue.toLocaleString()}`);
    
    return {
      weeklyValue,
      annualValue,
      locationId: 1,
      incomeRangeId: 1
    };
  }
  
  console.log(`HEM match found: weeklyValue=$${hemRecord.weeklyValue}, annualValue=$${hemRecord.annualValue.toLocaleString()}`);
  console.log(`--- END HEM CALCULATION ---\n`);
  
  return {
    weeklyValue: hemRecord.weeklyValue,
    annualValue: hemRecord.annualValue,
    locationId,
    incomeRangeId
  };
}

/**
 * Compare declared expenses with HEM and return the higher value
 * @param declaredExpenses Annual declared living expenses
 * @param hemParameters HEM calculation parameters
 * @returns The higher of declared expenses or HEM
 */
export function getHigherOfDeclaredOrHEM(
  declaredExpenses: number,
  hemParameters: HEMParameters
): { 
  higherAmount: number;
  isHEM: boolean;
  hemAmount: number;
} {
  console.log(`\nComparing declared expenses vs HEM`);
  console.log(`Declared annual expenses: $${declaredExpenses.toLocaleString()}`);
  
  const hemResult = calculateHEM(hemParameters);
  const hemAmount = hemResult.annualValue;
  
  const higherAmount = Math.max(declaredExpenses, hemAmount);
  const isHEM = hemAmount > declaredExpenses;
  
  console.log(`HEM annual amount: $${hemAmount.toLocaleString()}`);
  console.log(`Using ${isHEM ? 'HEM' : 'declared expenses'}: $${higherAmount.toLocaleString()}`);
  
  return {
    higherAmount,
    isHEM,
    hemAmount
  };
} 