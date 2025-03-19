/**
 * Unit tests for stamp duty calculator
 */
import { 
  calculateStampDuty,
  calculateBaseStampDuty,
  findApplicableThreshold,
  applyFirstHomeBuyerConcession,
  applyForeignSurcharge,
  STAMP_DUTY_RATES
} from './stampDutyCalculator';
import { DutyThreshold, StampDutyParams, PropertyPurpose } from '../types/stampDuty';

describe('findApplicableThreshold', () => {
  test('should find correct threshold for property price', () => {
    const thresholds: DutyThreshold[] = [
      { min: 0, max: 100000, rate: 0.01, base: 0 },
      { min: 100001, max: 500000, rate: 0.02, base: 1000 },
      { min: 500001, max: null, rate: 0.03, base: 9000 }
    ];
    
    expect(findApplicableThreshold(50000, thresholds)).toEqual(thresholds[0]);
    expect(findApplicableThreshold(100000, thresholds)).toEqual(thresholds[0]);
    expect(findApplicableThreshold(100001, thresholds)).toEqual(thresholds[1]);
    expect(findApplicableThreshold(300000, thresholds)).toEqual(thresholds[1]);
    expect(findApplicableThreshold(500000, thresholds)).toEqual(thresholds[1]);
    expect(findApplicableThreshold(500001, thresholds)).toEqual(thresholds[2]);
    expect(findApplicableThreshold(1000000, thresholds)).toEqual(thresholds[2]);
  });
  
  test('should return null if no matching threshold found', () => {
    const thresholds: DutyThreshold[] = [
      { min: 100000, max: 500000, rate: 0.02, base: 1000 },
    ];
    
    expect(findApplicableThreshold(50000, thresholds)).toBeNull();
    expect(findApplicableThreshold(600000, thresholds)).toBeNull();
  });
  
  test('should handle empty thresholds array', () => {
    expect(findApplicableThreshold(50000, [])).toBeNull();
  });
});

describe('calculateBaseStampDuty', () => {
  test('should calculate base stamp duty correctly', () => {
    const threshold: DutyThreshold = { 
      min: 100000, 
      max: 500000, 
      rate: 0.02, 
      base: 1000 
    };
    
    // For a property at the threshold minimum, only the base applies
    expect(calculateBaseStampDuty(100000, threshold)).toEqual(1000);
    
    // For a property above the minimum, apply the rate to the difference
    expect(calculateBaseStampDuty(200000, threshold)).toEqual(3000); // 1000 + 0.02 * (200000 - 100000)
    expect(calculateBaseStampDuty(500000, threshold)).toEqual(9000); // 1000 + 0.02 * (500000 - 100000)
  });
});

describe('applyFirstHomeBuyerConcession', () => {
  test('should not apply concession for non-first home buyers', () => {
    const stateData = {
      firstHomeBuyer: {
        exemptionThreshold: 600000,
        concessionThreshold: 750000,
        concessionRate: 'sliding-scale',
        concessionFormula: '((750000 - propertyPrice) / 150000) * baseStampDuty'
      }
    };
    
    const result = applyFirstHomeBuyerConcession(550000, 20000, stateData, false);
    
    expect(result).toEqual({
      concessionAmount: 0,
      finalAmount: 20000
    });
  });
  
  test('should apply full exemption when eligible', () => {
    const stateData = {
      firstHomeBuyer: {
        exemptionThreshold: 600000,
        concessionThreshold: 600000,
        concessionRate: 'full-exemption',
        concessionFormula: null
      }
    };
    
    const result = applyFirstHomeBuyerConcession(550000, 20000, stateData, true);
    
    expect(result).toEqual({
      concessionAmount: 20000,
      finalAmount: 0
    });
  });
  
  test('should apply sliding scale concession for NSW', () => {
    const stateData = {
      firstHomeBuyer: {
        exemptionThreshold: 800000,
        concessionThreshold: 1000000,
        concessionRate: 'sliding-scale',
        concessionFormula: '((1000000 - propertyPrice) / 200000) * baseStampDuty'
      }
    };
    
    // 50% concession at price point in the middle of the range
    const result = applyFirstHomeBuyerConcession(900000, 20000, stateData, true);
    
    expect(result.concessionAmount).toBeCloseTo(10000, 2); // 50% of 20000
    expect(result.finalAmount).toBeCloseTo(10000, 2); // 20000 - 10000
  });
  
  test('should apply sliding scale concession for VIC', () => {
    const stateData = {
      firstHomeBuyer: {
        exemptionThreshold: 600000,
        concessionThreshold: 750000,
        concessionRate: 'sliding-scale',
        concessionFormula: '((750000 - propertyPrice) / 150000) * baseStampDuty'
      }
    };
    
    // 1/3 concession at a point 1/3 of the way up the range
    const result = applyFirstHomeBuyerConcession(650000, 30000, stateData, true);
    
    expect(result.concessionAmount).toBeCloseTo(20000, 2); // 2/3 of 30000
    expect(result.finalAmount).toBeCloseTo(10000, 2); // 30000 - 20000
  });
  
  test('should not apply any concession outside of thresholds', () => {
    const stateData = {
      firstHomeBuyer: {
        exemptionThreshold: 600000,
        concessionThreshold: 750000,
        concessionRate: 'sliding-scale',
        concessionFormula: '((750000 - propertyPrice) / 150000) * baseStampDuty'
      }
    };
    
    const result = applyFirstHomeBuyerConcession(800000, 30000, stateData, true);
    
    expect(result).toEqual({
      concessionAmount: 0,
      finalAmount: 30000
    });
  });
});

describe('applyForeignSurcharge', () => {
  test('should apply surcharge for non-residents', () => {
    const propertyPrice = 500000;
    const surchargeRate = 0.08; // 8%
    
    const result = applyForeignSurcharge(propertyPrice, false, surchargeRate);
    
    expect(result).toEqual(40000); // 8% of 500000
  });
  
  test('should not apply surcharge for residents', () => {
    const propertyPrice = 500000;
    const surchargeRate = 0.08; // 8%
    
    const result = applyForeignSurcharge(propertyPrice, true, surchargeRate);
    
    expect(result).toEqual(0);
  });
});

describe('calculateStampDuty', () => {
  test('should calculate standard stamp duty correctly for NSW', () => {
    const params: StampDutyParams = {
      state: 'NSW',
      propertyPrice: 600000,
      purpose: 'owner-occupied',
      firstHomeBuyer: false
    };
    
    const result = calculateStampDuty(params);
    
    // Expected: Base of 375 + 0.015 * (600000 - 30000) = 8925
    expect(result.stampDuty).toBeCloseTo(8925, 0);
    expect(result.breakdown.baseStampDuty).toBeCloseTo(8925, 0);
    expect(result.breakdown.concessionAmount).toEqual(0);
    expect(result.breakdown.foreignSurcharge).toEqual(0);
    expect(result.thresholds.rate).toEqual(0.015);
  });
  
  test('should apply first home buyer exemption in NSW', () => {
    const params: StampDutyParams = {
      state: 'NSW',
      propertyPrice: 650000,
      purpose: 'owner-occupied',
      firstHomeBuyer: true
    };
    
    const result = calculateStampDuty(params);
    
    // For NSW, first home buyers pay no stamp duty up to $800k
    expect(result.stampDuty).toEqual(0);
    expect(result.breakdown.concessionAmount).toBeGreaterThan(0);
  });
  
  test('should apply foreign buyer surcharge', () => {
    const params: StampDutyParams = {
      state: 'VIC',
      propertyPrice: 700000,
      purpose: 'investment',
      firstHomeBuyer: false,
      australianResident: false
    };
    
    const result = calculateStampDuty(params);
    
    // Expected VIC stamp duty plus 8% surcharge
    expect(result.breakdown.foreignSurcharge).toBeCloseTo(56000, 0); // 8% of 700000
    expect(result.stampDuty).toBeGreaterThan(result.breakdown.baseStampDuty);
  });
  
  test('should throw error for negative property price', () => {
    const params: StampDutyParams = {
      state: 'NSW',
      propertyPrice: -100000,
      purpose: 'owner-occupied',
      firstHomeBuyer: false
    };
    
    expect(() => calculateStampDuty(params)).toThrow('Property price cannot be negative');
  });
  
  test('should fall back to NSW if invalid state provided', () => {
    const params = {
      state: 'INVALID' as any,
      propertyPrice: 500000,
      purpose: 'owner-occupied' as PropertyPurpose,
      firstHomeBuyer: false
    };
    
    // Should not throw an error but use NSW rates
    expect(() => calculateStampDuty(params)).not.toThrow();
  });
  
  test('should not apply first home buyer concessions to investment properties', () => {
    const params: StampDutyParams = {
      state: 'QLD',
      propertyPrice: 500000,
      purpose: 'investment',
      firstHomeBuyer: true // Should be ignored for investment
    };
    
    const result = calculateStampDuty(params);
    
    // QLD first home buyers get full exemption up to $550k, but not for investment
    expect(result.stampDuty).toBeGreaterThan(0);
    expect(result.breakdown.concessionAmount).toEqual(0);
  });
}); 