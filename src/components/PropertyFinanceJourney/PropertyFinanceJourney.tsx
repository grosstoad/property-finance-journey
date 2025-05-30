import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { useFinancials } from '../../contexts/FinancialsContext';
import { useProperty } from '../../contexts/PropertyContext';
import { useLoan } from '../../contexts/LoanContext';
import { LoanOptions } from '../LoanOptions';
import { FinancialsModal } from '../FinancialsModal';
import { AffordabilityCalculator } from '../AffordabilityCalculator/AffordabilityCalculator';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLoanProducts } from '../../hooks/useLoanProducts';
import { calculateMaxBorrowing } from '../../logic/maxBorrow/adapter';
import { MaxBorrowingResult } from '../../types/FinancialTypes';
import { MaxBorrowLogs } from '../MaxBorrowLogs';

export const PropertyFinanceJourney = () => {
  const [showFinancialsModal, setShowFinancialsModal] = useState(false);
  const [currentView, setCurrentView] = useState<'loanOptions' | 'affordability'>('loanOptions');
  const [maxBorrowResult, setMaxBorrowResult] = useState<MaxBorrowingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { selectedProperty, depositDetails } = useProperty();
  const { financials } = useFinancials();
  const { loanAmount, loanPurpose, isFirstHomeBuyer } = useLoan();
  const { loanProductDetails, loanPreferences } = useLoanProducts();

  // Debug effect to trace data availability
  useEffect(() => {
    if (currentView === 'affordability') {
      console.log('AffordabilityCalculator debug:', {
        hasFinancials: !!financials,
        hasLoanProductDetails: !!loanProductDetails,
        loanProductDetailsStructure: loanProductDetails ? Object.keys(loanProductDetails) : 'undefined',
        hasAthenaProduct: !!(loanProductDetails?.athenaProduct)
      });
    }
  }, [currentView, financials, loanProductDetails]);

  // Calculate max borrowing result
  useEffect(() => {
    const calculateAsync = async () => {
      if (selectedProperty && loanProductDetails?.athenaProduct && financials) {
        try {
          const result = await calculateMaxBorrowing(
            financials,
            loanProductDetails.athenaProduct,
            selectedProperty.valuation.mid,
            loanPurpose === 'INVESTMENT',
            selectedProperty.address.postcode,
            depositDetails?.savings || 0,
            selectedProperty.address.state,
            false,
            loanAmount?.required || 0,
            false,
            loanPreferences
          );
          
          setMaxBorrowResult(result);
          console.log("Max borrow result calculated:", result);
        } catch (error) {
          console.error('Error calculating max borrowing:', error);
          setMaxBorrowResult(null);
        }
      } else {
        setMaxBorrowResult(null);
      }
    };
    
    calculateAsync();
  }, [
    financials, 
    loanProductDetails, 
    selectedProperty, 
    loanPurpose, 
    depositDetails, 
    loanAmount,
    loanPreferences
  ]);

  const handleCalculateAffordability = async () => {
    setShowFinancialsModal(true);
    
    // Verify data is available before switching views
    if (financials && loanProductDetails?.athenaProduct) {
      setCurrentView('affordability');
      console.log('Switching to affordability view with valid data');
    } else {
      console.warn('Cannot switch to affordability view - missing required data:', {
        hasFinancials: !!financials,
        hasLoanProductDetails: !!loanProductDetails,
        hasAthenaProduct: !!(loanProductDetails?.athenaProduct)
      });
      // Stay in loan options view until data is ready
    }
    
    // Debug logs
    console.log('Financials submitted:', financials);
    console.log('Selected Property:', selectedProperty);
    console.log('Loan Amount:', loanAmount);
    console.log('Loan Product Details:', loanProductDetails);
    console.log('Deposit Details:', depositDetails);

    try {
      setIsLoading(true);
      
      // Add null checks before calling
      if (!financials || !loanProductDetails?.athenaProduct || !selectedProperty) {
        console.error('Missing required data for calculation in handleCalculateAffordability');
        setError('Missing required data. Please check your inputs.'); // Optionally set an error state
        setIsLoading(false);
        return;
      }
      
      const result = await calculateMaxBorrowing(
        financials,
        loanProductDetails.athenaProduct,
        selectedProperty.valuation.mid,
        loanPurpose === 'INVESTMENT',
        selectedProperty.address.postcode,
        depositDetails?.savings || 0,
        selectedProperty.address.state,
        false,
        loanAmount?.required || 0,
        false,
        loanPreferences
      );
      
      setMaxBorrowResult(result);
      console.log("Max borrow result calculated:", result);
    } catch (error) {
      console.error('Error calculating max borrowing:', error);
      setMaxBorrowResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinancialsSubmit = () => {
    setShowFinancialsModal(false);
    
    // Verify data is available before switching views
    if (financials && loanProductDetails?.athenaProduct) {
      setCurrentView('affordability');
      console.log('Switching to affordability view with valid data');
    } else {
      console.warn('Cannot switch to affordability view - missing required data:', {
        hasFinancials: !!financials,
        hasLoanProductDetails: !!loanProductDetails,
        hasAthenaProduct: !!(loanProductDetails?.athenaProduct)
      });
      // Stay in loan options view until data is ready
    }
    
    // Debug logs
    console.log('Financials submitted:', financials);
    console.log('Selected Property:', selectedProperty);
    console.log('Loan Amount:', loanAmount);
    console.log('Loan Product Details:', loanProductDetails);
    console.log('Deposit Details:', depositDetails);
  };

  const handleShowLoanOptions = () => {
    setCurrentView('loanOptions');
  };

  const handleOpenFinancialsModal = () => {
    setShowFinancialsModal(true);
  };

  if (!selectedProperty) {
    return null;
  }

  // Check if we have all the required data for AffordabilityCalculator
  const canShowAffordabilityCalculator = currentView === 'affordability' && 
    !!financials && 
    !!loanProductDetails?.athenaProduct;

  return (
    <Box sx={{ width: '100%' }}>
      {currentView === 'affordability' && (
        <Box sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleShowLoanOptions}
            sx={{ mt: 2 }}
          >
            Back to loan options
          </Button>
        </Box>
      )}

      {currentView === 'loanOptions' ? (
        <LoanOptions onCalculateAffordability={handleCalculateAffordability} />
      ) : canShowAffordabilityCalculator ? (
        <AffordabilityCalculator
          propertyPrice={selectedProperty.valuation.mid}
          savings={depositDetails?.savings || 0}
          propertyState={selectedProperty.address.state}
          propertyPostcode={selectedProperty.address.postcode}
          isInvestmentProperty={loanPurpose === 'INVESTMENT'}
          isFirstHomeBuyer={false}
          baseInterestRate={loanProductDetails.athenaProduct!.interestRate || 5.0}
          requiredLoanAmount={loanAmount?.required || 0}
          financials={financials}
          loanProductDetails={loanProductDetails.athenaProduct!}
          maxBorrowResult={maxBorrowResult || undefined}
          onShowLoanOptions={handleShowLoanOptions}
          onOpenFinancialsModal={handleOpenFinancialsModal}
        />
      ) : (
        <Box sx={{ p: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={32} />
          <Typography variant="body1">
            Loading loan details...
          </Typography>
          <Button 
            variant="outlined" 
            onClick={handleShowLoanOptions}
            sx={{ mt: 2 }}
          >
            Back to loan options
          </Button>
        </Box>
      )}

      <FinancialsModal
        open={showFinancialsModal}
        onClose={() => setShowFinancialsModal(false)}
        onSubmit={handleFinancialsSubmit}
      />

      {maxBorrowResult && (
        <MaxBorrowLogs maxBorrowResult={maxBorrowResult} />
      )}
    </Box>
  );
}; 