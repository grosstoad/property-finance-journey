import { LoanPurpose } from '../types/loan';

/**
 * First home buyer exemption thresholds by state
 * These are the thresholds below which a first home buyer pays no stamp duty
 */
export const FHB_EXEMPTION_THRESHOLDS: Record<string, number> = {
  'NSW': 800000,  // Full exemption up to $800k in NSW
  'VIC': 600000,  // Full exemption up to $600k in VIC
  'QLD': 550000,  // Full exemption up to $550k in QLD
  'WA': 430000,   // Full exemption up to $430k in WA
  'ACT': 585000,  // Full exemption up to $585k in ACT
  'NT': 650000,   // Full exemption up to $650k in NT
  'SA': 0,        // No exemption in SA
  'TAS': 0,       // No exemption in TAS
};

/**
 * First home buyer concession maximum thresholds
 * These are the thresholds below which a first home buyer gets a partial stamp duty concession
 */
export const FHB_CONCESSION_THRESHOLDS: Record<string, number> = {
  'NSW': 1000000, // Partial concession up to $1M in NSW
  'VIC': 750000,  // Partial concession up to $750k in VIC
  'QLD': 550000,  // No concession above $550k in QLD
  'WA': 530000,   // Partial concession up to $530k in WA
  'ACT': 930000,  // Partial concession up to $930k in ACT
  'NT': 650000,   // No concession above $650k in NT
  'SA': 0,        // No concession in SA
  'TAS': 0,       // No concession in TAS
};

/**
 * Standard property tax rates by state (simplified)
 */
export const STATE_DUTY_RATES: Record<string, number> = {
  'NSW': 0.04,
  'VIC': 0.055,
  'QLD': 0.045,
  'WA': 0.045,
  'SA': 0.05,
  'TAS': 0.04,
  'ACT': 0.05,
  'NT': 0.049,
};

/**
 * Calculate standard stamp duty without any concessions
 */
export const calculateStandardDuty = (price: number, stateCode: string): number => {
  const rate = STATE_DUTY_RATES[stateCode] || 0.05; // Default to 5% if state not found
  return price * rate;
};

/**
 * Calculate stamp duty based on property price, state, purpose and first home buyer status
 * This is a simplified implementation - in production this would use the detailed JSON schema from the PRD
 */
export const calculateStampDuty = (
  propertyPrice: number,
  state: string,
  purpose: LoanPurpose,
  isFirstHomeBuyer: boolean
): number => {
  // Ensure the state is in uppercase
  const stateCode = state.toUpperCase();
  
  // For non-owner occupied properties, no first home buyer concessions apply
  if (purpose !== 'OWNER_OCCUPIED') {
    return calculateStandardDuty(propertyPrice, stateCode);
  }
  
  // Get the thresholds for the state
  const exemptionThreshold = FHB_EXEMPTION_THRESHOLDS[stateCode] || 0;
  const concessionThreshold = FHB_CONCESSION_THRESHOLDS[stateCode] || 0;
  
  // If not eligible for first home buyer concessions, apply standard duty
  if (!isFirstHomeBuyer || exemptionThreshold === 0) {
    return calculateStandardDuty(propertyPrice, stateCode);
  }
  
  // Full exemption
  if (propertyPrice <= exemptionThreshold) {
    return 0;
  }
  
  // Partial concession (sliding scale)
  if (propertyPrice <= concessionThreshold && concessionThreshold > exemptionThreshold) {
    const standardDuty = calculateStandardDuty(propertyPrice, stateCode);
    const concessionRate = (concessionThreshold - propertyPrice) / (concessionThreshold - exemptionThreshold);
    return standardDuty * (1 - concessionRate);
  }
  
  // No concession, apply standard duty
  return calculateStandardDuty(propertyPrice, stateCode);
}; 