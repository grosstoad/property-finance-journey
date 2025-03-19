/**
 * Types for the Australian stamp duty calculator
 */

// Property purpose types
export type PropertyPurpose = 'owner-occupied' | 'investment';

// Australian states and territories
export type AustralianState = 'NSW' | 'VIC' | 'QLD' | 'WA' | 'SA' | 'TAS' | 'ACT' | 'NT';

// Threshold for progressive stamp duty calculation
export interface DutyThreshold {
  min: number;
  max: number | null;
  rate: number;
  base: number;
}

// First home buyer concession configuration
export interface FirstHomeBuyerConcession {
  exemptionThreshold: number;
  concessionThreshold: number;
  concessionRate: 'full-exemption' | 'sliding-scale' | 'none';
  concessionFormula: string | null;
}

// State-specific duty rates and rules
export interface StateDutyRates {
  thresholds: DutyThreshold[];
  firstHomeBuyer: FirstHomeBuyerConcession;
  foreignSurcharge: number;
  investorDifference: boolean;
}

// Stamp duty rate data structure
export interface StampDutyRateData {
  [state: string]: StateDutyRates;
}

// Stamp duty calculator input parameters
export interface StampDutyParams {
  state: AustralianState;
  propertyPrice: number;
  purpose: PropertyPurpose;
  firstHomeBuyer: boolean;
  australianResident?: boolean;
}

// Detailed breakdown of the stamp duty calculation
export interface StampDutyBreakdown {
  baseStampDuty: number;
  concessionAmount: number;
  foreignSurcharge: number;
  finalAmount: number;
}

// Threshold information used in the calculation
export interface ThresholdInfo {
  rate: number;
  baseAmount: number;
  appliedThreshold: number;
}

// Complete stamp duty calculation result
export interface StampDutyResult {
  stampDuty: number;
  breakdown: StampDutyBreakdown;
  thresholds: ThresholdInfo;
} 