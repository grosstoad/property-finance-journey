import { useEffect } from 'react';
import { useLoan } from '../contexts/LoanContext';
import { useProperty } from '../contexts/PropertyContext';
import { getLoanProductDetails } from '../logic/loanProductService';
import { LoanPreferences } from '../types/loan';

export const useLoanProducts = () => {
  const { 
    loanAmount, 
    loanPurpose, 
    loanPreferences, 
    setLoanPreferences,
    loanProductDetails,
    setLoanProductDetails
  } = useLoan();
  
  const { selectedProperty } = useProperty();
  
  // Update the loan product details whenever relevant inputs change
  useEffect(() => {
    if (!loanAmount || !selectedProperty) {
      return;
    }
    
    const isOwnerOccupied = loanPurpose === 'OWNER_OCCUPIED';
    
    try {
      const productDetails = getLoanProductDetails({
        loanAmount: loanAmount.required,
        propertyValue: selectedProperty.valuation.mid,
        isOwnerOccupied,
        preferences: loanPreferences
      });
      
      setLoanProductDetails(productDetails);
    } catch (error) {
      console.error('Failed to calculate loan product details:', error);
      
      // Reset product details on error
      setLoanProductDetails({
        athenaProduct: null
      });
    }
  }, [
    loanAmount, 
    selectedProperty, 
    loanPurpose, 
    loanPreferences, 
    setLoanProductDetails
  ]);
  
  // Handle updating loan preferences
  const updateLoanPreferences = (newPreferences: Partial<LoanPreferences>) => {
    setLoanPreferences({
      ...loanPreferences,
      ...newPreferences
    });
  };
  
  // Get default loan preferences based on LVR
  const getDefaultPreferencesForLvr = (lvr: number): LoanPreferences => {
    if (lvr > 0.85) {
      // For high LVR, default to Power Up with 30 year term
      return {
        interestRateType: 'VARIABLE',
        repaymentType: 'PRINCIPAL_AND_INTEREST',
        loanFeatureType: 'offset',
        loanTerm: 30
      };
    } else if (lvr > 0.8) {
      // For 80-85% LVR, only Tailored product is available
      return {
        interestRateType: 'VARIABLE',
        repaymentType: 'PRINCIPAL_AND_INTEREST',
        loanTerm: 30
      };
    } else {
      // For lower LVR, default to Straight Up with 30 year term
      return {
        interestRateType: 'VARIABLE',
        repaymentType: 'PRINCIPAL_AND_INTEREST',
        loanFeatureType: 'redraw',
        loanTerm: 30
      };
    }
  };
  
  // Reset preferences to defaults for current LVR
  const resetPreferencesToDefaults = () => {
    if (!loanAmount || !selectedProperty) {
      return;
    }
    
    const lvr = loanAmount.required / selectedProperty.valuation.mid;
    const defaultPreferences = getDefaultPreferencesForLvr(lvr);
    
    setLoanPreferences(defaultPreferences);
  };
  
  return {
    loanProductDetails,
    loanPreferences,
    updateLoanPreferences,
    resetPreferencesToDefaults
  };
}; 