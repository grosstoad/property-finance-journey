/**
 * Unit tests for deposit service
 */
import { 
  calculateUpfrontCosts, 
  calculateDeposit, 
  calculateLoanAmountRequired 
} from './depositService';
import { calculateStampDuty } from './stampDutyCalculator';
import { 
  DEFAULT_MIN_UPFRONT_COSTS, 
  DEFAULT_UPFRONT_COSTS_PERCENTAGE 
} from '../constants/defaultValues';

// Mock stampDutyCalculator to isolate tests
jest.mock('./stampDutyCalculator', () => ({
  calculateStampDuty: jest.fn()
}));

describe('calculateUpfrontCosts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return minimum amount when percentage is less than minimum', () => {
    const propertyPrice = 100000; // 0.1% of this is 100, which is less than minimum 1500
    const result = calculateUpfrontCosts(propertyPrice);
    expect(result).toEqual(DEFAULT_MIN_UPFRONT_COSTS);
  });

  test('should return percentage amount when greater than minimum', () => {
    const propertyPrice = 2000000; // 0.1% of this is 2000, which is greater than minimum 1500
    const expectedAmount = propertyPrice * DEFAULT_UPFRONT_COSTS_PERCENTAGE;
    const result = calculateUpfrontCosts(propertyPrice);
    expect(result).toEqual(expectedAmount);
  });

  test('should use custom configuration when provided', () => {
    const propertyPrice = 500000;
    const customConfig = {
      minAmount: 3000,
      percentageOfPrice: 0.02 // 2%
    };
    const expectedAmount = propertyPrice * customConfig.percentageOfPrice; // 10000
    const result = calculateUpfrontCosts(propertyPrice, customConfig);
    expect(result).toEqual(expectedAmount);
  });

  test('should handle zero property price', () => {
    const result = calculateUpfrontCosts(0);
    expect(result).toEqual(DEFAULT_MIN_UPFRONT_COSTS);
  });

  test('should handle very high property price', () => {
    const propertyPrice = 100000000; // $100M
    const expectedAmount = propertyPrice * DEFAULT_UPFRONT_COSTS_PERCENTAGE; // 100000
    const result = calculateUpfrontCosts(propertyPrice);
    expect(result).toEqual(expectedAmount);
  });
});

describe('calculateDeposit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (calculateStampDuty as jest.Mock).mockReturnValue({
      stampDuty: 20000,
      breakdown: { 
        baseStampDuty: 20000, 
        concessionAmount: 0, 
        foreignSurcharge: 0, 
        finalAmount: 20000 
      },
      thresholds: { rate: 0.04, baseAmount: 0, appliedThreshold: 0 }
    });
  });

  test('should calculate deposit correctly with standard inputs', () => {
    const params = {
      propertyPrice: 500000,
      savings: 100000,
      state: 'NSW' as const,
      purpose: 'OWNER_OCCUPIED' as const,
      firstHomeBuyer: false
    };

    const expectedUpfrontCosts = DEFAULT_MIN_UPFRONT_COSTS; // 1500
    const expectedStampDuty = 20000; // From mock
    const expectedAvailableForDeposit = params.savings - expectedStampDuty - expectedUpfrontCosts;

    const result = calculateDeposit(params);

    expect(calculateStampDuty).toHaveBeenCalledWith({
      state: 'NSW',
      propertyPrice: 500000,
      purpose: 'owner-occupied',
      firstHomeBuyer: false
    });

    expect(result).toEqual({
      propertyPrice: params.propertyPrice,
      savings: params.savings,
      stampDuty: expectedStampDuty,
      upfrontCosts: expectedUpfrontCosts,
      availableForDeposit: expectedAvailableForDeposit
    });
  });

  test('should handle investment property purpose', () => {
    const params = {
      propertyPrice: 600000,
      savings: 150000,
      state: 'VIC' as const,
      purpose: 'INVESTMENT' as const,
      firstHomeBuyer: false
    };

    calculateDeposit(params);

    expect(calculateStampDuty).toHaveBeenCalledWith({
      state: 'VIC',
      propertyPrice: 600000,
      purpose: 'investment',
      firstHomeBuyer: false
    });
  });

  test('should handle first home buyer status', () => {
    const params = {
      propertyPrice: 550000,
      savings: 120000,
      state: 'QLD' as const,
      purpose: 'OWNER_OCCUPIED' as const,
      firstHomeBuyer: true
    };

    calculateDeposit(params);

    expect(calculateStampDuty).toHaveBeenCalledWith({
      state: 'QLD',
      propertyPrice: 550000,
      purpose: 'owner-occupied',
      firstHomeBuyer: true
    });
  });

  test('should handle custom upfront costs configuration', () => {
    const params = {
      propertyPrice: 700000,
      savings: 200000,
      state: 'ACT' as const,
      purpose: 'OWNER_OCCUPIED' as const,
      firstHomeBuyer: false,
      upfrontCostsConfig: {
        minAmount: 5000,
        percentageOfPrice: 0.015 // 1.5%
      }
    };

    const expectedUpfrontCosts = 700000 * 0.015; // 10500
    const expectedStampDuty = 20000; // From mock
    const expectedAvailableForDeposit = params.savings - expectedStampDuty - expectedUpfrontCosts;

    const result = calculateDeposit(params);

    expect(result.upfrontCosts).toEqual(expectedUpfrontCosts);
    expect(result.availableForDeposit).toEqual(expectedAvailableForDeposit);
  });

  test('should handle zero savings', () => {
    const params = {
      propertyPrice: 400000,
      savings: 0,
      state: 'NSW' as const,
      purpose: 'OWNER_OCCUPIED' as const,
      firstHomeBuyer: false
    };

    const result = calculateDeposit(params);

    expect(result.availableForDeposit).toEqual(0);
  });

  test('should handle when stamp duty and upfront costs exceed savings', () => {
    const params = {
      propertyPrice: 900000,
      savings: 15000, // Less than stamp duty (20000) + upfront costs
      state: 'NSW' as const,
      purpose: 'OWNER_OCCUPIED' as const,
      firstHomeBuyer: false
    };

    const result = calculateDeposit(params);

    expect(result.availableForDeposit).toEqual(0);
  });

  test('should throw error for negative property price', () => {
    const params = {
      propertyPrice: -100000,
      savings: 50000,
      state: 'NSW' as const,
      purpose: 'OWNER_OCCUPIED' as const,
      firstHomeBuyer: false
    };

    expect(() => calculateDeposit(params)).toThrow('Property price cannot be negative');
  });

  test('should throw error for negative savings', () => {
    const params = {
      propertyPrice: 500000,
      savings: -10000,
      state: 'NSW' as const,
      purpose: 'OWNER_OCCUPIED' as const,
      firstHomeBuyer: false
    };

    expect(() => calculateDeposit(params)).toThrow('Savings amount cannot be negative');
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