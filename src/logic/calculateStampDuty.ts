// Simplified rate data structure based on the PRD
interface ThresholdData {
  min: number;
  max: number | null;
  rate: number;
  base: number;
}

interface FirstHomeBuyerData {
  exemptionThreshold: number;
  concessionThreshold: number;
  concessionRate: 'full-exemption' | 'sliding-scale' | 'none';
  concessionFormula: string | null;
}

interface StateRateData {
  thresholds: ThresholdData[];
  firstHomeBuyer: FirstHomeBuyerData;
  foreignSurcharge: number;
  investorDifference: boolean;
}

// Simplified stamp duty data based on the JSON in the PRD
const STAMP_DUTY_DATA: Record<string, StateRateData> = {
  NSW: {
    thresholds: [
      { min: 0, max: 29999, rate: 0.0125, base: 0 },
      { min: 30000, max: 1179998, rate: 0.0150, base: 375 },
      { min: 1179999, max: 1454999, rate: 0.0450, base: 17805 },
      { min: 1455000, max: 3040998, rate: 0.0500, base: 30393 },
      { min: 3040999, max: null, rate: 0.0550, base: 109984 },
    ],
    firstHomeBuyer: {
      exemptionThreshold: 800000,
      concessionThreshold: 1000000,
      concessionRate: 'sliding-scale',
      concessionFormula: '((1000000 - propertyPrice) / 200000) * baseStampDuty',
    },
    foreignSurcharge: 0.08,
    investorDifference: false,
  },
  VIC: {
    thresholds: [
      { min: 0, max: 99999, rate: 0.0140, base: 0 },
      { min: 100000, max: 374999, rate: 0.0200, base: 1400 },
      { min: 375000, max: 599999, rate: 0.0500, base: 8750 },
      { min: 600000, max: 959999, rate: 0.0550, base: 20000 },
      { min: 960000, max: null, rate: 0.0650, base: 39800 },
    ],
    firstHomeBuyer: {
      exemptionThreshold: 600000,
      concessionThreshold: 750000,
      concessionRate: 'sliding-scale',
      concessionFormula: '((750000 - propertyPrice) / 150000) * baseStampDuty',
    },
    foreignSurcharge: 0.08,
    investorDifference: false,
  },
  // Add other states as needed from the PRD
};

/**
 * Calculate stamp duty for a property purchase
 * @param propertyPrice Property price
 * @param propertyState State code (NSW, VIC, etc.)
 * @param isFirstHomeBuyer Whether the buyer is a first home buyer
 * @param isInvestmentProperty Whether the property is for investment
 * @returns Calculated stamp duty amount
 */
export function calculateStampDuty(
  propertyPrice: number,
  propertyState: string,
  isFirstHomeBuyer: boolean = false,
  isInvestmentProperty: boolean = false
): number {
  // Get the state data or use NSW as default
  const stateData = STAMP_DUTY_DATA[propertyState] || STAMP_DUTY_DATA.NSW;
  
  // Find the threshold that applies to this property price
  const threshold = stateData.thresholds.find(t => 
    propertyPrice >= t.min && (t.max === null || propertyPrice <= t.max)
  );
  
  if (!threshold) return 0;
  
  // Calculate base stamp duty
  const baseStampDuty = threshold.base + threshold.rate * (propertyPrice - threshold.min);
  
  // Apply first home buyer concession if applicable
  let concessionAmount = 0;
  let finalAmount = baseStampDuty;
  
  if (isFirstHomeBuyer) {
    const { exemptionThreshold, concessionThreshold, concessionRate } = stateData.firstHomeBuyer;
    
    if (concessionRate === 'full-exemption' && propertyPrice <= exemptionThreshold) {
      // Full exemption
      concessionAmount = baseStampDuty;
      finalAmount = 0;
    } else if (concessionRate === 'sliding-scale' && propertyPrice <= concessionThreshold && propertyPrice > exemptionThreshold) {
      // Sliding scale - simplified implementation of the formula
      if (propertyState === 'NSW') {
        concessionAmount = ((1000000 - propertyPrice) / 200000) * baseStampDuty;
      } else if (propertyState === 'VIC') {
        concessionAmount = ((750000 - propertyPrice) / 150000) * baseStampDuty;
      }
      // Add other states' formulas as needed
      
      finalAmount = Math.max(0, baseStampDuty - concessionAmount);
    }
  }
  
  // Apply foreign buyer surcharge if applicable (not implemented in this simplified version)
  
  // Return the final stamp duty amount
  return Math.round(finalAmount);
} 