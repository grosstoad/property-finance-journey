export interface HemLookup {
  hemLocationId: number;
  maritalStatusId: 'single' | 'married';
  dependants: number;
  incomeRangeId: number;
  weeklyValue: number;
  annualValue: number; // Derived from weeklyValue * 52
}

// NOTE: This is a simplified subset of the full HEM lookup table
// The actual implementation would load the entire CSV dataset
// This sample includes representative entries for testing

export const HEM_LOOKUP: HemLookup[] = [
  // Location 1 (Sydney) - Single with 0 dependants
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 1, weeklyValue: 436, annualValue: 436 * 52 },
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 2, weeklyValue: 462, annualValue: 462 * 52 },
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 3, weeklyValue: 488, annualValue: 488 * 52 },
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 4, weeklyValue: 513, annualValue: 513 * 52 },
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 5, weeklyValue: 539, annualValue: 539 * 52 },
  
  // Location 1 (Sydney) - Single with 1 dependant
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 1, incomeRangeId: 1, weeklyValue: 628, annualValue: 628 * 52 },
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 1, incomeRangeId: 2, weeklyValue: 654, annualValue: 654 * 52 },
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 1, incomeRangeId: 3, weeklyValue: 680, annualValue: 680 * 52 },
  
  // Location 1 (Sydney) - Married with 0 dependants
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 0, incomeRangeId: 1, weeklyValue: 636, annualValue: 636 * 52 },
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 0, incomeRangeId: 2, weeklyValue: 662, annualValue: 662 * 52 },
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 0, incomeRangeId: 3, weeklyValue: 688, annualValue: 688 * 52 },
  
  // Location 1 (Sydney) - Married with 1 dependant
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 1, incomeRangeId: 1, weeklyValue: 828, annualValue: 828 * 52 },
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 1, incomeRangeId: 2, weeklyValue: 854, annualValue: 854 * 52 },
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 1, incomeRangeId: 3, weeklyValue: 880, annualValue: 880 * 52 },
  
  // Location 3 (Melbourne) - Single with 0 dependants
  { hemLocationId: 3, maritalStatusId: 'single', dependants: 0, incomeRangeId: 1, weeklyValue: 424, annualValue: 424 * 52 },
  { hemLocationId: 3, maritalStatusId: 'single', dependants: 0, incomeRangeId: 2, weeklyValue: 450, annualValue: 450 * 52 },
  { hemLocationId: 3, maritalStatusId: 'single', dependants: 0, incomeRangeId: 3, weeklyValue: 476, annualValue: 476 * 52 },
  
  // Location 3 (Melbourne) - Married with 0 dependants
  { hemLocationId: 3, maritalStatusId: 'married', dependants: 0, incomeRangeId: 1, weeklyValue: 624, annualValue: 624 * 52 },
  { hemLocationId: 3, maritalStatusId: 'married', dependants: 0, incomeRangeId: 2, weeklyValue: 650, annualValue: 650 * 52 },
  { hemLocationId: 3, maritalStatusId: 'married', dependants: 0, incomeRangeId: 3, weeklyValue: 676, annualValue: 676 * 52 },
  
  // Location 5 (Brisbane) - Single with 0 dependants
  { hemLocationId: 5, maritalStatusId: 'single', dependants: 0, incomeRangeId: 1, weeklyValue: 412, annualValue: 412 * 52 },
  { hemLocationId: 5, maritalStatusId: 'single', dependants: 0, incomeRangeId: 2, weeklyValue: 438, annualValue: 438 * 52 },
  { hemLocationId: 5, maritalStatusId: 'single', dependants: 0, incomeRangeId: 3, weeklyValue: 464, annualValue: 464 * 52 },
  
  // Location 5 (Brisbane) - Married with 0 dependants
  { hemLocationId: 5, maritalStatusId: 'married', dependants: 0, incomeRangeId: 1, weeklyValue: 612, annualValue: 612 * 52 },
  { hemLocationId: 5, maritalStatusId: 'married', dependants: 0, incomeRangeId: 2, weeklyValue: 638, annualValue: 638 * 52 },
  { hemLocationId: 5, maritalStatusId: 'married', dependants: 0, incomeRangeId: 3, weeklyValue: 664, annualValue: 664 * 52 },
  
  // High income examples for different locations
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 14, weeklyValue: 823, annualValue: 823 * 52 },
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 0, incomeRangeId: 14, weeklyValue: 1023, annualValue: 1023 * 52 },
  { hemLocationId: 3, maritalStatusId: 'single', dependants: 0, incomeRangeId: 14, weeklyValue: 811, annualValue: 811 * 52 },
  { hemLocationId: 3, maritalStatusId: 'married', dependants: 0, incomeRangeId: 14, weeklyValue: 1011, annualValue: 1011 * 52 },
  { hemLocationId: 5, maritalStatusId: 'single', dependants: 0, incomeRangeId: 14, weeklyValue: 799, annualValue: 799 * 52 },
  { hemLocationId: 5, maritalStatusId: 'married', dependants: 0, incomeRangeId: 14, weeklyValue: 999, annualValue: 999 * 52 },
  
  // Maximum dependants examples (3 dependants)
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 3, incomeRangeId: 5, weeklyValue: 939, annualValue: 939 * 52 },
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 3, incomeRangeId: 5, weeklyValue: 1139, annualValue: 1139 * 52 },
  { hemLocationId: 3, maritalStatusId: 'single', dependants: 3, incomeRangeId: 5, weeklyValue: 927, annualValue: 927 * 52 },
  { hemLocationId: 3, maritalStatusId: 'married', dependants: 3, incomeRangeId: 5, weeklyValue: 1127, annualValue: 1127 * 52 },
  { hemLocationId: 5, maritalStatusId: 'single', dependants: 3, incomeRangeId: 5, weeklyValue: 915, annualValue: 915 * 52 },
  { hemLocationId: 5, maritalStatusId: 'married', dependants: 3, incomeRangeId: 5, weeklyValue: 1115, annualValue: 1115 * 52 }
]; 