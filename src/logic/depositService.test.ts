/**
 * Unit tests for deposit service
 */
import { 
  calculateUpfrontCosts, 
  calculateDepositDetails, 
  calculateLoanAmountRequired 
} from './depositService';
import { calculateStampDuty } from './stampDutyCalculator';
import { 
  DEFAULT_UPFRONT_COSTS, 
  DEFAULT_UPFRONT_COSTS_PERCENTAGE 
} from '../constants/defaultValues';
import { AustralianState } from '../types/stampDuty';

// Mock stampDutyCalculator to isolate tests
jest.mock('./stampDutyCalculator');

describe('calculateUpfrontCosts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return minimum amount for zero property price', () => {
    const result = calculateUpfrontCosts(0);
    expect(result).toBe(DEFAULT_UPFRONT_COSTS);
  });

  test('should return minimum amount when percentage is less', () => {
    const propertyPrice = 100000; // 0.1% of this is 100, which is less than minimum
    const result = calculateUpfrontCosts(propertyPrice);
    expect(result).toBe(DEFAULT_UPFRONT_COSTS);
  });

  test('should return percentage when greater than minimum', () => {
    const propertyPrice = 1000000; // 0.1% of this is 1000, which is greater than minimum
    const result = calculateUpfrontCosts(propertyPrice);
    expect(result).toBe(propertyPrice * DEFAULT_UPFRONT_COSTS_PERCENTAGE);
  });

  test('should handle very high property price', () => {
    const propertyPrice = 100000000; // $100M
    const expectedAmount = propertyPrice * DEFAULT_UPFRONT_COSTS_PERCENTAGE;
    const result = calculateUpfrontCosts(propertyPrice);
    expect(result).toBe(expectedAmount);
  });
});

describe('calculateDepositDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (calculateStampDuty as jest.Mock).mockReturnValue({ stampDuty: 20000 });
  });

  test('should calculate deposit details correctly', () => {
    const params = {
      propertyPrice: 500000,
      savings: 125000,
      state: 'NSW' as AustralianState
    };

    const result = calculateDepositDetails(params);

    expect(result).toEqual({
      upfrontCosts: DEFAULT_UPFRONT_COSTS,
      stampDuty: 20000,
      availableForDeposit: params.savings - 20000 - DEFAULT_UPFRONT_COSTS,
      totalRequiredDeposit: params.propertyPrice * 0.2,
      hasShortfall: true,
      shortfallAmount: expect.any(Number)
    });

    expect(calculateStampDuty).toHaveBeenCalledWith({
      propertyPrice: params.propertyPrice,
      state: params.state,
      purpose: 'owner-occupied',
      firstHomeBuyer: false
    });
  });
});

describe('calculateLoanAmountRequired', () => {
  test('should calculate loan amount and LVR correctly', () => {
    const params = {
      propertyPrice: 500000,
      availableForDeposit: 100000
    };

    const expectedRequired = 400000;
    const expectedLvr = 80; // 80%

    const result = calculateLoanAmountRequired(params);

    expect(result).toEqual({
      required: expectedRequired,
      lvr: expectedLvr
    });
  });

  test('should handle zero deposit', () => {
    const params = {
      propertyPrice: 600000,
      availableForDeposit: 0
    };

    const result = calculateLoanAmountRequired(params);

    expect(result).toEqual({
      required: 600000,
      lvr: 100 // 100%
    });
  });

  test('should handle deposit greater than property price', () => {
    const params = {
      propertyPrice: 450000,
      availableForDeposit: 500000
    };

    const result = calculateLoanAmountRequired(params);

    expect(result).toEqual({
      required: 0,
      lvr: 0 // 0%
    });
  });

  test('should handle zero property price', () => {
    const params = {
      propertyPrice: 0,
      availableForDeposit: 50000
    };

    const result = calculateLoanAmountRequired(params);

    expect(result).toEqual({
      required: 0,
      lvr: 0
    });
  });

  test('should throw error for negative property price', () => {
    const params = {
      propertyPrice: -100000,
      availableForDeposit: 50000
    };

    expect(() => calculateLoanAmountRequired(params)).toThrow('Property price cannot be negative');
  });

  test('should throw error for negative deposit', () => {
    const params = {
      propertyPrice: 500000,
      availableForDeposit: -10000
    };

    expect(() => calculateLoanAmountRequired(params)).toThrow('Available for deposit cannot be negative');
  });
}); 