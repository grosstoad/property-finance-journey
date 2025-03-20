import { Box, Button } from '@mui/material';
import { useState } from 'react';
import { useFinancials } from '../../contexts/FinancialsContext';
import { useProperty } from '../../contexts/PropertyContext';
import { useLoan } from '../../contexts/LoanContext';
import { LoanOptions } from '../LoanOptions';
import { FinancialsModal } from '../FinancialsModal';
import { AffordabilityCalculator } from '../AffordabilityCalculator';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLoanProducts } from '../../hooks/useLoanProducts';

export const PropertyFinanceJourney = () => {
  const [showFinancialsModal, setShowFinancialsModal] = useState(false);
  const [currentView, setCurrentView] = useState<'loanOptions' | 'affordability'>('loanOptions');
  
  const { selectedProperty, depositDetails } = useProperty();
  const { financials } = useFinancials();
  const { loanAmount, loanPurpose } = useLoan();
  const { loanProductDetails } = useLoanProducts();

  const handleCalculateAffordability = () => {
    setShowFinancialsModal(true);
  };

  const handleFinancialsSubmit = () => {
    setShowFinancialsModal(false);
    setCurrentView('affordability');
    
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

  if (!selectedProperty) {
    return null;
  }

  return (
    <Box sx={{ maxWidth: 700, margin: '0 auto' }}>
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
      ) : (
        <AffordabilityCalculator
          propertyPrice={selectedProperty.valuation.mid}
          savings={depositDetails?.savings || 0}
          propertyState={selectedProperty.address.state}
          propertyPostcode={selectedProperty.address.postcode}
          isInvestmentProperty={loanPurpose === 'INVESTMENT'}
          isFirstHomeBuyer={false}
          baseInterestRate={loanProductDetails.athenaProduct?.interestRate || 5.0}
          requiredLoanAmount={loanAmount?.required || 0}
          onShowLoanOptions={handleShowLoanOptions}
        />
      )}

      <FinancialsModal
        open={showFinancialsModal}
        onClose={() => setShowFinancialsModal(false)}
        onSubmit={handleFinancialsSubmit}
      />
    </Box>
  );
}; 