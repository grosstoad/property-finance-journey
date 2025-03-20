import { LoanPreferences, LoanProductDetails, OwnHomeProductDetails } from '../types/loan';
import ratesData from '../constants/rates.json';
import { ATHENA_LOGO_BASE64 } from '../constants/logos';

interface LoanCalculationParams {
  loanAmount: number;
  propertyValue: number;
  isOwnerOccupied: boolean;
  preferences: LoanPreferences;
}

// Define types for the rates data
interface RateEntry {
  'Product Type': string;
  'Interest Rate Type': string;
  'Fixed rate term': number;
  'Loan purpose': string;
  'Repayment type': string;
  'LVR tier': string;
  'Interest Rate': number;
  'Upfront fees': number;
  'Product Name': string;
}

interface RatesData {
  ratesData: RateEntry[];
  ownHomeProduct: {
    'Product Type': string;
    'Interest Rate Type': string;
    'Fixed rate term': number;
    'Term': number;
    'Interest Rate': number;
    'Upfront fees': number;
    'Product Name': string;
  };
  straightUpRates: Record<string, number>;
}

// Cast the imported data to our interface
const typedRatesData = ratesData as unknown as RatesData;

// Helper function to determine LVR tier
export const getLvrTier = (lvr: number): string => {
  if (lvr <= 0.5) return '0-50';
  if (lvr <= 0.6) return '50-60';
  if (lvr <= 0.7) return '60-70';
  if (lvr <= 0.8) return '70-80';
  if (lvr <= 0.85) return '80-85';
  return '85+';
};

// Helper function to calculate monthly repayment amount
export const calculateMonthlyRepayment = (
  loanAmount: number,
  interestRate: number,
  loanTermYears: number,
  isInterestOnly: boolean,
  interestOnlyTerm?: number
): number => {
  if (isInterestOnly && interestOnlyTerm) {
    // Interest only calculation
    return (loanAmount * interestRate) / 12;
  } else {
    // Principal and interest calculation
    const monthlyRate = interestRate / 12;
    const totalPayments = loanTermYears * 12;
    return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
           (Math.pow(1 + monthlyRate, totalPayments) - 1);
  }
};

// Helper function to get reverting rate
export const getRevertingRate = (isOwnerOccupied: boolean, lvrTier: string): number => {
  const loanPurpose = isOwnerOccupied ? 'Owner Occupied' : 'Investor';
  const key = `${loanPurpose}_${lvrTier}`;
  
  return typedRatesData.straightUpRates[key] || 0;
};

// Find the appropriate product based on LVR and preferences
export const getProductForLvr = (params: LoanCalculationParams): LoanProductDetails => {
  const { loanAmount, propertyValue, isOwnerOccupied, preferences } = params;
  
  // Calculate LVR and determine tier
  const lvr = loanAmount / propertyValue;
  const lvrTier = getLvrTier(lvr);
  
  // Determine loan purpose
  const loanPurpose = isOwnerOccupied ? 'Owner Occupied' : 'Investor';
  
  // Determine repayment type
  const repaymentType = preferences.repaymentType === 'PRINCIPAL_AND_INTEREST' 
    ? 'Principal & Interest' 
    : 'Interest Only';
  
  let productType: string;
  let interestRateType: string;
  let fixedTerm: number = 0;
  
  // Determine product type based on LVR and preferences
  if (lvrTier === '80-85') {
    productType = 'Tailored';
    interestRateType = 'Variable';
  } else if (preferences.interestRateType === 'FIXED') {
    productType = 'Fixed';
    interestRateType = 'Fixed';
    fixedTerm = preferences.fixedTerm || 1;
  } else if (preferences.loanFeatureType === 'offset') {
    productType = 'Power Up';
    interestRateType = 'Variable';
  } else {
    productType = 'Straight Up';
    interestRateType = 'Variable';
  }
  
  // Find the matching product in the rates data
  const product = typedRatesData.ratesData.find(p => 
    p['Product Type'] === productType &&
    p['Interest Rate Type'] === interestRateType &&
    p['Fixed rate term'] === fixedTerm &&
    p['Loan purpose'] === loanPurpose &&
    p['Repayment type'] === repaymentType &&
    p['LVR tier'] === lvrTier
  );
  
  if (!product) {
    // Fallback to Straight Up product if no match found
    const fallbackProduct = typedRatesData.ratesData.find(p => 
      p['Product Type'] === 'Straight Up' &&
      p['Interest Rate Type'] === 'Variable' &&
      p['Loan purpose'] === loanPurpose &&
      p['Repayment type'] === 'Principal & Interest' &&
      p['LVR tier'] === '70-80'
    );
    
    if (!fallbackProduct) {
      throw new Error('No suitable loan product found');
    }
    
    const monthlyRepayment = calculateMonthlyRepayment(
      loanAmount,
      fallbackProduct['Interest Rate'],
      preferences.loanTerm,
      false
    );
    
    return {
      productName: fallbackProduct['Product Name'],
      interestRate: fallbackProduct['Interest Rate'],
      monthlyRepayment,
      loanAmount,
      brandLogoSrc: ATHENA_LOGO_BASE64,
    };
  }
  
  // Calculate monthly repayment
  const monthlyRepayment = calculateMonthlyRepayment(
    loanAmount,
    product['Interest Rate'],
    preferences.loanTerm,
    preferences.repaymentType === 'INTEREST_ONLY',
    preferences.interestOnlyTerm
  );
  
  // Calculate upfront fee amount if applicable
  const upfrontFeeAmount = product['Upfront fees'] > 0 
    ? (product['Upfront fees'] * loanAmount) 
    : undefined;
  
  // Determine if we need a reverting rate (for Fixed or IO loans)
  let revertingRate: number | undefined;
  let revertingMonthlyRepayment: number | undefined;
  let revertingProductName: string | undefined;
  
  if (preferences.interestRateType === 'FIXED' || preferences.repaymentType === 'INTEREST_ONLY') {
    revertingRate = getRevertingRate(isOwnerOccupied, lvrTier);
    
    // For IO loans, calculate P&I repayment after IO period
    if (preferences.repaymentType === 'INTEREST_ONLY' && preferences.interestOnlyTerm) {
      const remainingTerm = preferences.loanTerm - preferences.interestOnlyTerm;
      revertingMonthlyRepayment = calculateMonthlyRepayment(
        loanAmount,
        revertingRate,
        remainingTerm,
        false
      );
    } 
    // For fixed loans, calculate variable rate repayment after fixed period
    else if (preferences.interestRateType === 'FIXED' && preferences.fixedTerm) {
      revertingMonthlyRepayment = calculateMonthlyRepayment(
        loanAmount,
        revertingRate,
        preferences.loanTerm - preferences.fixedTerm,
        preferences.repaymentType === 'INTEREST_ONLY',
        preferences.repaymentType === 'INTEREST_ONLY' ? preferences.interestOnlyTerm : undefined
      );
    }
    
    revertingProductName = isOwnerOccupied ? 'Athena Straight Up Principal & Interest' : 'Athena Straight Up Investor Principal & Interest';
  }
  
  return {
    productName: product['Product Name'],
    interestRate: product['Interest Rate'],
    monthlyRepayment,
    loanAmount,
    upfrontFee: product['Upfront fees'] > 0 ? product['Upfront fees'] : undefined,
    upfrontFeeAmount,
    revertingInterestRate: revertingRate,
    revertingMonthlyRepayment,
    revertingProductName,
    brandLogoSrc: ATHENA_LOGO_BASE64,
  };
};

// Get OwnHome loan details
export const getOwnHomeProduct = (
  requiredAmount: number, 
  athenaAmount: number, 
  loanTerm: number
): OwnHomeProductDetails => {
  const ownHomeAmount = requiredAmount - athenaAmount;
  const { ownHomeProduct } = typedRatesData;
  
  // Calculate the monthly repayment for OwnHome
  const monthlyRepayment = calculateMonthlyRepayment(
    ownHomeAmount,
    ownHomeProduct['Interest Rate'],
    ownHomeProduct['Term'],
    false
  );
  
  // Calculate upfront fee amount
  const upfrontFeeAmount = ownHomeProduct['Upfront fees'] > 0 
    ? (ownHomeProduct['Upfront fees'] * ownHomeAmount) 
    : undefined;
  
  return {
    productName: ownHomeProduct['Product Name'],
    interestRate: ownHomeProduct['Interest Rate'],
    monthlyRepayment,
    loanAmount: ownHomeAmount,
    upfrontFee: ownHomeProduct['Upfront fees'] > 0 ? ownHomeProduct['Upfront fees'] : undefined,
    upfrontFeeAmount,
    term: ownHomeProduct['Term'],
    brandLogoSrc: ATHENA_LOGO_BASE64,
  };
};

// Handle the product selection for all LVR scenarios
export const getLoanProductDetails = (params: LoanCalculationParams): {
  athenaProduct: LoanProductDetails;
  ownHomeProduct?: OwnHomeProductDetails;
} => {
  const { loanAmount, propertyValue } = params;
  
  // Calculate LVR
  const lvr = loanAmount / propertyValue;
  
  // For LVR > 85%, we need both Athena and OwnHome products
  if (lvr > 0.85) {
    // Athena can only lend up to 80% LVR
    const athenaAmount = propertyValue * 0.8;
    
    // Get Athena product details
    const athenaParams = {
      ...params,
      loanAmount: athenaAmount
    };
    
    const athenaProduct = getProductForLvr(athenaParams);
    
    // Get OwnHome product details for the remainder
    const ownHomeProduct = getOwnHomeProduct(loanAmount, athenaAmount, params.preferences.loanTerm);
    
    return {
      athenaProduct,
      ownHomeProduct
    };
  }
  
  // For LVR <= 85%, we only need the Athena product
  const athenaProduct = getProductForLvr(params);
  
  return {
    athenaProduct
  };
}; 