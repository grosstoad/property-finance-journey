/**
 * Australian stamp duty calculator
 * 
 * This implements a comprehensive stamp duty calculator for residential properties
 * across all Australian states and territories. It handles first home buyer concessions,
 * foreign investor surcharges, and the different threshold structures for each state.
 */

import {
  AustralianState,
  PropertyPurpose,
  StampDutyParams,
  StampDutyResult,
  StampDutyRateData,
  DutyThreshold
} from '../types/stampDuty';

/**
 * Australian stamp duty rates and thresholds as of 2024
 */
export const STAMP_DUTY_RATES: StampDutyRateData = {
  "NSW": {
    "thresholds": [
      {"min": 0, "max": 29999, "rate": 0.0125, "base": 0},
      {"min": 30000, "max": 1179998, "rate": 0.0150, "base": 375},
      {"min": 1179999, "max": 1454999, "rate": 0.0450, "base": 17805},
      {"min": 1455000, "max": 3040998, "rate": 0.0500, "base": 30393},
      {"min": 3040999, "max": null, "rate": 0.0550, "base": 109984}
    ],
    "firstHomeBuyer": {
      "exemptionThreshold": 800000,
      "concessionThreshold": 1000000,
      "concessionRate": "sliding-scale",
      "concessionFormula": "((1000000 - propertyPrice) / 200000) * baseStampDuty"
    },
    "foreignSurcharge": 0.08,
    "investorDifference": false
  },
  "VIC": {
    "thresholds": [
      {"min": 0, "max": 99999, "rate": 0.0140, "base": 0},
      {"min": 100000, "max": 374999, "rate": 0.0200, "base": 1400},
      {"min": 375000, "max": 599999, "rate": 0.0500, "base": 8750},
      {"min": 600000, "max": 959999, "rate": 0.0550, "base": 20000},
      {"min": 960000, "max": null, "rate": 0.0650, "base": 39800}
    ],
    "firstHomeBuyer": {
      "exemptionThreshold": 600000,
      "concessionThreshold": 750000,
      "concessionRate": "sliding-scale",
      "concessionFormula": "((750000 - propertyPrice) / 150000) * baseStampDuty"
    },
    "foreignSurcharge": 0.08,
    "investorDifference": false
  },
  "QLD": {
    "thresholds": [
      {"min": 0, "max": 4999, "rate": 0.0000, "base": 0},
      {"min": 5000, "max": 74999, "rate": 0.0150, "base": 0},
      {"min": 75000, "max": 539999, "rate": 0.0350, "base": 1050},
      {"min": 540000, "max": 999999, "rate": 0.0450, "base": 17325},
      {"min": 1000000, "max": null, "rate": 0.0575, "base": 38025}
    ],
    "firstHomeBuyer": {
      "exemptionThreshold": 550000,
      "concessionThreshold": 550000,
      "concessionRate": "full-exemption",
      "concessionFormula": null
    },
    "foreignSurcharge": 0.075,
    "investorDifference": false
  },
  "WA": {
    "thresholds": [
      {"min": 0, "max": 119999, "rate": 0.0190, "base": 0},
      {"min": 120000, "max": 149999, "rate": 0.0280, "base": 2280},
      {"min": 150000, "max": 359999, "rate": 0.0340, "base": 3120},
      {"min": 360000, "max": 724999, "rate": 0.0450, "base": 10320},
      {"min": 725000, "max": null, "rate": 0.0510, "base": 26870}
    ],
    "firstHomeBuyer": {
      "exemptionThreshold": 430000,
      "concessionThreshold": 530000,
      "concessionRate": "sliding-scale",
      "concessionFormula": "((530000 - propertyPrice) / 100000) * baseStampDuty"
    },
    "foreignSurcharge": 0.07,
    "investorDifference": false
  },
  "SA": {
    "thresholds": [
      {"min": 0, "max": 11999, "rate": 0.0000, "base": 0},
      {"min": 12000, "max": 29999, "rate": 0.0100, "base": 0},
      {"min": 30000, "max": 49999, "rate": 0.0200, "base": 180},
      {"min": 50000, "max": 99999, "rate": 0.0300, "base": 580},
      {"min": 100000, "max": 199999, "rate": 0.0350, "base": 2080},
      {"min": 200000, "max": 249999, "rate": 0.0400, "base": 5580},
      {"min": 250000, "max": 299999, "rate": 0.0450, "base": 7580},
      {"min": 300000, "max": 499999, "rate": 0.0500, "base": 9830},
      {"min": 500000, "max": null, "rate": 0.0550, "base": 19830}
    ],
    "firstHomeBuyer": {
      "exemptionThreshold": 0,
      "concessionThreshold": 0,
      "concessionRate": "none",
      "concessionFormula": null
    },
    "foreignSurcharge": 0.07,
    "investorDifference": false
  },
  "TAS": {
    "thresholds": [
      {"min": 0, "max": 2999, "rate": 0.0000, "base": 0},
      {"min": 3000, "max": 24999, "rate": 0.0175, "base": 50},
      {"min": 25000, "max": 74999, "rate": 0.0225, "base": 435},
      {"min": 75000, "max": 199999, "rate": 0.0275, "base": 1560},
      {"min": 200000, "max": 374999, "rate": 0.0350, "base": 5935},
      {"min": 375000, "max": 724999, "rate": 0.0400, "base": 12935},
      {"min": 725000, "max": null, "rate": 0.0450, "base": 26935}
    ],
    "firstHomeBuyer": {
      "exemptionThreshold": 0,
      "concessionThreshold": 0,
      "concessionRate": "none",
      "concessionFormula": null
    },
    "foreignSurcharge": 0.08,
    "investorDifference": false
  },
  "ACT": {
    "thresholds": [
      {"min": 0, "max": 199999, "rate": 0.0060, "base": 0},
      {"min": 200000, "max": 299999, "rate": 0.0230, "base": 1200},
      {"min": 300000, "max": 499999, "rate": 0.0400, "base": 3500},
      {"min": 500000, "max": 749999, "rate": 0.0550, "base": 11500},
      {"min": 750000, "max": 999999, "rate": 0.0575, "base": 25250},
      {"min": 1000000, "max": 1454999, "rate": 0.0600, "base": 39625},
      {"min": 1455000, "max": null, "rate": 0.0700, "base": 66925}
    ],
    "firstHomeBuyer": {
      "exemptionThreshold": 585000,
      "concessionThreshold": 930000,
      "concessionRate": "sliding-scale",
      "concessionFormula": "((930000 - propertyPrice) / 345000) * baseStampDuty"
    },
    "foreignSurcharge": 0.00,
    "investorDifference": false
  },
  "NT": {
    "thresholds": [
      {"min": 0, "max": 524999, "rate": 0.0000, "base": 0},
      {"min": 525000, "max": 2999999, "rate": 0.0490, "base": 0},
      {"min": 3000000, "max": null, "rate": 0.0590, "base": 121275}
    ],
    "firstHomeBuyer": {
      "exemptionThreshold": 650000,
      "concessionThreshold": 650000,
      "concessionRate": "full-exemption",
      "concessionFormula": null
    },
    "foreignSurcharge": 0.00,
    "investorDifference": false
  }
};

/**
 * Find the applicable threshold for a property price in a given set of thresholds
 * 
 * @param propertyPrice - The price of the property
 * @param thresholds - Array of duty thresholds
 * @returns The applicable threshold or null if none found
 */
export const findApplicableThreshold = (
  propertyPrice: number,
  thresholds: DutyThreshold[]
): DutyThreshold | null => {
  return thresholds.find(t => 
    propertyPrice >= t.min && (t.max === null || propertyPrice <= t.max)
  ) || null;
};

/**
 * Calculate the base stamp duty amount without considering any concessions
 * 
 * @param propertyPrice - The price of the property
 * @param threshold - The applicable duty threshold
 * @returns The base stamp duty amount
 */
export const calculateBaseStampDuty = (
  propertyPrice: number,
  threshold: DutyThreshold
): number => {
  return threshold.base + threshold.rate * (propertyPrice - threshold.min);
};

/**
 * Apply first home buyer concession to stamp duty amount
 * 
 * @param propertyPrice - The price of the property
 * @param baseStampDuty - The calculated base stamp duty
 * @param stateData - State-specific duty data
 * @param firstHomeBuyer - Whether the buyer is a first home buyer
 * @returns Object containing concession amount and adjusted duty amount
 */
export const applyFirstHomeBuyerConcession = (
  propertyPrice: number,
  baseStampDuty: number,
  stateData: any,
  firstHomeBuyer: boolean
): { concessionAmount: number; finalAmount: number } => {
  // Default values (no concession)
  let concessionAmount = 0;
  let finalAmount = baseStampDuty;
  
  console.log('FHB Concession check:', { 
    propertyPrice, 
    baseStampDuty, 
    firstHomeBuyer,
    exemptionThreshold: stateData.firstHomeBuyer.exemptionThreshold,
    concessionThreshold: stateData.firstHomeBuyer.concessionThreshold,
    concessionRate: stateData.firstHomeBuyer.concessionRate
  });
  
  // If not a first home buyer, no concession applies
  if (!firstHomeBuyer) {
    console.log('Not a first home buyer, no concession applied');
    return { concessionAmount, finalAmount };
  }
  
  const { exemptionThreshold, concessionThreshold, concessionRate } = stateData.firstHomeBuyer;
  
  // Apply full exemption if eligible
  if (concessionRate === 'full-exemption' && propertyPrice <= exemptionThreshold) {
    console.log('Full exemption applied - property price under threshold');
    concessionAmount = baseStampDuty;
    finalAmount = 0;
  } 
  // Apply sliding scale concession if eligible
  else if (concessionRate === 'sliding-scale' && propertyPrice <= concessionThreshold && propertyPrice > exemptionThreshold) {
    console.log('Sliding scale concession eligible - property price between thresholds');
    // For NSW: ((1000000 - propertyPrice) / 200000) * baseStampDuty
    // For VIC: ((750000 - propertyPrice) / 150000) * baseStampDuty
    // For WA:  ((530000 - propertyPrice) / 100000) * baseStampDuty
    // For ACT: ((930000 - propertyPrice) / 345000) * baseStampDuty
    
    // Extract the formula pattern
    if (stateData.firstHomeBuyer.concessionFormula) {
      const concessionFormula = stateData.firstHomeBuyer.concessionFormula;
      
      if (concessionFormula.includes('propertyPrice') && concessionFormula.includes('baseStampDuty')) {
        try {
          // NSW formula: ((1000000 - propertyPrice) / 200000) * baseStampDuty
          if (stateData.firstHomeBuyer.concessionFormula === "((1000000 - propertyPrice) / 200000) * baseStampDuty") {
            concessionAmount = ((1000000 - propertyPrice) / 200000) * baseStampDuty;
            console.log('Applied NSW formula', { concessionAmount });
          }
          // VIC formula: ((750000 - propertyPrice) / 150000) * baseStampDuty
          else if (stateData.firstHomeBuyer.concessionFormula === "((750000 - propertyPrice) / 150000) * baseStampDuty") {
            concessionAmount = ((750000 - propertyPrice) / 150000) * baseStampDuty;
            console.log('Applied VIC formula', { concessionAmount });
          }
          // WA formula: ((530000 - propertyPrice) / 100000) * baseStampDuty
          else if (stateData.firstHomeBuyer.concessionFormula === "((530000 - propertyPrice) / 100000) * baseStampDuty") {
            concessionAmount = ((530000 - propertyPrice) / 100000) * baseStampDuty;
            console.log('Applied WA formula', { concessionAmount });
          }
          // ACT formula: ((930000 - propertyPrice) / 345000) * baseStampDuty
          else if (stateData.firstHomeBuyer.concessionFormula === "((930000 - propertyPrice) / 345000) * baseStampDuty") {
            concessionAmount = ((930000 - propertyPrice) / 345000) * baseStampDuty;
            console.log('Applied ACT formula', { concessionAmount });
          }
          
          // Ensure concession amount is not negative and not greater than base duty
          concessionAmount = Math.max(0, Math.min(concessionAmount, baseStampDuty));
          finalAmount = baseStampDuty - concessionAmount;
        } catch (error) {
          // If there's an error evaluating the formula, fall back to no concession
          console.error('Error applying concession formula:', error);
          concessionAmount = 0;
          finalAmount = baseStampDuty;
        }
      }
    }
  } else {
    console.log('No concession formula applied - conditions not met');
  }
  
  console.log('Final concession result:', { concessionAmount, finalAmount });
  return { concessionAmount, finalAmount };
};

/**
 * Apply foreign buyer surcharge if applicable
 * 
 * @param propertyPrice - The price of the property
 * @param australianResident - Whether the buyer is an Australian resident
 * @param foreignSurcharge - The foreign surcharge rate
 * @returns The foreign surcharge amount
 */
export const applyForeignSurcharge = (
  propertyPrice: number,
  australianResident: boolean,
  foreignSurcharge: number
): number => {
  return australianResident ? 0 : propertyPrice * foreignSurcharge;
};

/**
 * Calculate stamp duty for a property purchase
 * 
 * @param params - Stamp duty calculation parameters
 * @returns Detailed stamp duty calculation result
 */
export const calculateStampDuty = (params: StampDutyParams): StampDutyResult => {
  const { 
    state, 
    propertyPrice, 
    purpose, 
    firstHomeBuyer, 
    australianResident = true 
  } = params;
  
  console.log('Stamp duty calculation starting with params:', params);
  
  // Validate inputs
  if (propertyPrice < 0) {
    throw new Error('Property price cannot be negative');
  }
  
  // Get state data, defaulting to NSW if invalid state provided
  const stateData = STAMP_DUTY_RATES[state] || STAMP_DUTY_RATES['NSW'];
  
  // Find applicable threshold
  const threshold = findApplicableThreshold(propertyPrice, stateData.thresholds);
  if (!threshold) {
    throw new Error(`Could not determine applicable threshold for property price: ${propertyPrice}`);
  }
  
  // Calculate base stamp duty
  const baseStampDuty = calculateBaseStampDuty(propertyPrice, threshold);
  console.log('Base stamp duty calculated:', baseStampDuty);
  
  // First home buyer concessions only apply for owner-occupied properties
  const isEligibleForFHB = purpose === 'owner-occupied' && firstHomeBuyer;
  console.log('FHB eligibility check:', { purpose, firstHomeBuyer, isEligibleForFHB });
  
  // Apply first home buyer concession if applicable
  const { concessionAmount, finalAmount } = applyFirstHomeBuyerConcession(
    propertyPrice,
    baseStampDuty,
    stateData,
    isEligibleForFHB
  );
  
  // Apply foreign buyer surcharge if applicable
  const foreignSurchargeAmount = applyForeignSurcharge(
    propertyPrice,
    australianResident,
    stateData.foreignSurcharge
  );
  
  // Calculate final stamp duty including any surcharges
  const stampDuty = finalAmount + foreignSurchargeAmount;
  
  const result = {
    stampDuty,
    breakdown: {
      baseStampDuty,
      concessionAmount,
      foreignSurcharge: foreignSurchargeAmount,
      finalAmount: stampDuty
    },
    thresholds: {
      rate: threshold.rate,
      baseAmount: threshold.base,
      appliedThreshold: threshold.min
    }
  };
  
  console.log('Final stamp duty calculation result:', result);
  
  return result;
}; 