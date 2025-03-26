import { calculateHEM, getHigherOfDeclaredOrHEM, getIncomeRangeId, normalizeDependents, normalizeMaritalStatus } from './hemService';
import { MaritalStatusType } from '../types/FinancialTypes';
import { mockHEMGrossIncomeRanges, mockHEMLookupTable, mockPostcodeMapping, mockHEMParameters, mockHEMResult } from './__mocks__/hemMockData';

// Mock the CSV data
jest.mock('../data/csvLoaders', () => ({
  loadHEMGrossIncomeRanges: jest.fn().mockReturnValue(mockHEMGrossIncomeRanges),
  loadHEMLookupTable: jest.fn().mockReturnValue(mockHEMLookupTable),
  loadPostcodeMapping: jest.fn().mockReturnValue(mockPostcodeMapping),
}));

describe('HEM Service', () => {
  // Test getIncomeRangeId function
  describe('getIncomeRangeId', () => {
    it('should return correct income range ID for different incomes', () => {
      expect(getIncomeRangeId(0)).toBe(1);
      expect(getIncomeRangeId(20000)).toBe(1);
      expect(getIncomeRangeId(26000)).toBe(1);
      expect(getIncomeRangeId(26000.01)).toBe(2);
      expect(getIncomeRangeId(30000)).toBe(2);
      expect(getIncomeRangeId(39000.01)).toBe(3);
      expect(getIncomeRangeId(100000)).toBe(6);
      expect(getIncomeRangeId(400000)).toBe(14);
      expect(getIncomeRangeId(1000000)).toBe(14);
    });

    it('should default to lowest range for negative income', () => {
      expect(getIncomeRangeId(-5000)).toBe(1);
    });
  });

  // Test normalizeMaritalStatus function
  describe('normalizeMaritalStatus', () => {
    it('should return the provided marital status if valid', () => {
      expect(normalizeMaritalStatus('single')).toBe('single');
      expect(normalizeMaritalStatus('married')).toBe('married');
    });

    it('should default to single if marital status is undefined', () => {
      expect(normalizeMaritalStatus(undefined)).toBe('single');
    });
  });

  // Test normalizeDependents function
  describe('normalizeDependents', () => {
    it('should return the provided dependents count if within limits', () => {
      expect(normalizeDependents(0)).toBe(0);
      expect(normalizeDependents(1)).toBe(1);
      expect(normalizeDependents(2)).toBe(2);
      expect(normalizeDependents(3)).toBe(3);
    });

    it('should cap dependents at the maximum allowed', () => {
      expect(normalizeDependents(4)).toBe(3);
      expect(normalizeDependents(10)).toBe(3);
    });

    it('should default to 0 for negative dependents', () => {
      expect(normalizeDependents(-1)).toBe(0);
    });
  });

  // Test calculateHEM function
  describe('calculateHEM', () => {
    it('should calculate HEM values for single person with no dependents', () => {
      const result = calculateHEM({
        postcode: '2000',
        grossIncome: 60000,
        maritalStatus: 'single' as MaritalStatusType,
        dependents: 0
      });

      expect(result.weeklyValue).toBeGreaterThan(0);
      expect(result.annualValue).toBe(result.weeklyValue * 52);
      expect(result.locationId).toBe(1); // Sydney
    });

    it('should calculate HEM values for married couple with dependents', () => {
      const result = calculateHEM({
        postcode: '3000',
        grossIncome: 120000,
        maritalStatus: 'married' as MaritalStatusType,
        dependents: 2
      });

      expect(result.weeklyValue).toBeGreaterThan(0);
      expect(result.annualValue).toBe(result.weeklyValue * 52);
      expect(result.locationId).toBe(3); // Melbourne
    });

    it('should handle unknown postcodes by defaulting to metropolitan', () => {
      const result = calculateHEM({
        postcode: '9999',
        grossIncome: 80000,
        maritalStatus: 'single' as MaritalStatusType,
        dependents: 1
      });

      expect(result.weeklyValue).toBeGreaterThan(0);
      expect(result.locationId).toBe(1); // Default to metropolitan
    });

    it('should handle very high incomes', () => {
      const result = calculateHEM({
        postcode: '2000',
        grossIncome: 500000,
        maritalStatus: 'married' as MaritalStatusType,
        dependents: 0
      });

      expect(result.weeklyValue).toBeGreaterThan(0);
      expect(result.incomeRangeId).toBe(14); // Highest income range
    });

    it('should cap dependents at maximum', () => {
      const result = calculateHEM({
        postcode: '2000',
        grossIncome: 80000,
        maritalStatus: 'single' as MaritalStatusType,
        dependents: 5
      });

      expect(result.weeklyValue).toBeGreaterThan(0);
      // Should use maximum 3 dependents in calculation
    });
    
    it('should return the expected result for the sample parameters', () => {
      const result = calculateHEM(mockHEMParameters);
      
      expect(result.weeklyValue).toBe(mockHEMResult.weeklyValue);
      expect(result.annualValue).toBe(mockHEMResult.annualValue);
      expect(result.locationId).toBe(mockHEMResult.locationId);
      expect(result.incomeRangeId).toBe(mockHEMResult.incomeRangeId);
    });
  });

  // Test getHigherOfDeclaredOrHEM function
  describe('getHigherOfDeclaredOrHEM', () => {
    it('should return declared expenses when higher than HEM', () => {
      const declaredExpenses = 50000;
      const hemParameters = {
        postcode: '2000',
        grossIncome: 60000,
        maritalStatus: 'single' as MaritalStatusType,
        dependents: 0
      };

      const result = getHigherOfDeclaredOrHEM(declaredExpenses, hemParameters);
      
      expect(result.higherAmount).toBe(declaredExpenses);
      expect(result.isHEM).toBe(false);
      expect(result.hemAmount).toBeLessThan(declaredExpenses);
    });

    it('should return HEM when higher than declared expenses', () => {
      const declaredExpenses = 20000;
      const hemParameters = {
        postcode: '2000',
        grossIncome: 60000,
        maritalStatus: 'married' as MaritalStatusType,
        dependents: 2
      };

      const result = getHigherOfDeclaredOrHEM(declaredExpenses, hemParameters);
      
      expect(result.higherAmount).toBeGreaterThan(declaredExpenses);
      expect(result.isHEM).toBe(true);
      expect(result.hemAmount).toBe(result.higherAmount);
    });
    
    it('should return equal values when declared expenses match HEM exactly', () => {
      const hemResult = calculateHEM(mockHEMParameters);
      const declaredExpenses = hemResult.annualValue;
      
      const result = getHigherOfDeclaredOrHEM(declaredExpenses, mockHEMParameters);
      
      expect(result.higherAmount).toBe(declaredExpenses);
      expect(result.hemAmount).toBe(declaredExpenses);
      expect(result.isHEM).toBe(false); // When equal, prefer declared expenses
    });
  });
}); 