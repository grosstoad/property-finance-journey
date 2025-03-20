


# Loan Product Selection and Repayment Calculation

## Executive Summary

This document provides comprehensive technical requirements for developing two reusable functions for a mortgage application built using Vite, React, TypeScript, and Material UI:

1. **Product Selection Function**: Determines the appropriate loan product and interest rate based on user inputs such as loan purpose, repayment type, and LVR (Loan to Value Ratio).

2. **Repayment Calculation Function**: Calculates repayment amounts based on loan details, handling various scenarios including fixed-rate periods and interest-only periods.

Both functions are designed to be highly reusable components that can be utilized across multiple contexts in the application, ensuring consistent behavior and calculations throughout the customer journey.

## Overview
This document outlines the requirements and technical specifications for implementing:
1. A reusable product selection function that determines the appropriate loan product and interest rate based on user inputs
2. A reusable repayment calculation function that determines repayment amounts based on loan details

These functions are designed to be used in multiple contexts throughout the application, including:
- Initial product recommendation
- Loan comparison tools
- Quote generation
- Application process
- Loan servicing and management
- What-if scenario modeling

## Technology Stack
- Vite
- React
- TypeScript
- Material UI components

## 1. Product Selection Function

### Purpose
To determine the appropriate loan product, interest rate, and associated fees based on user inputs in a reusable manner across the application.

### Design Principles
- **Separation of concerns**: Completely decouple the product selection logic from UI components
- **Pure function design**: The function should have no side effects and depend only on its inputs
- **Immutability**: Input parameters should not be modified
- **Parameterized configuration**: The rates data should be injected as a parameter for maximum flexibility
- **Comprehensive validation**: All inputs should be validated before processing
- **Consistent error handling**: Standardized error format for integration with different parts of the app

### Inputs
- `loanPurpose`: "Owner Occupied" | "Investor"
- `repaymentType`: "Principal & Interest" | "Interest Only"
- `interestRateType`: "Variable" | "Fixed"
- `fixedTerm`: number (1, 2, or 3 years) - required only if `interestRateType` is "Fixed"
- `loanAmount`: number
- `propertyValue`: number
- `loanFeatureType`: "redraw" | "offset"

### Processing Logic
1. Calculate LVR (Loan to Value Ratio): `loanAmount / propertyValue`
2. Determine LVR tier based on calculated LVR:
   - "0-50%" if LVR <= 0.5
   - "50-60%" if 0.5 < LVR <= 0.6
   - "60-70%" if 0.6 < LVR <= 0.7
   - "70-80%" if 0.7 < LVR <= 0.8
   - "80-85%" if 0.8 < LVR <= 0.85
3. Determine Product Type:
   - "Fixed" if `interestRateType` is "Fixed"
   - "Straight Up" if `loanFeatureType` is "redraw"
   - "Power Up" if `loanFeatureType` is "offset"
   - "Tailored" if LVR tier is "80-85%"
4. Look up the appropriate product in the rates database using:
   - Product Type
   - Interest Rate Type
   - Fixed Term (if applicable)
   - Loan Purpose
   - Repayment Type
   - LVR Tier
5. Determine Reverting Interest Rate (if applicable):
   - For Interest Only loans: Use the Straight Up variable P&I rate with the same loan purpose and LVR tier
   - For Fixed loans: Use the Straight Up variable P&I rate with the same loan purpose and LVR tier
   - For other loans: No reverting rate applies

### Outputs
- `productName`: string - The name of the selected product
- `interestRate`: number - The applicable interest rate (as a decimal)
- `revertingInterestRate`: number | null - The rate the loan reverts to after fixed/IO period (if applicable)
- `upfrontFee`: number - Upfront fee as a percentage (e.g., 0.15 means 0.15%)
- `upfrontFeeAmount`: number - Calculated fee amount based on loan amount (e.g., 0.15% of loan amount)

### Data Structure
The product data will be stored in a JSON structure that allows for efficient lookups. The structure will be:

```typescript
interface RateEntry {
  productName: string;
  interestRate: number;
  upfrontFees: number;
}

interface RatesLookup {
  products: {
    [productType: string]: {
      [interestRateType: string]: {
        [fixedTerm: number]: {
          [loanPurpose: string]: {
            [repaymentType: string]: {
              [lvrTier: string]: RateEntry;
            };
          };
        };
      };
    };
  };
  straightUpRates: {
    [key: string]: number; // key format: "{loanPurpose}_{lvrTier}"
  };
}
```

### Error Handling
- If no matching product is found, throw an error with appropriate message
- If LVR exceeds 85%, throw an error indicating maximum LVR exceeded
- If fixed term is provided but interest rate type is not fixed, throw an error

## 2. Repayment Calculation Function

### Purpose
To calculate loan repayment amounts and totals based on loan details with consistent behavior across the application.

### Design Principles
- **Pure mathematical calculations**: The function should perform only mathematical calculations with no side effects
- **Flexibility for different scenarios**: Support various loan structures and repayment options
- **Reusability across application stages**: Same calculation logic for quotes, applications, servicing, and scenario modeling
- **Parameterized calculation**: Accept all variables that could change across different contexts
- **Consistent rounding rules**: Apply standard financial rounding rules consistently
- **Handle edge cases**: Account for unusual parameter values while maintaining accuracy

### Inputs
- `loanAmount`: number - The total loan amount
- `repaymentType`: "Interest Only" | "Principal & Interest"
- `interestOnlyYears`: number (1-5) - Required if repayment type is "Interest Only"
- `fixedTerm`: number (1-3) | null - Required if loan has a fixed rate period
- `loanTerm`: number (10-30) - The total loan term in years
- `repaymentFrequency`: "Monthly" | "Fortnightly" | "Weekly"
- `fixedOrIOInterestRate`: number - The interest rate during fixed/IO period
- `variablePIInterestRate`: number - The interest rate after fixed/IO period (reverting rate)

### Processing Logic
1. Calculate number of repayments based on frequency and loan term:
   - Monthly: loanTerm * 12
   - Fortnightly: loanTerm * 26
   - Weekly: loanTerm * 52
2. Calculate interest rate per payment period:
   - Monthly: annual rate / 12
   - Fortnightly: annual rate / 26
   - Weekly: annual rate / 52
3. Calculate initial repayments:
   - For Principal & Interest loans, use the standard amortization formula:
     ```
     P = L[r(1+r)^n]/[(1+r)^n-1]
     ```
     where:
     - P = payment amount per period
     - L = loan amount
     - r = rate per period
     - n = number of payments
   - For Interest Only loans:
     ```
     P = L * r
     ```
4. Calculate reverting repayments:
   - For Interest Only loans, calculate P&I repayments after IO period using:
     ```
     P = L[r(1+r)^n]/[(1+r)^n-1]
     ```
     where:
     - n = number of payments after IO period
     - r = variable P&I rate per period
   - For Fixed loans, calculate repayments after fixed period using:
     ```
     P = L[r(1+r)^n]/[(1+r)^n-1]
     ```
     where:
     - L = remaining principal after fixed period
     - n = number of payments after fixed period
     - r = variable P&I rate per period

### Outputs
- `initialRepayment`: number - The amount of each repayment during the initial period (fixed or IO)
- `revertingRepayment`: number | null - The amount of each repayment after the initial period
- `frequency`: string - The repayment frequency
- `totalRepayments`: number - The total amount paid over the life of the loan
- `totalInterest`: number - The total interest paid over the life of the loan

### Error Handling
- If loan term is outside the allowed range (10-30 years), throw an error
- If interest-only years is outside the allowed range (1-5 years), throw an error
- If fixed term is outside the allowed range (1-3 years), throw an error

## JSON Data Structure for Rates Lookup

We'll convert the CSV data into a structured JSON format that facilitates efficient lookups. The structure includes:

1. A flat array of all products (including the added Tailored products)
2. A nested lookup structure for efficient product selection

Here's an example of the data structure:

```json
{
  "ratesData": [
    {
      "Product Type": "Straight Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "0-50",
      "Interest Rate": 0.0624,
      "Upfront fees": 0,
      "Product Name": "Straight Up Owner P&I (LVR 0 to 50)"
    },
    // ... additional products
    {
      "Product Type": "Tailored",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "80-85",
      "Interest Rate": 0.0699,
      "Upfront fees": 0.15,
      "Product Name": "Tailored Owner P&I (LVR 80+ to 85)"
    }
  ],
  "lookupStructure": {
    "products": {
      "Straight Up": {
        "Variable": {
          "0": {
            "Owner Occupied": {
              "Principal & Interest": {
                "0-50": {
                  "interestRate": 0.0624,
                  "upfrontFees": 0,
                  "productName": "Straight Up Owner P&I (LVR 0 to 50)"
                },
                // ... more LVR tiers
              },
              "Interest Only": {
                // ... entries by LVR tier
              }
            },
            "Investor": {
              // ... entries by repayment type and LVR tier
            }
          }
        }
      },
      "Power Up": {
        // ... similar structure
      },
      "Fixed": {
        "Fixed": {
          "1": {
            // ... entries for 1-year fixed term
          },
          "2": {
            // ... entries for 2-year fixed term
          },
          "3": {
            // ... entries for 3-year fixed term
          }
        }
      },
      "Tailored": {
        "Variable": {
          "0": {
            // ... entries for Tailored products (80-85% LVR)
          }
        }
      }
    },
    "straightUpRates": {
      "Owner Occupied_0-50": 0.0624,
      "Owner Occupied_50-60": 0.0629,
      // ... other combinations for reverting rates
    }
  }
}
```

### Schema Definition

```typescript
// TypeScript interfaces for the JSON structure
interface RateEntry {
  "Product Type": string;
  "Interest Rate Type": string;
  "Fixed rate term": number;
  "Loan purpose": string;
  "Repayment type": string;
  "LVR tier": string;
  "Interest Rate": number;
  "Upfront fees": number;
  "Product Name": string;
}

interface ProductLookupEntry {
  interestRate: number;
  upfrontFees: number;
  productName: string;
}

interface RatesData {
  ratesData: RateEntry[];
  lookupStructure: {
    products: {
      [productType: string]: {
        [interestRateType: string]: {
          [fixedTerm: string]: {
            [loanPurpose: string]: {
              [repaymentType: string]: {
                [lvrTier: string]: ProductLookupEntry;
              };
            };
          };
        };
      };
    };
    straightUpRates: {
      [key: string]: number; // key format: "{loanPurpose}_{lvrTier}"
    };
  };
}
```

## Implementation Examples

### 1. Product Selection Function

```typescript
interface LoanDetails {
  loanPurpose: 'Owner Occupied' | 'Investor';
  repaymentType: 'Principal & Interest' | 'Interest Only';
  interestRateType: 'Variable' | 'Fixed';
  fixedTerm?: number; // 1, 2, or 3
  loanAmount: number;
  propertyValue: number;
  loanFeatureType: 'redraw' | 'offset';
}

interface ProductResult {
  productName: string;
  interestRate: number;
  revertingInterestRate: number | null;
  upfrontFee: number; // as percentage
  upfrontFeeAmount: number; // calculated amount
}

function getLoanProduct(loanDetails: LoanDetails, ratesData: RatesLookup): ProductResult {
  const { 
    loanPurpose, 
    repaymentType, 
    interestRateType, 
    fixedTerm = 0, 
    loanAmount, 
    propertyValue, 
    loanFeatureType 
  } = loanDetails;

  // Calculate LVR
  const lvr = loanAmount / propertyValue;
  
  // Determine LVR tier
  let lvrTier: string;
  if (lvr <= 0.5) lvrTier = '0-50';
  else if (lvr <= 0.6) lvrTier = '50-60';
  else if (lvr <= 0.7) lvrTier = '60-70';
  else if (lvr <= 0.8) lvrTier = '70-80';
  else if (lvr <= 0.85) lvrTier = '80-85';
  else throw new Error('Maximum LVR of 85% exceeded');

  // Determine product type
  let productType: string;
  if (interestRateType === 'Fixed') {
    productType = 'Fixed';
  } else if (lvrTier === '80-85') {
    productType = 'Tailored';
  } else if (loanFeatureType === 'redraw') {
    productType = 'Straight Up';
  } else if (loanFeatureType === 'offset') {
    productType = 'Power Up';
  } else {
    throw new Error('Unable to determine product type');
  }

  // Validate fixed term
  if (interestRateType === 'Fixed' && (!fixedTerm || ![1, 2, 3].includes(fixedTerm))) {
    throw new Error('Fixed term must be 1, 2, or 3 years for Fixed rate loans');
  }

  // Look up product in the rates database
  try {
    const product = ratesData.products[productType][interestRateType][fixedTerm][loanPurpose][repaymentType][lvrTier];
    
    if (!product) {
      throw new Error('No matching product found');
    }

    // Determine reverting rate if applicable
    let revertingRate: number | null = null;
    if (repaymentType === 'Interest Only' || interestRateType === 'Fixed') {
      const revertKey = `${loanPurpose}_${lvrTier}`;
      revertingRate = ratesData.straightUpRates[revertKey] || null;
    }

    // Calculate upfront fee amount
    const upfrontFeeAmount = (product.upfrontFees / 100) * loanAmount;

    return {
      productName: product.productName,
      interestRate: product.interestRate,
      revertingInterestRate: revertingRate,
      upfrontFee: product.upfrontFees,
      upfrontFeeAmount: upfrontFeeAmount
    };
  } catch (error) {
    throw new Error(`Error finding product: ${error.message}`);
  }
}
```

### 2. Repayment Calculation Function

```typescript
interface RepaymentCalculatorInputs {
  loanAmount: number;
  repaymentType: 'Interest Only' | 'Principal & Interest';
  interestOnlyYears?: number; // 1-5
  fixedTerm?: number; // 1-3
  loanTerm: number; // 10-30
  repaymentFrequency: 'Monthly' | 'Fortnightly' | 'Weekly';
  fixedOrIOInterestRate: number;
  variablePIInterestRate: number;
}

interface RepaymentCalculatorOutputs {
  initialRepayment: number;
  revertingRepayment: number | null;
  frequency: string;
  totalRepayments: number;
  totalInterest: number;
}

function calculateRepayments(inputs: RepaymentCalculatorInputs): RepaymentCalculatorOutputs {
  const {
    loanAmount,
    repaymentType,
    interestOnlyYears = 0,
    fixedTerm = 0,
    loanTerm,
    repaymentFrequency,
    fixedOrIOInterestRate,
    variablePIInterestRate
  } = inputs;

  // Validate inputs
  if (loanTerm < 10 || loanTerm > 30) {
    throw new Error('Loan term must be between 10-30 years');
  }
  
  if (repaymentType === 'Interest Only' && (interestOnlyYears < 1 || interestOnlyYears > 5)) {
    throw new Error('Interest only period must be between 1-5 years');
  }
  
  if (fixedTerm !== 0 && (fixedTerm < 1 || fixedTerm > 3)) {
    throw new Error('Fixed term must be between 1-3 years');
  }

  // Determine number of payments and rate per period
  let paymentsPerYear: number;
  if (repaymentFrequency === 'Monthly') paymentsPerYear = 12;
  else if (repaymentFrequency === 'Fortnightly') paymentsPerYear = 26;
  else paymentsPerYear = 52; // Weekly
  
  const totalPayments = loanTerm * paymentsPerYear;
  const initialRatePerPeriod = fixedOrIOInterestRate / paymentsPerYear;
  const revertingRatePerPeriod = variablePIInterestRate / paymentsPerYear;
  
  let initialRepayment: number;
  let revertingRepayment: number | null = null;
  let totalInterest = 0;
  let totalRepayments = 0;
  
  // Calculate initial repayments
  if (repaymentType === 'Interest Only') {
    initialRepayment = loanAmount * initialRatePerPeriod;
    
    // Calculate interest during IO period
    const ioPayments = interestOnlyYears * paymentsPerYear;
    const ioInterest = initialRepayment * ioPayments;
    
    // Calculate reverting P&I repayments after IO period
    const remainingTerm = loanTerm - interestOnlyYears;
    const remainingPayments = remainingTerm * paymentsPerYear;
    
    revertingRepayment = calculatePIPayment(loanAmount, revertingRatePerPeriod, remainingPayments);
    
    // Calculate total interest and repayments
    const piInterest = calculateTotalInterest(loanAmount, revertingRepayment, remainingPayments);
    totalInterest = ioInterest + piInterest;
    totalRepayments = (initialRepayment * ioPayments) + (revertingRepayment * remainingPayments);
  } else if (fixedTerm > 0) {
    // For fixed P&I loans
    const fixedPayments = fixedTerm * paymentsPerYear;
    initialRepayment = calculatePIPayment(loanAmount, initialRatePerPeriod, totalPayments);
    
    // Calculate remaining principal after fixed term
    const remainingPrincipal = calculateRemainingPrincipal(
      loanAmount, 
      initialRepayment, 
      initialRatePerPeriod, 
      fixedPayments
    );
    
    // Calculate reverting repayments for the remaining term
    const remainingPayments = totalPayments - fixedPayments;
    revertingRepayment = calculatePIPayment(remainingPrincipal, revertingRatePerPeriod, remainingPayments);
    
    // Calculate total interest and repayments
    const fixedInterest = calculateTotalInterest(loanAmount, initialRepayment, fixedPayments);
    const variableInterest = calculateTotalInterest(remainingPrincipal, revertingRepayment, remainingPayments);
    
    totalInterest = fixedInterest + variableInterest;
    totalRepayments = (initialRepayment * fixedPayments) + (revertingRepayment * remainingPayments);
  } else {
    // Standard P&I loan
    initialRepayment = calculatePIPayment(loanAmount, initialRatePerPeriod, totalPayments);
    totalInterest = calculateTotalInterest(loanAmount, initialRepayment, totalPayments);
    totalRepayments = initialRepayment * totalPayments;
  }
  
  return {
    initialRepayment,
    revertingRepayment,
    frequency: repaymentFrequency,
    totalRepayments,
    totalInterest
  };
}

// Helper function to calculate Principal & Interest payment
function calculatePIPayment(principal: number, ratePerPeriod: number, numberOfPayments: number): number {
  return principal * (ratePerPeriod * Math.pow(1 + ratePerPeriod, numberOfPayments)) 
         / (Math.pow(1 + ratePerPeriod, numberOfPayments) - 1);
}

// Helper function to calculate remaining principal after a certain number of payments
function calculateRemainingPrincipal(
  initialPrincipal: number, 
  payment: number, 
  ratePerPeriod: number, 
  numberOfPaymentsMade: number
): number {
  let balance = initialPrincipal;
  
  for (let i = 0; i < numberOfPaymentsMade; i++) {
    const interestForPeriod = balance * ratePerPeriod;
    const principalForPeriod = payment - interestForPeriod;
    balance -= principalForPeriod;
  }
  
  return balance;
}

// Helper function to calculate total interest paid
function calculateTotalInterest(
  principal: number, 
  payment: number, 
  numberOfPayments: number
): number {
  return (payment * numberOfPayments) - principal;
}


## Resuable hook

import { useState, useCallback, useMemo } from 'react';

// Types
export interface LoanDetails {
  loanPurpose: 'Owner Occupied' | 'Investor';
  repaymentType: 'Principal & Interest' | 'Interest Only';
  interestRateType: 'Variable' | 'Fixed';
  fixedTerm?: number; // 1, 2, or 3
  loanAmount: number;
  propertyValue: number;
  loanFeatureType: 'redraw' | 'offset';
  interestOnlyYears?: number; // 1-5, required if repayment type is Interest Only
  loanTerm: number; // 10-30 years
  repaymentFrequency: 'Monthly' | 'Fortnightly' | 'Weekly';
}

export interface ProductResult {
  productName: string;
  interestRate: number;
  revertingInterestRate: number | null;
  upfrontFee: number; // as percentage
  upfrontFeeAmount: number; // calculated amount
}

export interface RepaymentResult {
  initialRepayment: number;
  revertingRepayment: number | null;
  frequency: string;
  totalRepayments: number;
  totalInterest: number;
}

export interface LoanCalculationError {
  field: string;
  message: string;
  code: string;
}

export interface LoanCalculationResult {
  product: ProductResult | null;
  repayments: RepaymentResult | null;
  isCalculating: boolean;
  error: LoanCalculationError | null;
  recalculate: () => void;
}

export interface RatesLookup {
  products: {
    [productType: string]: {
      [interestRateType: string]: {
        [fixedTerm: string]: {
          [loanPurpose: string]: {
            [repaymentType: string]: {
              [lvrTier: string]: {
                interestRate: number;
                upfrontFees: number;
                productName: string;
              };
            };
          };
        };
      };
    };
  };
  straightUpRates: {
    [key: string]: number; // key format: "{loanPurpose}_{lvrTier}"
  };
}

/**
 * A custom hook that provides reusable loan product selection and repayment calculation
 * 
 * @param loanDetails - The loan details to calculate from
 * @param ratesData - The rates data to use for calculations
 * @returns LoanCalculationResult containing product, repayments, loading state, and error info
 */
export function useLoanCalculation(
  initialLoanDetails: LoanDetails,
  ratesData: RatesLookup
): LoanCalculationResult {
  const [loanDetails, setLoanDetails] = useState<LoanDetails>(initialLoanDetails);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [error, setError] = useState<LoanCalculationError | null>(null);

  // Memoize the product selection calculation
  const product = useMemo(() => {
    try {
      return getLoanProduct(loanDetails, ratesData);
    } catch (err) {
      if (err instanceof Error) {
        setError({
          field: 'product',
          message: err.message,
          code: 'PRODUCT_SELECTION_ERROR'
        });
      }
      return null;
    }
  }, [loanDetails, ratesData]);

  // Memoize the repayment calculation
  const repayments = useMemo(() => {
    if (!product) return null;

    try {
      const repaymentCalcInputs = {
        loanAmount: loanDetails.loanAmount,
        repaymentType: loanDetails.repaymentType,
        interestOnlyYears: loanDetails.interestOnlyYears,
        fixedTerm: loanDetails.fixedTerm,
        loanTerm: loanDetails.loanTerm,
        repaymentFrequency: loanDetails.repaymentFrequency,
        fixedOrIOInterestRate: product.interestRate,
        variablePIInterestRate: product.revertingInterestRate || product.interestRate
      };

      return calculateRepayments(repaymentCalcInputs);
    } catch (err) {
      if (err instanceof Error) {
        setError({
          field: 'repayments',
          message: err.message,
          code: 'REPAYMENT_CALCULATION_ERROR'
        });
      }
      return null;
    }
  }, [loanDetails, product]);

  // Function to trigger a recalculation (useful for integration with forms)
  const recalculate = useCallback(() => {
    setIsCalculating(true);
    setError(null);
    
    // Use setTimeout to allow UI to update before heavy calculation
    setTimeout(() => {
      // Force a refresh by creating a new object reference
      setLoanDetails(prevDetails => ({ ...prevDetails }));
      setIsCalculating(false);
    }, 0);
  }, []);

  return {
    product,
    repayments,
    isCalculating,
    error,
    recalculate
  };
}

/**
 * Standalone function to determine the appropriate loan product based on inputs
 * 
 * @param loanDetails - The loan details to calculate from
 * @param ratesData - The rates data to use for calculations
 * @returns The selected product information
 */
export function getLoanProduct(loanDetails: LoanDetails, ratesData: RatesLookup): ProductResult {
  // Destructure the loan details
  const { 
    loanPurpose, 
    repaymentType, 
    interestRateType, 
    fixedTerm = 0, 
    loanAmount, 
    propertyValue, 
    loanFeatureType 
  } = loanDetails;

  // Input validation
  if (loanAmount <= 0) {
    throw new Error('Loan amount must be greater than zero');
  }
  
  if (propertyValue <= 0) {
    throw new Error('Property value must be greater than zero');
  }
  
  if (interestRateType === 'Fixed' && (!fixedTerm || ![1, 2, 3].includes(fixedTerm))) {
    throw new Error('Fixed term must be 1, 2, or 3 years for Fixed rate loans');
  }

  // Calculate LVR
  const lvr = loanAmount / propertyValue;
  
  // Determine LVR tier
  let lvrTier: string;
  if (lvr <= 0.5) lvrTier = '0-50';
  else if (lvr <= 0.6) lvrTier = '50-60';
  else if (lvr <= 0.7) lvrTier = '60-70';
  else if (lvr <= 0.8) lvrTier = '70-80';
  else if (lvr <= 0.85) lvrTier = '80-85';
  else throw new Error('Maximum LVR of 85% exceeded');

  // Determine product type
  let productType: string;
  if (interestRateType === 'Fixed') {
    productType = 'Fixed';
  } else if (lvrTier === '80-85') {
    productType = 'Tailored';
  } else if (loanFeatureType === 'redraw') {
    productType = 'Straight Up';
  } else if (loanFeatureType === 'offset') {
    productType = 'Power Up';
  } else {
    throw new Error('Unable to determine product type');
  }

  // Look up product in the rates database
  try {
    const product = ratesData.products[productType][interestRateType][fixedTerm][loanPurpose][repaymentType][lvrTier];
    
    if (!product) {
      throw new Error('No matching product found');
    }

    // Determine reverting rate if applicable
    let revertingRate: number | null = null;
    if (repaymentType === 'Interest Only' || interestRateType === 'Fixed') {
      const revertKey = `${loanPurpose}_${lvrTier}`;
      revertingRate = ratesData.straightUpRates[revertKey] || null;
      
      if (revertingRate === null) {
        throw new Error(`Could not determine reverting rate for ${loanPurpose} and LVR tier ${lvrTier}`);
      }
    }

    // Calculate upfront fee amount (as dollars)
    const upfrontFeeAmount = (product.upfrontFees / 100) * loanAmount;

    return {
      productName: product.productName,
      interestRate: product.interestRate,
      revertingInterestRate: revertingRate,
      upfrontFee: product.upfrontFees,
      upfrontFeeAmount: upfrontFeeAmount
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error finding product: ${error.message}`);
    }
    throw new Error('Unknown error finding product');
  }
}

/**
 * Interface for repayment calculator inputs
 */
interface RepaymentCalculatorInputs {
  loanAmount: number;
  repaymentType: 'Interest Only' | 'Principal & Interest';
  interestOnlyYears?: number; // 1-5
  fixedTerm?: number; // 1-3
  loanTerm: number; // 10-30
  repaymentFrequency: 'Monthly' | 'Fortnightly' | 'Weekly';
  fixedOrIOInterestRate: number;
  variablePIInterestRate: number;
}

/**
 * Standalone function to calculate loan repayments
 * 
 * @param inputs - The repayment calculation inputs
 * @returns The calculated repayment information
 */
export function calculateRepayments(inputs: RepaymentCalculatorInputs): RepaymentResult {
  const {
    loanAmount,
    repaymentType,
    interestOnlyYears = 0,
    fixedTerm = 0,
    loanTerm,
    repaymentFrequency,
    fixedOrIOInterestRate,
    variablePIInterestRate
  } = inputs;

  // Validate inputs
  if (loanAmount <= 0) {
    throw new Error('Loan amount must be greater than zero');
  }
  
  if (loanTerm < 10 || loanTerm > 30) {
    throw new Error('Loan term must be between 10-30 years');
  }
  
  if (repaymentType === 'Interest Only' && (!interestOnlyYears || interestOnlyYears < 1 || interestOnlyYears > 5)) {
    throw new Error('Interest only period must be between 1-5 years');
  }
  
  if (fixedTerm !== 0 && (fixedTerm < 1 || fixedTerm > 3)) {
    throw new Error('Fixed term must be between 1-3 years');
  }

  if (fixedOrIOInterestRate <= 0 || variablePIInterestRate <= 0) {
    throw new Error('Interest rates must be greater than zero');
  }

  // Determine number of payments and rate per period
  let paymentsPerYear: number;
  if (repaymentFrequency === 'Monthly') paymentsPerYear = 12;
  else if (repaymentFrequency === 'Fortnightly') paymentsPerYear = 26;
  else paymentsPerYear = 52; // Weekly
  
  const totalPayments = loanTerm * paymentsPerYear;
  const initialRatePerPeriod = fixedOrIOInterestRate / paymentsPerYear;
  const revertingRatePerPeriod = variablePIInterestRate / paymentsPerYear;
  
  let initialRepayment: number;
  let revertingRepayment: number | null = null;
  let totalInterest = 0;
  let totalRepayments = 0;
  
  // Calculate initial repayments
  if (repaymentType === 'Interest Only') {
    // Interest-only calculation
    initialRepayment = roundToCents(loanAmount * initialRatePerPeriod);
    
    // Calculate interest during IO period
    const ioPayments = interestOnlyYears * paymentsPerYear;
    const ioInterest = initialRepayment * ioPayments;
    
    // Calculate reverting P&I repayments after IO period
    const remainingTerm = loanTerm - interestOnlyYears;
    const remainingPayments = remainingTerm * paymentsPerYear;
    
    revertingRepayment = roundToCents(calculatePIPayment(loanAmount, revertingRatePerPeriod, remainingPayments));
    
    // Calculate total interest and repayments
    const piInterest = calculateTotalInterest(loanAmount, revertingRepayment, remainingPayments);
    totalInterest = ioInterest + piInterest;
    totalRepayments = (initialRepayment * ioPayments) + (revertingRepayment * remainingPayments);
  } else if (fixedTerm > 0) {
    // For fixed P&I loans
    const fixedPayments = fixedTerm * paymentsPerYear;
    initialRepayment = roundToCents(calculatePIPayment(loanAmount, initialRatePerPeriod, totalPayments));
    
    // Calculate remaining principal after fixed term
    const remainingPrincipal = calculateRemainingPrincipal(
      loanAmount, 
      initialRepayment, 
      initialRatePerPeriod, 
      fixedPayments
    );
    
    // Calculate reverting repayments for the remaining term
    const remainingPayments = totalPayments - fixedPayments;
    revertingRepayment = roundToCents(calculatePIPayment(remainingPrincipal, revertingRatePerPeriod, remainingPayments));
    
    // Calculate total interest and repayments
    const fixedInterest = calculateTotalInterest(loanAmount, initialRepayment, fixedPayments);
    const variableInterest = calculateTotalInterest(remainingPrincipal, revertingRepayment, remainingPayments);
    
    totalInterest = fixedInterest + variableInterest;
    totalRepayments = (initialRepayment * fixedPayments) + (revertingRepayment * remainingPayments);
  } else {
    // Standard P&I loan
    initialRepayment = roundToCents(calculatePIPayment(loanAmount, initialRatePerPeriod, totalPayments));
    totalInterest = calculateTotalInterest(loanAmount, initialRepayment, totalPayments);
    totalRepayments = initialRepayment * totalPayments;
  }
  
  return {
    initialRepayment,
    revertingRepayment,
    frequency: repaymentFrequency,
    totalRepayments,
    totalInterest
  };
}

// Helper function to calculate Principal & Interest payment
function calculatePIPayment(principal: number, ratePerPeriod: number, numberOfPayments: number): number {
  // Handle edge case where rate is 0 (unlikely in real scenarios but mathematically possible)
  if (ratePerPeriod === 0) {
    return principal / numberOfPayments;
  }
  
  return principal * (ratePerPeriod * Math.pow(1 + ratePerPeriod, numberOfPayments)) 
         / (Math.pow(1 + ratePerPeriod, numberOfPayments) - 1);
}

// Helper function to calculate remaining principal after a certain number of payments
function calculateRemainingPrincipal(
  initialPrincipal: number, 
  payment: number, 
  ratePerPeriod: number, 
  numberOfPaymentsMade: number
): number {
  let balance = initialPrincipal;
  
  for (let i = 0; i < numberOfPaymentsMade; i++) {
    const interestForPeriod = balance * ratePerPeriod;
    const principalForPeriod = payment - interestForPeriod;
    balance -= principalForPeriod;
  }
  
  return Math.max(0, balance); // Ensure balance never goes negative
}

// Helper function to calculate total interest paid
function calculateTotalInterest(
  principal: number, 
  payment: number, 
  numberOfPayments: number
): number {
  return (payment * numberOfPayments) - principal;
}

// Helper function to round to nearest cent (2 decimal places)
function roundToCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}



## Rates.JSON
{
{
  "ratesData": [
    {
      "Product Type": "Straight Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "0-50",
      "Interest Rate": 0.0679,
      "Upfront fees": 0,
      "Product Name": "Investor IO Fixed 2 Yrs (LVR 60+ to 70)"
    }
  ],
  "lookupStructure": {
    "products": {
      "Straight Up": {
        "Variable": {
          "0": {
            "Owner Occupied": {
              "Principal & Interest": {
                "0-50": {
                  "interestRate": 0.0624,
                  "upfrontFees": 0,
                  "productName": "Straight Up Owner P&I (LVR 0 to 50)"
                },
            "Owner Occupied": {
              "Principal & Interest": {
                "0-50": {
                  "interestRate": 0.0664,
                  "upfrontFees": 0,
                  "productName": "Owner P&I Fixed 3 Yrs (LVR 0 to 50)"
                },
                "50-60": {
                  "interestRate": 0.0669,
                  "upfrontFees": 0,
                  "productName": "Owner P&I Fixed 3 Yrs (LVR 50+ to 60)"
                },
                "60-70": {
                  "interestRate": 0.0674,
                  "upfrontFees": 0,
                  "productName": "Owner P&I Fixed 3 Yrs (LVR 60+ to 70)"
                },
                "70-80": {
                  "interestRate": 0.0679,
                  "upfrontFees": 0,
                  "productName": "Owner P&I Fixed 3 Yrs (LVR 70+ to 80)"
                }
              },
              "Interest Only": {
                "0-50": {
                  "interestRate": 0.0694,
                  "upfrontFees": 0,
                  "productName": "Owner IO Fixed 3 Yrs (LVR 0 to 50)"
                },
                "50-60": {
                  "interestRate": 0.0694,
                  "upfrontFees": 0,
                  "productName": "Owner IO Fixed 3 Yrs (LVR 50+ to 60)"
                },
                "60-70": {
                  "interestRate": 0.0694,
                  "upfrontFees": 0,
                  "productName": "Owner IO Fixed 3 Yrs (LVR 60+ to 70)"
                },
                "70-80": {
                  "interestRate": 0.0694,
                  "upfrontFees": 0,
                  "productName": "Owner IO Fixed 3 Yrs (LVR 70+ to 80)"
                }
              }
            }
          }
        }
      },
      "Tailored": {
        "Variable": {
          "0": {
            "Owner Occupied": {
              "Principal & Interest": {
                "80-85": {
                  "interestRate": 0.0709,
                  "upfrontFees": 0.15,
                  "productName": "Tailored Owner P&I (LVR 80+ to 85)"
                }
              },
              "Interest Only": {
                "80-85": {
                  "interestRate": 0.0714,
                  "upfrontFees": 0.15,
                  "productName": "Tailored Owner IO (LVR 80+ to 85)"
                }
              }
            },
            "Investor": {
              "Principal & Interest": {
                "80-85": {
                  "interestRate": 0.0719,
                  "upfrontFees": 0.15,
                  "productName": "Tailored Investor P&I (LVR 80+ to 85)"
                }
              },
              "Interest Only": {
                "80-85": {
                  "interestRate": 0.0724,
                  "upfrontFees": 0.15,
                  "productName": "Tailored Investor IO (LVR 80+ to 85)"
                }
              }
            }
          }
        }
      }
    },
    "straightUpRates": {
      "Owner Occupied_0-50": 0.0624,
      "Owner Occupied_50-60": 0.0629,
      "Owner Occupied_60-70": 0.0634,
      "Owner Occupied_70-80": 0.0639,
      "Investor_0-50": 0.0634,
      "Investor_50-60": 0.0639,
      "Investor_60-70": 0.0644,
      "Investor_70-80": 0.0654
    }
  }
}
            "Owner Occupied": {
              "Principal & Interest": {
                "0-50": {
                  "interestRate": 0.0684,
                  "upfrontFees": 0,
                  "productName": "Owner P&I Fixed 2 Yrs (LVR 0 to 50)"
                },
                "50-60": {
                  "interestRate": 0.0689,
                  "upfrontFees": 0,
                  "productName": "Owner P&I Fixed 2 Yrs (LVR 50+ to 60)"
                },
                "60-70": {
                  "interestRate": 0.0694,
                  "upfrontFees": 0,
                  "productName": "Owner P&I Fixed 2 Yrs (LVR 60+ to 70)"
                },
                "70-80": {
                  "interestRate": 0.0699,
                  "upfrontFees": 0,
                  "productName": "Owner P&I Fixed 2 Yrs (LVR 70+ to 80)"
                }
              },
              "Interest Only": {
                "0-50": {
                  "interestRate": 0.0704,
                  "upfrontFees": 0,
                  "productName": "Owner IO Fixed 2 Yrs (LVR 0 to 50)"
                },
                "50-60": {
                  "interestRate": 0.0704,
                  "upfrontFees": 0,
                  "productName": "Owner IO Fixed 2 Yrs (LVR 50+ to 60)"
                },
                "60-70": {
                  "interestRate": 0.0704,
                  "upfrontFees": 0,
                  "productName": "Owner IO Fixed 2 Yrs (LVR 60+ to 70)"
                },
                "70-80": {
                  "interestRate": 0.0704,
                  "upfrontFees": 0,
                  "productName": "Owner IO Fixed 2 Yrs (LVR 70+ to 80)"
                }
              }
            }
          },
          "3": {
            "Investor": {
              "Principal & Interest": {
                "0-50": {
                  "interestRate": 0.0654,
                  "upfrontFees": 0,
                  "productName": "Investor P&I Fixed 3 Yrs (LVR 0 to 50)"
                },
                "50-60": {
                  "interestRate": 0.0654,
                  "upfrontFees": 0,
                  "productName": "Investor P&I Fixed 3 Yrs (LVR 50+ to 60)"
                },
                "60-70": {
                  "interestRate": 0.0659,
                  "upfrontFees": 0,
                  "productName": "Investor P&I Fixed 3 Yrs (LVR 60+ to 70)"
                },
                "70-80": {
                  "interestRate": 0.0664,
                  "upfrontFees": 0,
                  "productName": "Investor P&I Fixed 3 Yrs (LVR 70+ to 80)"
                }
              },
              "Interest Only": {
                "0-50": {
                  "interestRate": 0.0654,
                  "upfrontFees": 0,
                  "productName": "Investor IO Fixed 3 Yrs (LVR 0 to 50)"
                },
                "50-60": {
                  "interestRate": 0.0654,
                  "upfrontFees": 0,
                  "productName": "Investor IO Fixed 3 Yrs (LVR 50+ to 60)"
                },
                "60-70": {
                  "interestRate": 0.0659,
                  "upfrontFees": 0,
                  "productName": "Investor IO Fixed 3 Yrs (LVR 60+ to 70)"
                },
                "70-80": {
                  "interestRate": 0.0664,
                  "upfrontFees": 0,
                  "productName": "Investor IO Fixed 3 Yrs (LVR 70+ to 80)"
                }
              }
            },
      "Fixed": {
        "Fixed": {
          "1": {
            "Investor": {
              "Principal & Interest": {
                "0-50": {
                  "interestRate": 0.0694,
                  "upfrontFees": 0,
                  "productName": "Investor P&I Fixed 1 Yr (LVR 0 to 50)"
                },
                "50-60": {
                  "interestRate": 0.0694,
                  "upfrontFees": 0,
                  "productName": "Investor P&I Fixed 1 Yr (LVR 50+ to 60)"
                },
                "60-70": {
                  "interestRate": 0.0674,
                  "upfrontFees": 0,
                  "productName": "Investor P&I Fixed 2 Yrs (LVR 60+ to 70)"
                },
                "70-80": {
                  "interestRate": 0.0679,
                  "upfrontFees": 0,
                  "productName": "Investor P&I Fixed 2 Yrs (LVR 70+ to 80)"
                }
              },
              "Interest Only": {
                "0-50": {
                  "interestRate": 0.0674,
                  "upfrontFees": 0,
                  "productName": "Investor IO Fixed 2 Yrs (LVR 0 to 50)"
                },
                "50-60": {
                  "interestRate": 0.0674,
                  "upfrontFees": 0,
                  "productName": "Investor IO Fixed 2 Yrs (LVR 50+ to 60)"
                },
                "60-70": {
                  "interestRate": 0.0679,
                  "upfrontFees": 0,
                  "productName": "Investor IO Fixed 2 Yrs (LVR 60+ to 70)"
                },
                "70-80": {
                  "interestRate": 0.0684,
                  "upfrontFees": 0,
                  "productName": "Investor IO Fixed 2 Yrs (LVR 70+ to 80)"
                }
              }
            },-70": {
                  "interestRate": 0.0699,
                  "upfrontFees": 0,
                  "productName": "Investor P&I Fixed 1 Yr (LVR 60+ to 70)"
                },
                "70-80": {
                  "interestRate": 0.0704,
                  "upfrontFees": 0,
                  "productName": "Investor P&I Fixed 1 Yr (LVR 70+ to 80)"
                }
              },
              "Interest Only": {
                "0-50": {
                  "interestRate": 0.0704,
                  "upfrontFees": 0,
                  "productName": "Investor IO Fixed 1 Yr (LVR 0 to 50)"
                },
                "50-60": {
                  "interestRate": 0.0704,
                  "upfrontFees": 0,
                  "productName": "Investor IO Fixed 1 Yr (LVR 50+ to 60)"
                },
                "60-70": {
                  "interestRate": 0.0709,
                  "upfrontFees": 0,
                  "productName": "Investor IO Fixed 1 Yr (LVR 60+ to 70)"
                },
                "70-80": {
                  "interestRate": 0.0714,
                  "upfrontFees": 0,
                  "productName": "Investor IO Fixed 1 Yr (LVR 70+ to 80)"
                }
              }
            },
            "Owner Occupied": {
              "Principal & Interest": {
                "0-50": {
                  "interestRate": 0.0684,
                  "upfrontFees": 0,
                  "productName": "Owner P&I Fixed 1 Yr (LVR 0 to 50)"
                },
                "50-60": {
                  "interestRate": 0.0689,
                  "upfrontFees": 0,
                  "productName": "Owner P&I Fixed 1 Yr (LVR 50+ to 60)"
                },
                "60-70": {
                  "interestRate": 0.0694,
                  "upfrontFees": 0,
                  "productName": "Owner P&I Fixed 1 Yr (LVR 60+ to 70)"
                },
                "70-80": {
                  "interestRate": 0.0699,
                  "upfrontFees": 0,
                  "productName": "Owner P&I Fixed 1 Yr (LVR 70+ to 80)"
                }
              },
              "Interest Only": {
                "0-50": {
                  "interestRate": 0.0704,
                  "upfrontFees": 0,
                  "productName": "Owner IO Fixed 1 Yr (LVR 0 to 50)"
                },
                "50-60": {
                  "interestRate": 0.0704,
                  "upfrontFees": 0,
                  "productName": "Owner IO Fixed 1 Yr (LVR 50+ to 60)"
                },
                "60-70": {
                  "interestRate": 0.0704,
                  "upfrontFees": 0,
                  "productName": "Owner IO Fixed 1 Yr (LVR 60+ to 70)"
                },
                "70-80": {
                  "interestRate": 0.0704,
                  "upfrontFees": 0,
                  "productName": "Owner IO Fixed 1 Yr (LVR 70+ to 80)"
                }
              }
            }
          },
          "2": {
            "Investor": {
              "Principal & Interest": {
                "0-50": {
                  "interestRate": 0.0669,
                  "upfrontFees": 0,
                  "productName": "Investor P&I Fixed 2 Yrs (LVR 0 to 50)"
                },
                "50-60": {
                  "interestRate": 0.0669,
                  "upfrontFees": 0,
                  "productName": "Investor P&I Fixed 2 Yrs (LVR 50+ to 60)"
                },
                "60
                "50-60": {
                  "interestRate": 0.0629,
                  "upfrontFees": 0,
                  "productName": "Straight Up Owner P&I (LVR 50+ to 60)"
                },
                "60-70": {
                  "interestRate": 0.0634,
                  "upfrontFees": 0,
                  "productName": "Straight Up Owner P&I (LVR 60+ to 70)"
                },
                "70-80": {
                  "interestRate": 0.0639,
                  "upfrontFees": 0,
                  "productName": "Straight Up Owner P&I (LVR 70+ to 80)"
                }
              },
              "Interest Only": {
                "0-50": {
                  "interestRate": 0.0649,
                  "upfrontFees": 0,
                  "productName": "Straight Up Owner IO (LVR 0 to 50)"
                },
                "50-60": {
                  "interestRate": 0.0649,
                  "upfrontFees": 0,
                  "productName": "Straight Up Owner IO (LVR 50+ to 60)"
                },
                "60-70": {
                  "interestRate": 0.0649,
                  "upfrontFees": 0,
                  "productName": "Straight Up Owner IO (LVR 60+ to 70)"
                },
                "70-80": {
                  "interestRate": 0.0649,
                  "upfrontFees": 0,
                  "productName": "Straight Up Owner IO (LVR 70+ to 80)"
                }
              }
            },
            "Investor": {
              "Principal & Interest": {
                "0-50": {
                  "interestRate": 0.0634,
                  "upfrontFees": 0,
                  "productName": "Straight Up Investor P&I (LVR 0 to 50)"
                },
                "50-60": {
                  "interestRate": 0.0639,
                  "upfrontFees": 0,
                  "productName": "Straight Up Investor P&I (LVR 50+ to 60)"
                },
                "60-70": {
                  "interestRate": 0.0644,
                  "upfrontFees": 0,
                  "productName": "Straight Up Investor P&I (LVR 60+ to 70)"
                },
                "70-80": {
                  "interestRate": 0.0654,
                  "upfrontFees": 0,
                  "productName": "Straight Up Investor P&I (LVR 70+ to 80)"
                }
              },
              "Interest Only": {
                "0-50": {
                  "interestRate": 0.0654,
                  "upfrontFees": 0,
                  "productName": "Straight Up Investor IO (LVR 0 to 50)"
                },
                "50-60": {
                  "interestRate": 0.0654,
                  "upfrontFees": 0,
                  "productName": "Straight Up Investor IO (LVR 50+ to 60)"
                },
                "60-70": {
                  "interestRate": 0.0659,
                  "upfrontFees": 0,
                  "productName": "Straight Up Investor IO (LVR 60+ to 70)"
                },
                "70-80": {
                  "interestRate": 0.0664,
                  "upfrontFees": 0,
                  "productName": "Straight Up Investor IO (LVR 70+ to 80)"
                }
              }
            }
          }
        }
      },
      "Power Up": {
        "Variable": {
          "0": {
            "Owner Occupied": {
              "Principal & Interest": {
                "0-50": {
                  "interestRate": 0.0639,
                  "upfrontFees": 0,
                  "productName": "Power Up Owner P&I (LVR 0 to 50)"
                },
                "50-60": {
                  "interestRate": 0.0644,
                  "upfrontFees": 0,
                  "productName": "Power Up Owner P&I (LVR 50+ to 60)"
                },
                "60-70": {
                  "interestRate": 0.0649,
                  "upfrontFees": 0,
                  "productName": "Power Up Owner P&I (LVR 60+ to 70)"
                },
                "70-80": {
                  "interestRate": 0.0654,
                  "upfrontFees": 0,
                  "productName": "Power Up Owner P&I (LVR 70+ to 80)"
                }
              },
              "Interest Only": {
                "0-50": {
                  "interestRate": 0.0664,
                  "upfrontFees": 0,
                  "productName": "Power Up Owner IO (LVR 0 to 50)"
                },
                "50-60": {
                  "interestRate": 0.0664,
                  "upfrontFees": 0,
                  "productName": "Power Up Owner IO (LVR 50+ to 60)"
                },
                "60-70": {
                  "interestRate": 0.0664,
                  "upfrontFees": 0,
                  "productName": "Power Up Owner IO (LVR 60+ to 70)"
                },
                "70-80": {
                  "interestRate": 0.0664,
                  "upfrontFees": 0,
                  "productName": "Power Up Owner IO (LVR 70+ to 80)"
                }
              }
            },
            "Investor": {
              "Principal & Interest": {
                "0-50": {
                  "interestRate": 0.0649,
                  "upfrontFees": 0,
                  "productName": "Power Up Investor P&I (LVR 0 to 50)"
                },
                "50-60": {
                  "interestRate": 0.0654,
                  "upfrontFees": 0,
                  "productName": "Power Up Investor P&I (LVR 50+ to 60)"
                },
                "60-70": {
                  "interestRate": 0.0659,
                  "upfrontFees": 0,
                  "productName": "Power Up Investor P&I (LVR 60+ to 70)"
                },
                "70-80": {
                  "interestRate": 0.0669,
                  "upfrontFees": 0,
                  "productName": "Power Up Investor P&I (LVR 70+ to 80)"
                }
              },
              "Interest Only": {
                "0-50": {
                  "interestRate": 0.0669,
                  "upfrontFees": 0,
                  "productName": "Power Up Investor IO (LVR 0 to 50)"
                },
                "50-60": {
                  "interestRate": 0.0669,
                  "upfrontFees": 0,
                  "productName": "Power Up Investor IO (LVR 50+ to 60)"
                },
                "60-70": {
                  "interestRate": 0.0674,
                  "upfrontFees": 0,
                  "productName": "Power Up Investor IO (LVR 60+ to 70)"
                },
                "70-80": {
                  "interestRate": 0.0679,
                  "upfrontFees": 0,
                  "productName": "Power Up Investor IO (LVR 70+ to 80)"
                }
              }
            }
          }
        }
      },,
    {
      "Product Type": "Tailored",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "80-85",
      "Interest Rate": 0.0709,
      "Upfront fees": 0.15,
      "Product Name": "Tailored Owner P&I (LVR 80+ to 85)"
    },
    {
      "Product Type": "Tailored",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Interest Only",
      "LVR tier": "80-85",
      "Interest Rate": 0.0714,
      "Upfront fees": 0.15,
      "Product Name": "Tailored Owner IO (LVR 80+ to 85)"
    },
    {
      "Product Type": "Tailored",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Investor",
      "Repayment type": "Principal & Interest",
      "LVR tier": "80-85",
      "Interest Rate": 0.0719,
      "Upfront fees": 0.15,
      "Product Name": "Tailored Investor P&I (LVR 80+ to 85)"
    },
    {
      "Product Type": "Tailored",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Investor",
      "Repayment type": "Interest Only",
      "LVR tier": "80-85",
      "Interest Rate": 0.0724,
      "Upfront fees": 0.15,
      "Product Name": "Tailored Investor IO (LVR 80+ to 85)"
    }
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 2,
      "Loan purpose": "Investor",
      "Repayment type": "Interest Only",
      "LVR tier": "70-80",
      "Interest Rate": 0.0684,
      "Upfront fees": 0,
      "Product Name": "Investor IO Fixed 2 Yrs (LVR 70+ to 80)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 3,
      "Loan purpose": "Investor",
      "Repayment type": "Interest Only",
      "LVR tier": "0-50",
      "Interest Rate": 0.0654,
      "Upfront fees": 0,
      "Product Name": "Investor IO Fixed 3 Yrs (LVR 0 to 50)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 3,
      "Loan purpose": "Investor",
      "Repayment type": "Interest Only",
      "LVR tier": "50-60",
      "Interest Rate": 0.0654,
      "Upfront fees": 0,
      "Product Name": "Investor IO Fixed 3 Yrs (LVR 50+ to 60)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 3,
      "Loan purpose": "Investor",
      "Repayment type": "Interest Only",
      "LVR tier": "60-70",
      "Interest Rate": 0.0659,
      "Upfront fees": 0,
      "Product Name": "Investor IO Fixed 3 Yrs (LVR 60+ to 70)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 3,
      "Loan purpose": "Investor",
      "Repayment type": "Interest Only",
      "LVR tier": "70-80",
      "Interest Rate": 0.0664,
      "Upfront fees": 0,
      "Product Name": "Investor IO Fixed 3 Yrs (LVR 70+ to 80)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 1,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "0-50",
      "Interest Rate": 0.0684,
      "Upfront fees": 0,
      "Product Name": "Owner P&I Fixed 1 Yr (LVR 0 to 50)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 1,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "50-60",
      "Interest Rate": 0.0689,
      "Upfront fees": 0,
      "Product Name": "Owner P&I Fixed 1 Yr (LVR 50+ to 60)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 1,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "60-70",
      "Interest Rate": 0.0694,
      "Upfront fees": 0,
      "Product Name": "Owner P&I Fixed 1 Yr (LVR 60+ to 70)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 1,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "70-80",
      "Interest Rate": 0.0699,
      "Upfront fees": 0,
      "Product Name": "Owner P&I Fixed 1 Yr (LVR 70+ to 80)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 2,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "0-50",
      "Interest Rate": 0.0684,
      "Upfront fees": 0,
      "Product Name": "Owner P&I Fixed 2 Yrs (LVR 0 to 50)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 2,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "50-60",
      "Interest Rate": 0.0689,
      "Upfront fees": 0,
      "Product Name": "Owner P&I Fixed 2 Yrs (LVR 50+ to 60)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 2,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "60-70",
      "Interest Rate": 0.0694,
      "Upfront fees": 0,
      "Product Name": "Owner P&I Fixed 2 Yrs (LVR 60+ to 70)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 2,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "70-80",
      "Interest Rate": 0.0699,
      "Upfront fees": 0,
      "Product Name": "Owner P&I Fixed 2 Yrs (LVR 70+ to 80)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 3,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "0-50",
      "Interest Rate": 0.0664,
      "Upfront fees": 0,
      "Product Name": "Owner P&I Fixed 3 Yrs (LVR 0 to 50)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 3,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "50-60",
      "Interest Rate": 0.0669,
      "Upfront fees": 0,
      "Product Name": "Owner P&I Fixed 3 Yrs (LVR 50+ to 60)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 3,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "60-70",
      "Interest Rate": 0.0674,
      "Upfront fees": 0,
      "Product Name": "Owner P&I Fixed 3 Yrs (LVR 60+ to 70)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 3,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "70-80",
      "Interest Rate": 0.0679,
      "Upfront fees": 0,
      "Product Name": "Owner P&I Fixed 3 Yrs (LVR 70+ to 80)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 1,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Interest Only",
      "LVR tier": "0-50",
      "Interest Rate": 0.0704,
      "Upfront fees": 0,
      "Product Name": "Owner IO Fixed 1 Yr (LVR 0 to 50)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 1,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Interest Only",
      "LVR tier": "50-60",
      "Interest Rate": 0.0704,
      "Upfront fees": 0,
      "Product Name": "Owner IO Fixed 1 Yr (LVR 50+ to 60)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 1,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Interest Only",
      "LVR tier": "60-70",
      "Interest Rate": 0.0704,
      "Upfront fees": 0,
      "Product Name": "Owner IO Fixed 1 Yr (LVR 60+ to 70)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 1,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Interest Only",
      "LVR tier": "70-80",
      "Interest Rate": 0.0704,
      "Upfront fees": 0,
      "Product Name": "Owner IO Fixed 1 Yr (LVR 70+ to 80)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 2,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Interest Only",
      "LVR tier": "0-50",
      "Interest Rate": 0.0704,
      "Upfront fees": 0,
      "Product Name": "Owner IO Fixed 2 Yrs (LVR 0 to 50)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 2,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Interest Only",
      "LVR tier": "50-60",
      "Interest Rate": 0.0704,
      "Upfront fees": 0,
      "Product Name": "Owner IO Fixed 2 Yrs (LVR 50+ to 60)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 2,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Interest Only",
      "LVR tier": "60-70",
      "Interest Rate": 0.0704,
      "Upfront fees": 0,
      "Product Name": "Owner IO Fixed 2 Yrs (LVR 60+ to 70)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 2,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Interest Only",
      "LVR tier": "70-80",
      "Interest Rate": 0.0704,
      "Upfront fees": 0,
      "Product Name": "Owner IO Fixed 2 Yrs (LVR 70+ to 80)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 3,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Interest Only",
      "LVR tier": "0-50",
      "Interest Rate": 0.0694,
      "Upfront fees": 0,
      "Product Name": "Owner IO Fixed 3 Yrs (LVR 0 to 50)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 3,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Interest Only",
      "LVR tier": "50-60",
      "Interest Rate": 0.0694,
      "Upfront fees": 0,
      "Product Name": "Owner IO Fixed 3 Yrs (LVR 50+ to 60)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 3,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Interest Only",
      "LVR tier": "60-70",
      "Interest Rate": 0.0694,
      "Upfront fees": 0,
      "Product Name": "Owner IO Fixed 3 Yrs (LVR 60+ to 70)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 3,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Interest Only",
      "LVR tier": "70-80",
      "Interest Rate": 0.0694,
      "Upfront fees": 0,
      "Product Name": "Owner IO Fixed 3 Yrs (LVR 70+ to 80)"
    },0624,
      "Upfront fees": 0,
      "Product Name": "Straight Up Owner P&I (LVR 0 to 50)"
    },
    {
      "Product Type": "Straight Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "50-60",
      "Interest Rate": 0.0629,
      "Upfront fees": 0,
      "Product Name": "Straight Up Owner P&I (LVR 50+ to 60)"
    },
    {
      "Product Type": "Straight Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "60-70",
      "Interest Rate": 0.0634,
      "Upfront fees": 0,
      "Product Name": "Straight Up Owner P&I (LVR 60+ to 70)"
    },
    {
      "Product Type": "Straight Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "70-80",
      "Interest Rate": 0.0639,
      "Upfront fees": 0,
      "Product Name": "Straight Up Owner P&I (LVR 70+ to 80)"
    },
    {
      "Product Type": "Straight Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Interest Only",
      "LVR tier": "0-50",
      "Interest Rate": 0.0649,
      "Upfront fees": 0,
      "Product Name": "Straight Up Owner IO (LVR 0 to 50)"
    },
    {
      "Product Type": "Straight Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Interest Only",
      "LVR tier": "50-60",
      "Interest Rate": 0.0649,
      "Upfront fees": 0,
      "Product Name": "Straight Up Owner IO (LVR 50+ to 60)"
    },
    {
      "Product Type": "Straight Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Interest Only",
      "LVR tier": "60-70",
      "Interest Rate": 0.0649,
      "Upfront fees": 0,
      "Product Name": "Straight Up Owner IO (LVR 60+ to 70)"
    },
    {
      "Product Type": "Straight Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Interest Only",
      "LVR tier": "70-80",
      "Interest Rate": 0.0649,
      "Upfront fees": 0,
      "Product Name": "Straight Up Owner IO (LVR 70+ to 80)"
    },
    {
      "Product Type": "Straight Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Investor",
      "Repayment type": "Principal & Interest",
      "LVR tier": "0-50",
      "Interest Rate": 0.0634,
      "Upfront fees": 0,
      "Product Name": "Straight Up Investor P&I (LVR 0 to 50)"
    },
    {
      "Product Type": "Straight Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Investor",
      "Repayment type": "Principal & Interest",
      "LVR tier": "50-60",
      "Interest Rate": 0.0639,
      "Upfront fees": 0,
      "Product Name": "Straight Up Investor P&I (LVR 50+ to 60)"
    },
    {
      "Product Type": "Straight Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Investor",
      "Repayment type": "Principal & Interest",
      "LVR tier": "60-70",
      "Interest Rate": 0.0644,
      "Upfront fees": 0,
      "Product Name": "Straight Up Investor P&I (LVR 60+ to 70)"
    },
    {
      "Product Type": "Straight Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Investor",
      "Repayment type": "Principal & Interest",
      "LVR tier": "70-80",
      "Interest Rate": 0.0654,
      "Upfront fees": 0,
      "Product Name": "Straight Up Investor P&I (LVR 70+ to 80)"
    },
    {
      "Product Type": "Straight Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Investor",
      "Repayment type": "Interest Only",
      "LVR tier": "0-50",
      "Interest Rate": 0.0654,
      "Upfront fees": 0,
      "Product Name": "Straight Up Investor IO (LVR 0 to 50)"
    },
    {
      "Product Type": "Straight Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Investor",
      "Repayment type": "Interest Only",
      "LVR tier": "50-60",
      "Interest Rate": 0.0654,
      "Upfront fees": 0,
      "Product Name": "Straight Up Investor IO (LVR 50+ to 60)"
    },
    {
      "Product Type": "Straight Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Investor",
      "Repayment type": "Interest Only",
      "LVR tier": "60-70",
      "Interest Rate": 0.0659,
      "Upfront fees": 0,
      "Product Name": "Straight Up Investor IO (LVR 60+ to 70)"
    },
    {
      "Product Type": "Straight Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Investor",
      "Repayment type": "Interest Only",
      "LVR tier": "70-80",
      "Interest Rate": 0.0664,
      "Upfront fees": 0,
      "Product Name": "Straight Up Investor IO (LVR 70+ to 80)"
    },
    {
      "Product Type": "Power Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "0-50",
      "Interest Rate": 0.0639,
      "Upfront fees": 0,
      "Product Name": "Power Up Owner P&I (LVR 0 to 50)"
    },
    {
      "Product Type": "Power Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "50-60",
      "Interest Rate": 0.0644,
      "Upfront fees": 0,
      "Product Name": "Power Up Owner P&I (LVR 50+ to 60)"
    },
    {
      "Product Type": "Power Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "60-70",
      "Interest Rate": 0.0649,
      "Upfront fees": 0,
      "Product Name": "Power Up Owner P&I (LVR 60+ to 70)"
    },
    {
      "Product Type": "Power Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Principal & Interest",
      "LVR tier": "70-80",
      "Interest Rate": 0.0654,
      "Upfront fees": 0,
      "Product Name": "Power Up Owner P&I (LVR 70+ to 80)"
    },
    {
      "Product Type": "Power Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Interest Only",
      "LVR tier": "0-50",
      "Interest Rate": 0.0664,
      "Upfront fees": 0,
      "Product Name": "Power Up Owner IO (LVR 0 to 50)"
    },
    {
      "Product Type": "Power Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Interest Only",
      "LVR tier": "50-60",
      "Interest Rate": 0.0664,
      "Upfront fees": 0,
      "Product Name": "Power Up Owner IO (LVR 50+ to 60)"
    },
    {
      "Product Type": "Power Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Interest Only",
      "LVR tier": "60-70",
      "Interest Rate": 0.0664,
      "Upfront fees": 0,
      "Product Name": "Power Up Owner IO (LVR 60+ to 70)"
    },
    {
      "Product Type": "Power Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Owner Occupied",
      "Repayment type": "Interest Only",
      "LVR tier": "70-80",
      "Interest Rate": 0.0664,
      "Upfront fees": 0,
      "Product Name": "Power Up Owner IO (LVR 70+ to 80)"
    },
    {
      "Product Type": "Power Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Investor",
      "Repayment type": "Principal & Interest",
      "LVR tier": "0-50",
      "Interest Rate": 0.0649,
      "Upfront fees": 0,
      "Product Name": "Power Up Investor P&I (LVR 0 to 50)"
    },
    {
      "Product Type": "Power Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Investor",
      "Repayment type": "Principal & Interest",
      "LVR tier": "50-60",
      "Interest Rate": 0.0654,
      "Upfront fees": 0,
      "Product Name": "Power Up Investor P&I (LVR 50+ to 60)"
    },
    {
      "Product Type": "Power Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Investor",
      "Repayment type": "Principal & Interest",
      "LVR tier": "60-70",
      "Interest Rate": 0.0659,
      "Upfront fees": 0,
      "Product Name": "Power Up Investor P&I (LVR 60+ to 70)"
    },
    {
      "Product Type": "Power Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Investor",
      "Repayment type": "Principal & Interest",
      "LVR tier": "70-80",
      "Interest Rate": 0.0669,
      "Upfront fees": 0,
      "Product Name": "Power Up Investor P&I (LVR 70+ to 80)"
    },
    {
      "Product Type": "Power Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Investor",
      "Repayment type": "Interest Only",
      "LVR tier": "0-50",
      "Interest Rate": 0.0669,
      "Upfront fees": 0,
      "Product Name": "Power Up Investor IO (LVR 0 to 50)"
    },
    {
      "Product Type": "Power Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Investor",
      "Repayment type": "Interest Only",
      "LVR tier": "50-60",
      "Interest Rate": 0.0669,
      "Upfront fees": 0,
      "Product Name": "Power Up Investor IO (LVR 50+ to 60)"
    },
    {
      "Product Type": "Power Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Investor",
      "Repayment type": "Interest Only",
      "LVR tier": "60-70",
      "Interest Rate": 0.0674,
      "Upfront fees": 0,
      "Product Name": "Power Up Investor IO (LVR 60+ to 70)"
    },
    {
      "Product Type": "Power Up",
      "Interest Rate Type": "Variable",
      "Fixed rate term": 0,
      "Loan purpose": "Investor",
      "Repayment type": "Interest Only",
      "LVR tier": "70-80",
      "Interest Rate": 0.0679,
      "Upfront fees": 0,
      "Product Name": "Power Up Investor IO (LVR 70+ to 80)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 1,
      "Loan purpose": "Investor",
      "Repayment type": "Principal & Interest",
      "LVR tier": "0-50",
      "Interest Rate": 0.0694,
      "Upfront fees": 0,
      "Product Name": "Investor P&I Fixed 1 Yr (LVR 0 to 50)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 1,
      "Loan purpose": "Investor",
      "Repayment type": "Principal & Interest",
      "LVR tier": "50-60",
      "Interest Rate": 0.0694,
      "Upfront fees": 0,
      "Product Name": "Investor P&I Fixed 1 Yr (LVR 50+ to 60)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 1,
      "Loan purpose": "Investor",
      "Repayment type": "Principal & Interest",
      "LVR tier": "60-70",
      "Interest Rate": 0.0699,
      "Upfront fees": 0,
      "Product Name": "Investor P&I Fixed 1 Yr (LVR 60+ to 70)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 1,
      "Loan purpose": "Investor",
      "Repayment type": "Principal & Interest",
      "LVR tier": "70-80",
      "Interest Rate": 0.0704,
      "Upfront fees": 0,
      "Product Name": "Investor P&I Fixed 1 Yr (LVR 70+ to 80)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 2,
      "Loan purpose": "Investor",
      "Repayment type": "Principal & Interest",
      "LVR tier": "0-50",
      "Interest Rate": 0.0669,
      "Upfront fees": 0,
      "Product Name": "Investor P&I Fixed 2 Yrs (LVR 0 to 50)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 2,
      "Loan purpose": "Investor",
      "Repayment type": "Principal & Interest",
      "LVR tier": "50-60",
      "Interest Rate": 0.0669,
      "Upfront fees": 0,
      "Product Name": "Investor P&I Fixed 2 Yrs (LVR 50+ to 60)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 2,
      "Loan purpose": "Investor",
      "Repayment type": "Principal & Interest",
      "LVR tier": "60-70",
      "Interest Rate": 0.0674,
      "Upfront fees": 0,
      "Product Name": "Investor P&I Fixed 2 Yrs (LVR 60+ to 70)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 2,
      "Loan purpose": "Investor",
      "Repayment type": "Principal & Interest",
      "LVR tier": "70-80",
      "Interest Rate": 0.0679,
      "Upfront fees": 0,
      "Product Name": "Investor P&I Fixed 2 Yrs (LVR 70+ to 80)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 3,
      "Loan purpose": "Investor",
      "Repayment type": "Principal & Interest",
      "LVR tier": "0-50",
      "Interest Rate": 0.0654,
      "Upfront fees": 0,
      "Product Name": "Investor P&I Fixed 3 Yrs (LVR 0 to 50)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 3,
      "Loan purpose": "Investor",
      "Repayment type": "Principal & Interest",
      "LVR tier": "50-60",
      "Interest Rate": 0.0654,
      "Upfront fees": 0,
      "Product Name": "Investor P&I Fixed 3 Yrs (LVR 50+ to 60)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 3,
      "Loan purpose": "Investor",
      "Repayment type": "Principal & Interest",
      "LVR tier": "60-70",
      "Interest Rate": 0.0659,
      "Upfront fees": 0,
      "Product Name": "Investor P&I Fixed 3 Yrs (LVR 60+ to 70)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 3,
      "Loan purpose": "Investor",
      "Repayment type": "Principal & Interest",
      "LVR tier": "70-80",
      "Interest Rate": 0.0664,
      "Upfront fees": 0,
      "Product Name": "Investor P&I Fixed 3 Yrs (LVR 70+ to 80)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 1,
      "Loan purpose": "Investor",
      "Repayment type": "Interest Only",
      "LVR tier": "0-50",
      "Interest Rate": 0.0704,
      "Upfront fees": 0,
      "Product Name": "Investor IO Fixed 1 Yr (LVR 0 to 50)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 1,
      "Loan purpose": "Investor",
      "Repayment type": "Interest Only",
      "LVR tier": "50-60",
      "Interest Rate": 0.0704,
      "Upfront fees": 0,
      "Product Name": "Investor IO Fixed 1 Yr (LVR 50+ to 60)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 1,
      "Loan purpose": "Investor",
      "Repayment type": "Interest Only",
      "LVR tier": "60-70",
      "Interest Rate": 0.0709,
      "Upfront fees": 0,
      "Product Name": "Investor IO Fixed 1 Yr (LVR 60+ to 70)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 1,
      "Loan purpose": "Investor",
      "Repayment type": "Interest Only",
      "LVR tier": "70-80",
      "Interest Rate": 0.0714,
      "Upfront fees": 0,
      "Product Name": "Investor IO Fixed 1 Yr (LVR 70+ to 80)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 2,
      "Loan purpose": "Investor",
      "Repayment type": "Interest Only",
      "LVR tier": "0-50",
      "Interest Rate": 0.0674,
      "Upfront fees": 0,
      "Product Name": "Investor IO Fixed 2 Yrs (LVR 0 to 50)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 2,
      "Loan purpose": "Investor",
      "Repayment type": "Interest Only",
      "LVR tier": "50-60",
      "Interest Rate": 0.0674,
      "Upfront fees": 0,
      "Product Name": "Investor IO Fixed 2 Yrs (LVR 50+ to 60)"
    },
    {
      "Product Type": "Fixed",
      "Interest Rate Type": "Fixed",
      "Fixed rate term": 2,
      "Loan purpose": "Investor",
      "Repayment type": "Interest Only",
      "LVR tier": "60-70",
      "Interest Rate": 0.