export interface IncomeRange {
  incomeRangeId: number;
  amountFrom: number;
  amountTo: number;
}

// Income ranges from the HEM-Gross-Income-Ranges.csv file
export const INCOME_RANGES: IncomeRange[] = [
  { incomeRangeId: 1, amountFrom: 0, amountTo: 26000 },
  { incomeRangeId: 2, amountFrom: 26000.01, amountTo: 39000 },
  { incomeRangeId: 3, amountFrom: 39000.01, amountTo: 52000 },
  { incomeRangeId: 4, amountFrom: 52000.01, amountTo: 65000 },
  { incomeRangeId: 5, amountFrom: 65000.01, amountTo: 78000 },
  { incomeRangeId: 6, amountFrom: 78000.01, amountTo: 104000 },
  { incomeRangeId: 7, amountFrom: 104000.01, amountTo: 130000 },
  { incomeRangeId: 8, amountFrom: 130000.01, amountTo: 156000 },
  { incomeRangeId: 9, amountFrom: 156000.01, amountTo: 182000 },
  { incomeRangeId: 10, amountFrom: 182000.01, amountTo: 208000 },
  { incomeRangeId: 11, amountFrom: 208000.01, amountTo: 260000 },
  { incomeRangeId: 12, amountFrom: 260000.01, amountTo: 312000 },
  { incomeRangeId: 13, amountFrom: 312000.01, amountTo: 364000 },
  { incomeRangeId: 14, amountFrom: 364000.01, amountTo: 1000000000 }, // Very high upper bound for last range
]; 