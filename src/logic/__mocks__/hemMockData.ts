import { MaritalStatusType } from '../../types/FinancialTypes';

export const mockHEMGrossIncomeRanges = [
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

export const mockPostcodeMapping = [
  { postcode: '2000', locationId: 1 }, // Sydney
  { postcode: '2010', locationId: 1 }, // Sydney
  { postcode: '2088', locationId: 1 }, // Sydney
  { postcode: '3000', locationId: 3 }, // Melbourne
  { postcode: '4000', locationId: 4 }, // Brisbane
  { postcode: '5000', locationId: 5 }, // Adelaide
  { postcode: '6000', locationId: 6 }, // Perth
  { postcode: '7000', locationId: 7 }, // Hobart
  { postcode: '2650', locationId: 2 }, // Regional NSW
  { postcode: '3820', locationId: 2 }, // Regional VIC
];

export const mockHEMLookupTable = [
  // Metro - Single - 0 Dependents
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 1, weeklyValue: 465 },
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 2, weeklyValue: 485 },
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 6, weeklyValue: 586 },
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 0, incomeRangeId: 14, weeklyValue: 876 },
  
  // Metro - Single - 1 Dependent
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 1, incomeRangeId: 1, weeklyValue: 662 },
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 1, incomeRangeId: 6, weeklyValue: 783 },
  
  // Metro - Single - 2 Dependents
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 2, incomeRangeId: 1, weeklyValue: 828 },
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 2, incomeRangeId: 6, weeklyValue: 949 },
  
  // Metro - Single - 3 Dependents
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 3, incomeRangeId: 1, weeklyValue: 994 },
  { hemLocationId: 1, maritalStatusId: 'single', dependants: 3, incomeRangeId: 6, weeklyValue: 1115 },
  
  // Metro - Married - 0 Dependents
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 0, incomeRangeId: 1, weeklyValue: 662 },
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 0, incomeRangeId: 6, weeklyValue: 783 },
  
  // Metro - Married - 1 Dependent
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 1, incomeRangeId: 1, weeklyValue: 828 },
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 1, incomeRangeId: 6, weeklyValue: 949 },
  
  // Metro - Married - 2 Dependents
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 2, incomeRangeId: 1, weeklyValue: 994 },
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 2, incomeRangeId: 6, weeklyValue: 1115 },
  
  // Metro - Married - 3 Dependents
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 3, incomeRangeId: 1, weeklyValue: 1160 },
  { hemLocationId: 1, maritalStatusId: 'married', dependants: 3, incomeRangeId: 6, weeklyValue: 1281 },
  
  // Regional - Single - 0 Dependents
  { hemLocationId: 2, maritalStatusId: 'single', dependants: 0, incomeRangeId: 1, weeklyValue: 418 },
  { hemLocationId: 2, maritalStatusId: 'single', dependants: 0, incomeRangeId: 6, weeklyValue: 539 },
  
  // Regional - Married - 0 Dependents
  { hemLocationId: 2, maritalStatusId: 'married', dependants: 0, incomeRangeId: 1, weeklyValue: 596 },
  { hemLocationId: 2, maritalStatusId: 'married', dependants: 0, incomeRangeId: 6, weeklyValue: 717 },
  
  // Melbourne - Single - 0 Dependents  
  { hemLocationId: 3, maritalStatusId: 'single', dependants: 0, incomeRangeId: 1, weeklyValue: 448 },
  { hemLocationId: 3, maritalStatusId: 'single', dependants: 0, incomeRangeId: 6, weeklyValue: 569 },
  
  // Melbourne - Married - 2 Dependents
  { hemLocationId: 3, maritalStatusId: 'married', dependants: 2, incomeRangeId: 1, weeklyValue: 954 },
  { hemLocationId: 3, maritalStatusId: 'married', dependants: 2, incomeRangeId: 6, weeklyValue: 1075 },
];

export const mockHEMParameters = {
  postcode: '2000',
  grossIncome: 80000,
  maritalStatus: 'single' as MaritalStatusType,
  dependents: 1
};

export const mockHEMResult = {
  weeklyValue: 783,
  annualValue: 40716,
  locationId: 1,
  incomeRangeId: 6
}; 