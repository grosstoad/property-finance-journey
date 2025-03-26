import { MaritalStatusType } from '../types/FinancialTypes';

interface HEMGrossIncomeRange {
  id: number;
  minIncome: number;
  maxIncome: number;
}

interface PostcodeMapping {
  postcode: string;
  locationId: number;
}

interface HEMLookupEntry {
  hemLocationId: number;
  maritalStatusId: MaritalStatusType;
  dependants: number;
  incomeRangeId: number;
  weeklyValue: number;
}

// In a real application, these would load from actual CSV files
// For this implementation, we're assuming the data will be imported/loaded at runtime

/**
 * Loads the HEM gross income ranges from the CSV file
 * @returns Array of income ranges with their IDs and boundaries
 */
export const loadHEMGrossIncomeRanges = (): HEMGrossIncomeRange[] => {
  // In a real implementation, this would load and parse the CSV file
  // For now, return a hardcoded dataset based on the CSV content
  return [
    { id: 1, minIncome: 0, maxIncome: 26000 },
    { id: 2, minIncome: 26000.01, maxIncome: 39000 },
    { id: 3, minIncome: 39000.01, maxIncome: 52000 },
    { id: 4, minIncome: 52000.01, maxIncome: 65000 },
    { id: 5, minIncome: 65000.01, maxIncome: 78000 },
    { id: 6, minIncome: 78000.01, maxIncome: 104000 },
    { id: 7, minIncome: 104000.01, maxIncome: 130000 },
    { id: 8, minIncome: 130000.01, maxIncome: 156000 },
    { id: 9, minIncome: 156000.01, maxIncome: 182000 },
    { id: 10, minIncome: 182000.01, maxIncome: 208000 },
    { id: 11, minIncome: 208000.01, maxIncome: 260000 },
    { id: 12, minIncome: 260000.01, maxIncome: 312000 },
    { id: 13, minIncome: 312000.01, maxIncome: 364000 },
    { id: 14, minIncome: 364000.01, maxIncome: Number.MAX_SAFE_INTEGER }
  ];
};

/**
 * Loads the postcode to HEM location mapping from the CSV file
 * @returns Array of postcode mappings to location IDs
 */
export const loadPostcodeMapping = (): PostcodeMapping[] => {
  // In a real implementation, this would load and parse the CSV file
  // For now, return a sample dataset based on the CSV content
  return [
    { postcode: '2000', locationId: 1 }, // Sydney
    { postcode: '2010', locationId: 1 }, // Sydney
    { postcode: '2088', locationId: 1 }, // Sydney
    { postcode: '2089', locationId: 1 }, // Sydney
    { postcode: '2090', locationId: 1 }, // Sydney
    { postcode: '2113', locationId: 1 }, // Sydney
    { postcode: '2120', locationId: 1 }, // Sydney
    // ... more Sydney postcodes
    
    { postcode: '2650', locationId: 2 }, // Regional NSW - Wagga Wagga
    { postcode: '2641', locationId: 2 }, // Regional NSW
    { postcode: '2640', locationId: 2 }, // Regional NSW
    // ... more regional postcodes
    
    { postcode: '3000', locationId: 3 }, // Melbourne
    { postcode: '3004', locationId: 3 }, // Melbourne
    { postcode: '3101', locationId: 3 }, // Melbourne
    // ... more Melbourne postcodes
    
    { postcode: '3820', locationId: 2 }, // Regional VIC
    { postcode: '3825', locationId: 2 }, // Regional VIC
    
    { postcode: '4000', locationId: 4 }, // Brisbane
    { postcode: '5000', locationId: 5 }, // Adelaide
    { postcode: '6000', locationId: 6 }, // Perth
    { postcode: '7000', locationId: 7 }  // Hobart
  ];
};

/**
 * Loads the HEM lookup table from the CSV file
 * @returns Array of HEM values based on location, marital status, dependents, and income range
 */
export const loadHEMLookupTable = (): HEMLookupEntry[] => {
  // In a real implementation, this would load and parse the CSV file
  // For now, return a sample dataset based on the CSV content
  return [
    // Metropolitan (Sydney, Melbourne, Brisbane) - Single - 0 Dependents
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 1, weeklyValue: 465 },
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 2, weeklyValue: 485 },
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 3, weeklyValue: 504 },
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 4, weeklyValue: 525 },
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 5, weeklyValue: 546 },
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 6, weeklyValue: 586 },
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 7, weeklyValue: 628 },
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 8, weeklyValue: 669 },
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 9, weeklyValue: 710 },
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 10, weeklyValue: 751 },
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 11, weeklyValue: 793 },
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 12, weeklyValue: 834 },
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 13, weeklyValue: 855 },
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 14, weeklyValue: 876 },
    
    // Metropolitan - Single - 1 Dependent
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 1, incomeRangeId: 1, weeklyValue: 662 },
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 1, incomeRangeId: 6, weeklyValue: 783 },
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 1, incomeRangeId: 14, weeklyValue: 1073 },
    
    // Metropolitan - Single - 2 Dependents
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 2, incomeRangeId: 1, weeklyValue: 828 },
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 2, incomeRangeId: 6, weeklyValue: 949 },
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 2, incomeRangeId: 14, weeklyValue: 1239 },
    
    // Metropolitan - Single - 3 Dependents
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 3, incomeRangeId: 1, weeklyValue: 994 },
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 3, incomeRangeId: 6, weeklyValue: 1115 },
    { hemLocationId: 1, maritalStatusId: 'single', dependants: 3, incomeRangeId: 14, weeklyValue: 1405 },
    
    // Metropolitan - Married - 0 Dependents
    { hemLocationId: 1, maritalStatusId: 'married', dependants: 0, incomeRangeId: 1, weeklyValue: 662 },
    { hemLocationId: 1, maritalStatusId: 'married', dependants: 0, incomeRangeId: 6, weeklyValue: 783 },
    { hemLocationId: 1, maritalStatusId: 'married', dependants: 0, incomeRangeId: 14, weeklyValue: 1073 },
    
    // Metropolitan - Married - 1 Dependent
    { hemLocationId: 1, maritalStatusId: 'married', dependants: 1, incomeRangeId: 1, weeklyValue: 828 },
    { hemLocationId: 1, maritalStatusId: 'married', dependants: 1, incomeRangeId: 6, weeklyValue: 949 },
    { hemLocationId: 1, maritalStatusId: 'married', dependants: 1, incomeRangeId: 14, weeklyValue: 1239 },
    
    // Metropolitan - Married - 2 Dependents
    { hemLocationId: 1, maritalStatusId: 'married', dependants: 2, incomeRangeId: 1, weeklyValue: 994 },
    { hemLocationId: 1, maritalStatusId: 'married', dependants: 2, incomeRangeId: 6, weeklyValue: 1115 },
    { hemLocationId: 1, maritalStatusId: 'married', dependants: 2, incomeRangeId: 14, weeklyValue: 1405 },
    
    // Metropolitan - Married - 3 Dependents
    { hemLocationId: 1, maritalStatusId: 'married', dependants: 3, incomeRangeId: 1, weeklyValue: 1160 },
    { hemLocationId: 1, maritalStatusId: 'married', dependants: 3, incomeRangeId: 6, weeklyValue: 1281 },
    { hemLocationId: 1, maritalStatusId: 'married', dependants: 3, incomeRangeId: 14, weeklyValue: 1571 },
    
    // Regional - entries
    { hemLocationId: 2, maritalStatusId: 'single', dependants: 0, incomeRangeId: 1, weeklyValue: 418 },
    { hemLocationId: 2, maritalStatusId: 'single', dependants: 0, incomeRangeId: 6, weeklyValue: 539 },
    { hemLocationId: 2, maritalStatusId: 'single', dependants: 0, incomeRangeId: 14, weeklyValue: 829 },
    
    { hemLocationId: 2, maritalStatusId: 'married', dependants: 0, incomeRangeId: 1, weeklyValue: 596 },
    { hemLocationId: 2, maritalStatusId: 'married', dependants: 0, incomeRangeId: 6, weeklyValue: 717 },
    { hemLocationId: 2, maritalStatusId: 'married', dependants: 0, incomeRangeId: 14, weeklyValue: 1007 },
    
    // Melbourne specific entries
    { hemLocationId: 3, maritalStatusId: 'single', dependants: 0, incomeRangeId: 1, weeklyValue: 448 },
    { hemLocationId: 3, maritalStatusId: 'single', dependants: 0, incomeRangeId: 6, weeklyValue: 569 },
    { hemLocationId: 3, maritalStatusId: 'single', dependants: 0, incomeRangeId: 14, weeklyValue: 859 },
    
    { hemLocationId: 3, maritalStatusId: 'married', dependants: 2, incomeRangeId: 1, weeklyValue: 954 },
    { hemLocationId: 3, maritalStatusId: 'married', dependants: 2, incomeRangeId: 6, weeklyValue: 1075 },
    { hemLocationId: 3, maritalStatusId: 'married', dependants: 2, incomeRangeId: 14, weeklyValue: 1365 },
    
    // Add more entries for other locations and combinations as needed
  ];
};

/**
 * Gets the location ID for a given postcode
 * @param postcode The postcode to lookup
 * @param defaultLocationId The default location ID to return if postcode not found
 * @returns The HEM location ID
 */
export const getLocationIdForPostcode = (postcode: string, defaultLocationId = 1): number => {
  const postcodeMapping = loadPostcodeMapping();
  const mapping = postcodeMapping.find(item => item.postcode === postcode);
  return mapping ? mapping.locationId : defaultLocationId;
};

/**
 * Gets the income range ID for a given gross income
 * @param grossIncome The annual gross income
 * @returns The income range ID
 */
export const getIncomeRangeIdForIncome = (grossIncome: number): number => {
  if (grossIncome < 0) {
    return 1; // Default to the first range for negative values
  }
  
  const incomeRanges = loadHEMGrossIncomeRanges();
  const range = incomeRanges.find(range => grossIncome >= range.minIncome && grossIncome <= range.maxIncome);
  
  return range ? range.id : incomeRanges[incomeRanges.length - 1].id;
};

/**
 * Finds the HEM weekly value for the given parameters
 * @param locationId The HEM location ID
 * @param maritalStatus The marital status (single or married)
 * @param dependents The number of dependents
 * @param incomeRangeId The income range ID
 * @returns The weekly HEM value or undefined if no match found
 */
export const findHEMValue = (
  locationId: number,
  maritalStatus: MaritalStatusType,
  dependents: number,
  incomeRangeId: number
): number | undefined => {
  const lookupTable = loadHEMLookupTable();
  
  // Try to find an exact match first
  const exactMatch = lookupTable.find(item => 
    item.hemLocationId === locationId &&
    item.maritalStatusId === maritalStatus &&
    item.dependants === dependents &&
    item.incomeRangeId === incomeRangeId
  );
  
  if (exactMatch) {
    return exactMatch.weeklyValue;
  }
  
  // If no exact match, try to find the closest match
  // First priority: same location, marital status, dependents, but different income range
  const sameEverythingExceptIncome = lookupTable.filter(item => 
    item.hemLocationId === locationId &&
    item.maritalStatusId === maritalStatus &&
    item.dependants === dependents
  );
  
  if (sameEverythingExceptIncome.length > 0) {
    // Find the closest income range that is less than or equal to the requested one
    const closestLower = sameEverythingExceptIncome
      .filter(item => item.incomeRangeId <= incomeRangeId)
      .sort((a, b) => b.incomeRangeId - a.incomeRangeId)[0];
      
    if (closestLower) {
      return closestLower.weeklyValue;
    }
    
    // If no lower income range, use the lowest available
    return sameEverythingExceptIncome.sort((a, b) => a.incomeRangeId - b.incomeRangeId)[0].weeklyValue;
  }
  
  // Second priority: try metropolitan (locationId 1) with same other parameters
  const metropolitanMatch = lookupTable.find(item => 
    item.hemLocationId === 1 &&
    item.maritalStatusId === maritalStatus &&
    item.dependants === dependents &&
    item.incomeRangeId === incomeRangeId
  );
  
  if (metropolitanMatch) {
    return metropolitanMatch.weeklyValue;
  }
  
  // Third priority: try metropolitan with same marital status and dependents, closest income range
  const metropolitanSameDemographics = lookupTable.filter(item => 
    item.hemLocationId === 1 &&
    item.maritalStatusId === maritalStatus &&
    item.dependants === dependents
  );
  
  if (metropolitanSameDemographics.length > 0) {
    // Find the closest income range
    const closestIncome = metropolitanSameDemographics
      .sort((a, b) => Math.abs(a.incomeRangeId - incomeRangeId) - Math.abs(b.incomeRangeId - incomeRangeId))[0];
    
    return closestIncome.weeklyValue;
  }
  
  // Last resort: return the first entry for metropolitan, single, no dependents, lowest income
  const fallback = lookupTable.find(item => 
    item.hemLocationId === 1 &&
    item.maritalStatusId === 'single' &&
    item.dependants === 0 &&
    item.incomeRangeId === 1
  );
  
  return fallback ? fallback.weeklyValue : undefined;
}; 