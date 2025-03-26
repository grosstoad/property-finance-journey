import ratesData from '../constants/rates.json';
import { LoanProductDetails } from '../types/loan';
import { formatCurrency } from './formatters';

/**
 * Interface to represent a product from rates.json data
 */
interface RateProduct {
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

/**
 * Convert LVR to a tier string (e.g., "0-50", "50-60", etc.)
 */
function getLvrTier(lvr: number): string {
  const lvrPercentage = lvr * 100;
  if (lvrPercentage <= 50) return '0-50';
  if (lvrPercentage <= 60) return '50-60';
  if (lvrPercentage <= 70) return '60-70';
  if (lvrPercentage <= 80) return '70-80';
  if (lvrPercentage <= 85) return '80-85';
  // If outside our defined tiers, return the highest tier
  return '80-85';
}

/**
 * Calculate monthly repayment based on loan amount, interest rate, and term
 */
export function calculateMonthlyRepayment(
  loanAmount: number, 
  interestRate: number, 
  loanTerm: number = 30
): number {
  // Convert interest rate to monthly decimal rate
  // If interest rate is already in percentage form (e.g. 6.24), divide by 100 first
  const isPercentageForm = interestRate > 1; // Assume >1 means percentage form (e.g. 6.24)
  const annualDecimalRate = isPercentageForm ? interestRate / 100 : interestRate;
  
  // Convert to monthly rate
  const monthlyRate = annualDecimalRate / 12;
  const termMonths = loanTerm * 12;
  
  // Log the calculation
  console.log('Monthly repayment calculation:', {
    loanAmount,
    providedInterestRate: interestRate,
    annualDecimalRate, 
    monthlyRate,
    termMonths
  });
  
  if (loanAmount <= 0) {
    console.warn('Invalid loan amount for repayment calculation:', loanAmount);
    return 0;
  }
  
  if (monthlyRate <= 0) {
    console.warn('Invalid interest rate for repayment calculation:', interestRate);
    return loanAmount / termMonths; // Simple division if rate is invalid
  }
  
  // Use standard amortization formula for monthly payment
  return loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
    (Math.pow(1 + monthlyRate, termMonths) - 1);
}

/**
 * Get product details based on LVR and other parameters
 */
export function getProductForLvr(
  lvr: number,
  loanAmount: number,
  isInvestmentProperty: boolean = false,
  isInterestOnly: boolean = false,
  isFixedRate: boolean = false,
  fixedTerm: number = 0,
  loanFeatureType: 'redraw' | 'offset' = 'redraw'
): LoanProductDetails {
  // Ensure lvr is a valid number between 0 and 1
  const validLvr = isNaN(lvr) ? 0.8 : Math.max(0, Math.min(lvr, 0.85));
  
  console.log('Getting product for LVR:', {
    providedLvr: lvr,
    normalizedLvr: validLvr,
    lvrPercentage: (validLvr * 100).toFixed(2) + '%',
    loanAmount,
    isInvestmentProperty,
    isInterestOnly,
    isFixedRate,
    fixedTerm,
    loanFeatureType
  });
  
  const lvrTier = getLvrTier(validLvr);
  const loanPurpose = isInvestmentProperty ? 'Investor' : 'Owner Occupied';
  const repaymentType = isInterestOnly ? 'Interest Only' : 'Principal & Interest';
  const interestRateType = isFixedRate ? 'Fixed' : 'Variable';
  
  // Determine product type based on LVR and preferences
  let productType: string;
  if (isFixedRate) {
    productType = 'Fixed';
  } else if (lvrTier === '80-85') {
    productType = 'Tailored';
  } else if (loanFeatureType === 'offset') {
    productType = 'Power Up';
  } else {
    productType = 'Straight Up';
  }
  
  console.log('Product search criteria:', {
    lvrTier,
    loanPurpose,
    repaymentType,
    interestRateType,
    productType,
    loanFeatureType: isFixedRate ? 'N/A' : loanFeatureType
  });
  
  // Filter products from rates data - basic criteria
  let products = (ratesData.ratesData as RateProduct[]).filter(product => 
    product['Product Type'] === productType &&
    product['Loan purpose'] === loanPurpose &&
    product['Repayment type'] === repaymentType &&
    product['Interest Rate Type'] === interestRateType &&
    product['LVR tier'] === lvrTier
  );
  
  console.log(`Found ${products.length} matching products before feature type filter`);
  
  // For variable rate, filter by loan feature type
  if (!isFixedRate) {
    products = products.filter(product => {
      const isOffsetProduct = product['Product Name'].includes('Power Up');
      return loanFeatureType === 'offset' ? isOffsetProduct : !isOffsetProduct;
    });
    
    console.log(`Found ${products.length} matching products after feature type filter`);
  }
  
  // For fixed rate, also match the fixed term
  const matchingProducts = isFixedRate 
    ? products.filter(p => p['Fixed rate term'] === fixedTerm)
    : products;
  
  console.log(`Found ${matchingProducts.length} matching products after all filters`);
  
  if (matchingProducts.length === 0) {
    console.warn(`No matching product found for: LVR ${lvr}, ${loanPurpose}, ${repaymentType}, ${interestRateType}${isFixedRate ? `, Term ${fixedTerm}yr` : ''}, Feature: ${isFixedRate ? 'N/A' : loanFeatureType}`);
    
    // Try fallback to Straight Up product for the same LVR tier
    const fallbackProducts = (ratesData.ratesData as RateProduct[]).filter(product => 
      product['Product Type'] === 'Straight Up' &&
      product['Loan purpose'] === loanPurpose &&
      product['Repayment type'] === 'Principal & Interest' &&
      product['Interest Rate Type'] === 'Variable' &&
      product['LVR tier'] === lvrTier
    );
    
    if (fallbackProducts.length > 0) {
      console.log('Using fallback Straight Up product:', fallbackProducts[0]['Product Name']);
      return createProductFromRateData(fallbackProducts[0], loanAmount);
    }
    
    // If still no match, create a default product
    console.log('No fallback products found, creating default product');
    return createDefaultProduct(loanAmount, validLvr);
  }
  
  console.log('Selected product:', matchingProducts[0]['Product Name']);
  return createProductFromRateData(matchingProducts[0], loanAmount);
}

/**
 * Create a product details object from rate data
 */
function createProductFromRateData(rateProduct: RateProduct, loanAmount: number): LoanProductDetails {
  try {
    // Calculate the loan term - assume 30 years for standard loans
    const loanTerm = 30;
    
    // Convert interest rate to percentage if needed (e.g., 0.0624 to 6.24%)
    // RatesData stores rates as decimals (e.g. 0.0624)
    const interestRateDecimal = rateProduct['Interest Rate'];
    const interestRatePercentage = interestRateDecimal * 100;
    
    console.log('Processing interest rate:', {
      rawRate: interestRateDecimal,
      percentageRate: interestRatePercentage
    });
    
    const monthlyRepayment = calculateMonthlyRepayment(
      loanAmount, 
      interestRatePercentage, // Now in percentage format (e.g. 6.24)
      loanTerm
    );
    
    // Calculate upfront fee if applicable
    const upfrontFee = rateProduct['Upfront fees'];
    const upfrontFeeAmount = upfrontFee > 0 ? loanAmount * upfrontFee : undefined;
    
    // Get reverting rate information if fixed
    let revertingRate;
    let revertingRepayment;
    
    if (rateProduct['Interest Rate Type'] === 'Fixed') {
      // Find the equivalent variable rate product to revert to
      const revertingProducts = (ratesData.ratesData as RateProduct[]).filter(product => 
        product['Loan purpose'] === rateProduct['Loan purpose'] &&
        product['Repayment type'] === rateProduct['Repayment type'] &&
        product['Interest Rate Type'] === 'Variable' &&
        product['LVR tier'] === rateProduct['LVR tier']
      );
      
      if (revertingProducts.length > 0) {
        revertingRate = revertingProducts[0]['Interest Rate'] * 100;
        revertingRepayment = calculateMonthlyRepayment(loanAmount, revertingRate, loanTerm);
      }
    }
    
    const product = {
      productName: rateProduct['Product Name'],
      interestRate: interestRatePercentage, // Store as percentage value (e.g. 6.24)
      monthlyRepayment,
      loanAmount,
      upfrontFee: upfrontFee > 0 ? upfrontFee : undefined,
      upfrontFeeAmount,
      revertingInterestRate: revertingRate,
      revertingMonthlyRepayment: revertingRepayment,
      revertingProductName: revertingRate ? 'Variable Rate' : undefined
    };
    
    console.log('Created product details:', {
      productName: product.productName,
      interestRate: product.interestRate,
      monthlyRepayment: product.monthlyRepayment
    });
    
    return product;
  } catch (error) {
    console.error('Error creating product from rate data:', error);
    // Return a basic valid product to prevent UI errors
    return {
      productName: rateProduct['Product Name'] || 'Standard Variable',
      interestRate: 6.24, // Maintain consistent format (percentage value)
      monthlyRepayment: calculateMonthlyRepayment(loanAmount, 6.24, 30),
      loanAmount
    };
  }
}

/**
 * Create a default product when no matching products are found
 */
function createDefaultProduct(loanAmount: number, lvr: number): LoanProductDetails {
  try {
    // Higher LVR gets higher rate
    const baseRate = 6.24; // Default base rate (already in percentage format, e.g. 6.24%)
    let adjustedRate = baseRate;
    let productName = 'Standard Variable';
    
    if (lvr > 0.8) {
      adjustedRate += 0.5; // Add 0.5% for high LVR
      productName = 'Tailored Variable';
    }
    
    console.log('Creating default product with:', {
      lvr: (lvr * 100).toFixed(2) + '%',
      baseRate,
      adjustedRate
    });
    
    const monthlyRepayment = calculateMonthlyRepayment(loanAmount, adjustedRate);
    
    const product = {
      productName,
      interestRate: adjustedRate, // Store as percentage (e.g. 6.24 or 6.74)
      monthlyRepayment,
      loanAmount,
      upfrontFee: lvr > 0.8 ? 0.015 : undefined,
      upfrontFeeAmount: lvr > 0.8 ? loanAmount * 0.015 : undefined
    };
    
    console.log('Created default product:', {
      productName: product.productName,
      interestRate: product.interestRate,
      monthlyRepayment: product.monthlyRepayment
    });
    
    return product;
  } catch (error) {
    console.error('Error creating default product:', error);
    // Return absolute fallback product with valid values
    return {
      productName: 'Home Loan',
      interestRate: 6.24, // Use consistent percentage format
      monthlyRepayment: loanAmount * 0.006,  // Very rough estimation to avoid errors
      loanAmount
    };
  }
} 