// src/data/HemData.ts
import { HemPostcodeMapping, HemRecord, IncomeRange } from '../types/ServiceabilityTypes';

// This would normally be loaded from a database or external file
// For this implementation, we'll use the provided CSV data converted to objects

export const HEM_LOOKUP: HemRecord[] = [
  // First few rows for brevity (full data would be imported from CSV)
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 0, incomeRangeId: 1, weeklyValue: 585, annualValue: 30420 },
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 1, incomeRangeId: 1, weeklyValue: 686, annualValue: 35672 },
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 2, incomeRangeId: 1, weeklyValue: 755, annualValue: 39260 },
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 3, incomeRangeId: 1, weeklyValue: 864, annualValue: 44928 },
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 1, weeklyValue: 298, annualValue: 15496 },
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 1, incomeRangeId: 1, weeklyValue: 412, annualValue: 21424 },
  // ...add more from the "HEM Lookup" document as needed
  // You would normally parse the entire CSV
];

export const INCOME_RANGES: IncomeRange[] = [
  { incomeRangeId: 1, amountFrom: 0, amountTo: 26000 },
  { incomeRangeId: 2, amountFrom: 26000.01, amountTo: 39000 },
  { incomeRangeId: 3, amountFrom: 39000.01, amountTo: 52000 },
  { incomeRangeId: 4, amountFrom: 52000.01, amountTo: 65000 },
  { incomeRangeId: 5, amountFrom: 65000.01, amountTo: 77000 },
  { incomeRangeId: 6, amountFrom: 77000.01, amountTo: 103000 },
  { incomeRangeId: 7, amountFrom: 103000.01, amountTo: 129000 },
  { incomeRangeId: 8, amountFrom: 129000.01, amountTo: 155000 },
  { incomeRangeId: 9, amountFrom: 155000.01, amountTo: 181000 },
  { incomeRangeId: 10, amountFrom: 181000.01, amountTo: 207000 },
  { incomeRangeId: 11, amountFrom: 207000.01, amountTo: 258000 },
  { incomeRangeId: 12, amountFrom: 258000.01, amountTo: 323000 },
  { incomeRangeId: 13, amountFrom: 323000.01, amountTo: 387000 },
  { incomeRangeId: 14, amountFrom: 387000.01, amountTo: 1000000000000000 }
];

export const HEM_POSTCODE_MAPPING: HemPostcodeMapping[] = [
  // First few rows for brevity
  { hemLocationId: 1, postcode: '2000' },
  { hemLocationId: 1, postcode: '2006' },
  { hemLocationId: 1, postcode: '2007' },
  // ...add more from the "HEM postcode mapping" document as needed
  // You would normally parse the entire CSV
];

// For demonstration purposes, we'll add a few more rows to make the example work
// In a real implementation, you would load the full dataset
HEM_LOOKUP.push(...[
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 2, incomeRangeId: 1, weeklyValue: 531, annualValue: 27612 },
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 3, incomeRangeId: 1, weeklyValue: 666, annualValue: 34632 },
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 0, incomeRangeId: 2, weeklyValue: 585, annualValue: 30420 },
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 1, incomeRangeId: 2, weeklyValue: 686, annualValue: 35672 },
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 2, incomeRangeId: 2, weeklyValue: 755, annualValue: 39260 },
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 3, incomeRangeId: 2, weeklyValue: 864, annualValue: 44928 },
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 2, weeklyValue: 314, annualValue: 16328 },
  { hemLocationId: 2, maritalStatusId: 'married', dependants: 0, incomeRangeId: 1, weeklyValue: 610, annualValue: 31720 },
  { hemLocationId: 3, maritalStatusId: 'married', dependants: 0, incomeRangeId: 1, weeklyValue: 602, annualValue: 31304 },
  { hemLocationId: 4, maritalStatusId: 'married', dependants: 0, incomeRangeId: 1, weeklyValue: 638, annualValue: 33176 },
  { hemLocationId: 5, maritalStatusId: 'married', dependants: 0, incomeRangeId: 1, weeklyValue: 554, annualValue: 28808 }
]);

HEM_POSTCODE_MAPPING.push(...[
  { hemLocationId: 2, postcode: '2250' },
  { hemLocationId: 3, postcode: '3000' },
  { hemLocationId: 4, postcode: '3211' },
  { hemLocationId: 5, postcode: '4000' }
]);