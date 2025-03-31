import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Grid, useMediaQuery, useTheme, Typography, Alert, Fade } from '@mui/material';
import { AffordabilityCard_2 } from '../components-test/AffordabilityCard_2';
import { ProductCard_2 } from '../components-test/ProductCard_2';
import { OwnHomeProductCard_2 } from '../components-test/OwnHomeProductCard_2';
import { depositService } from '../logic/depositService';
import { calculateMonthlyRepayment, getProductForLvr } from '../logic/productSelector';
import { useLoanProducts } from '../hooks';
import { ATHENA_LOGO_URL, OWNHOME_LOGO_URL } from '../constants/urls';
import { LoanProductDetails, OwnHomeProductDetails } from '../types/loan';
import { formatCurrency } from '../logic/formatters';
import { ImprovementSuggestions } from './AffordabilityCalculator/ImprovementSuggestions';
import { calculateImprovementScenarios } from '../logic/calculateImprovementScenarios';
import type { ImprovementScenario, FinancialsInput, MaxBorrowingResult } from '../types/FinancialTypes';
import { NextSteps } from './NextSteps';

// Fixed isInterestOnly check
const isInterestOnlySelected = (interestOnlyTerm?: number): boolean => {
  return interestOnlyTerm !== undefined && interestOnlyTerm > 0;
};

interface AffordabilityVisualizationProps {
  // Original Props (for context/suggestions)
  propertyPrice: number; // Keep original desired price for context if needed?
  savings: number;
  propertyState: string;
  propertyPostcode: string;
  isFirstHomeBuyer: boolean;
  isInvestmentProperty: boolean;
  requiredLoanAmount: number; // Keep for alert context
  maxBorrowingPower: number; // Keep for alert context
  desiredPropertyValue: number; // Keep for alert context
  financials: FinancialsInput | null;
  maxBorrowResult: MaxBorrowingResult | null;
  onEditLoanPreferences: () => void;
  onApplySuggestion: (scenario: ImprovementScenario) => void;

  // New Props (Calculated State from Parent)
  loanAmount: number;
  depositAmount: number;
  stampDuty: number;
  upfrontCosts: number;
  lvrPercentage: number;
  productDetails: LoanProductDetails | null;
  monthlyRepayment: number;
  minPropertyValue: number;
  maxPropertyValue: number;
  onPropertyValueChange: (value: number) => void;

  // REMOVED (Now part of calculated state passed in)
  // baseInterestRate: number;
  // selectedProduct: any; 
}

export function AffordabilityVisualization({
  // Keep original props needed for context/logic here
  propertyPrice: originalPropertyPrice, // Rename original prop if needed
  savings,
  propertyState,
  propertyPostcode,
  isFirstHomeBuyer,
  isInvestmentProperty,
  requiredLoanAmount,
  maxBorrowingPower,
  desiredPropertyValue,
  financials,
  maxBorrowResult,
  onEditLoanPreferences,
  onApplySuggestion,
  // Destructure new calculated props
  loanAmount,
  depositAmount,
  stampDuty,
  upfrontCosts,
  lvrPercentage,
  productDetails,
  monthlyRepayment,
  minPropertyValue,
  maxPropertyValue,
  onPropertyValueChange
}: AffordabilityVisualizationProps) {
  try {
    // REMOVE internal state that duplicates props:
    // const [propertyValue, setPropertyValue] = useState(displayPropertyValue); 
    // const [loanAmount, setLoanAmount] = useState(displayLoanAmount);
    // const [deposit, setDeposit] = useState(displayDeposit);
    // const [stampDuty, setStampDuty] = useState(displayStampDuty);
    // const [upfrontCosts, setUpfrontCosts] = useState(displayUpfrontCosts);
    // const [monthlyRepayment, setMonthlyRepayment] = useState(displayMonthlyRepayment);
    // const [productDetails, setProductDetails] = useState<any>(displayProductDetails);
    // const [lvrPercentage, setLvrPercentage] = useState(displayLvr);
    
    // REMOVE useEffect hooks that recalculated state (lines ~390, ~571)
    // REMOVE updateDerivedValues callback

    // Keep state/logic needed for OwnHome product (if separate from main product)
    const { loanPreferences, loanProductDetails: contextLoanProductDetails } = useLoanProducts(); // Keep context access if needed for OwnHome
    const [hasOwnHomeProduct, setHasOwnHomeProduct] = useState(false);
    const [ownHomeProduct, setOwnHomeProduct] = useState<OwnHomeProductDetails | null>(null);
    
    // Effect for OwnHome (needs contextLoanProductDetails)
     useEffect(() => {
      try {
        setHasOwnHomeProduct(!!contextLoanProductDetails?.ownHomeProduct);
        if (contextLoanProductDetails?.ownHomeProduct) {
          setOwnHomeProduct({
            ...contextLoanProductDetails.ownHomeProduct,
            brandLogoSrc: OWNHOME_LOGO_URL
          });
        } else {
          setOwnHomeProduct(null);
        }
      } catch (error) {
        console.error("Error updating OwnHome product:", error);
      }
    }, [contextLoanProductDetails]);


    // --- RENDER LOGIC --- 
    // Use the PROPS directly
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Recalculate isAffordable based on props
    const isAffordable = useMemo(() => {
      if (typeof maxBorrowingPower === 'number' && typeof requiredLoanAmount === 'number') {
        return maxBorrowingPower >= requiredLoanAmount;
      }
      return false; // Default to false if values are not valid
    }, [maxBorrowingPower, requiredLoanAmount]);
    
    // Filter scenarios based on borrowing reason
    const filteredScenarios = useMemo(() => {
      if (!maxBorrowResult || !maxBorrowResult.scenarios) {
        return [];
      }
      // If deposit is the limiting factor, show all scenarios (including savings)
      if (maxBorrowResult.maxBorrowAmountReason === 'deposit') {
        return maxBorrowResult.scenarios;
      }
      // Otherwise, filter out the savings-related scenarios
      return maxBorrowResult.scenarios.filter(scenario => scenario.type !== 'SAVINGS');
      
    }, [maxBorrowResult]);

    // Error handling can remain
    const [error, setError] = useState<string | null>(null); 
    if (error) {
      // ... error display ...
    }
    
    // OwnHome logic (needs refinement - calculateOwnHomeAmount might need props)
    const showOwnHomeCard = hasOwnHomeProduct && 
                         ownHomeProduct && 
                         lvrPercentage > 80;
                         
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <Grid container spacing={3}>
          {/* AffordabilityCard_2 on the left */}
          <Grid item xs={12} md={6}>
            <AffordabilityCard_2
              // Pass necessary props directly
              initialPropertyValue={originalPropertyPrice} // Pass the value to display in slider/input
              minPropertyValue={minPropertyValue} // Pass calculated min
              maxPropertyValue={maxPropertyValue} // Pass calculated max
              savings={savings}
              onChange={onPropertyValueChange} // Pass the handler to the card
              propertyState={propertyState}
              isFirstHomeBuyer={isFirstHomeBuyer}
              isInvestmentProperty={isInvestmentProperty}
              maxBorrowingPower={maxBorrowingPower} // For alert
              requiredLoanAmount={requiredLoanAmount} // For alert
              desiredPropertyValue={desiredPropertyValue} // For alert
              maxAffordablePropertyValue={maxPropertyValue} // For alert (iterative max)
              // Pass calculated values for display inside card
              loanAmount={loanAmount}
              deposit={depositAmount} 
              stampDuty={stampDuty}
              upfrontCosts={upfrontCosts}
              lvr={lvrPercentage}
            />
          </Grid>
          
          {/* Product Card on the right */}
          <Grid item xs={12} md={6}>
            {showOwnHomeCard ? (
              <OwnHomeProductCard_2
                athenaProduct={{ // Pass main product details
                  // Ensure required fields have fallbacks if productDetails is null
                  productName: productDetails?.productName ?? "Loan",
                  interestRate: productDetails?.interestRate ?? 0,
                  monthlyRepayment: monthlyRepayment,
                  loanAmount: loanAmount,
                  // Pass other optional fields safely
                  ...(productDetails || {})
                }}
                ownHomeProduct={ownHomeProduct} // Pass OwnHome details
                onEdit={onEditLoanPreferences}
              />
            ) : (
              <ProductCard_2
                // Pass product details directly from props, with null checks/fallbacks
                interestRate={productDetails?.interestRate ?? 0}
                monthlyRepayment={monthlyRepayment}
                revertingInterestRate={productDetails?.revertingInterestRate} // Keep optional chaining
                revertingYears={loanPreferences.interestRateType === 'FIXED' ? loanPreferences.fixedTerm || 0 : (loanPreferences.interestOnlyTerm || 0)}
                remainingYears={(loanPreferences.loanTerm || 30) - (loanPreferences.interestRateType === 'FIXED' ? loanPreferences.fixedTerm || 0 : (loanPreferences.interestOnlyTerm || 0))}
                loanProductName={productDetails?.productName ?? "Loan"} // Provide fallback
                lvrRange={`${Math.floor(lvrPercentage/10)*10}-${Math.ceil(lvrPercentage/10)*10}% LVR`}
                isInterestOnly={isInterestOnlySelected(loanPreferences.interestOnlyTerm)} 
                isFixed={loanPreferences.interestRateType === 'FIXED'} 
                hasRevertingRate={!!productDetails?.revertingInterestRate} // Keep optional chaining
                revertingProductName={productDetails?.revertingProductName}
                features={getProductFeatures(productDetails?.productName || "")}
                onEdit={onEditLoanPreferences}
              />
            )}
            {/* Add NextSteps component below the product card */}
            <NextSteps sx={{ mt: 3 }} /> 
          </Grid>
        </Grid>
        
        {/* Improvement Suggestions Section - Add children back */}
        <Fade 
          in={!isAffordable && filteredScenarios.length > 0}
          timeout={1000} 
          unmountOnExit
        >
           <Box sx={{ mt: 4, mb: 20 }}>
             <ImprovementSuggestions
               scenarios={filteredScenarios}
               appliedScenarios={maxBorrowResult?.appliedScenarioIds || []}
               onScenarioClick={onApplySuggestion}
             />
           </Box>
        </Fade>
      </Box>
    );
  } catch (error) {
     // ... error handling ...
  }
}

// REMOVE Helper function to get product features (or move to parent/logic file)
// function getProductFeatures(productName: string): string[] { ... }

// REMOVE Helper function getLvrRangeText (or move)
// const getLvrRangeText = (lvr: number): string => { ... }

// REMOVE Helper function calculateOwnHomeAmount (or move/refine)
// const calculateOwnHomeAmount = (...) => { ... }

// Helper function to get product features based on product type
function getProductFeatures(productName: string): string[] {
  if (!productName) return [];
  
  const productNameLower = productName.toLowerCase();
  
  if (productNameLower.includes('straight up')) {
    return ["No lender fees", "Automatic Rate Match", "Rewarded for loyalty"];
  } else if (productNameLower.includes('fixed')) {
    return ["No lender fees", "Rate certainty"];
  } else if (productNameLower.includes('power up')) {
    return ["No lender fees", "Automatic Rate Match", "Offset account"];
  } else if (productNameLower.includes('tailored')) {
    return ["No LMI"];
  }
  
  return ["No lender fees"]; // Default feature
} 