import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Typography,
  styled
} from '@mui/material';
import { 
  InterestRateType, 
  LoanFeatureType, 
  LoanPreferences, 
  LoanProductDetails, 
  OwnHomeProductDetails, 
  RepaymentType 
} from '../types/loan';
import { formatCurrency, formatPercentage } from '../logic/formatters';

const ModalContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  '& .MuiFormControl-root': {
    marginBottom: theme.spacing(2),
    width: '100%',
  }
}));

const ProductSummary = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2)
}));

const RadioOptionsContainer = styled(RadioGroup)({
  flexDirection: 'row',
  justifyContent: 'space-between'
});

const SummaryRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1)
}));

const SummaryLabel = styled(Typography)({
  fontWeight: 400,
  fontSize: '0.9rem',
  color: 'text.secondary'
});

const SummaryValue = styled(Typography)({
  fontWeight: 600,
  fontSize: '0.9rem'
});

interface ConfigureLoanModalProps {
  open: boolean;
  onClose: () => void;
  initialPreferences: LoanPreferences;
  onPreferencesChange: (preferences: LoanPreferences) => void;
  productDetails: {
    athenaProduct: LoanProductDetails | null;
    ownHomeProduct?: OwnHomeProductDetails | null;
  };
  isTailored?: boolean;
}

export const ConfigureLoanModal = ({
  open,
  onClose,
  initialPreferences,
  onPreferencesChange,
  productDetails,
  isTailored = false
}: ConfigureLoanModalProps) => {
  const [preferences, setPreferences] = useState<LoanPreferences>(initialPreferences);

  // Reset preferences when modal opens
  useEffect(() => {
    if (open) {
      setPreferences(initialPreferences);
    }
  }, [open, initialPreferences]);

  const handleInterestRateTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const interestRateType = event.target.value as InterestRateType;
    
    // If switching to variable, remove fixed term
    const newPreferences = {
      ...preferences,
      interestRateType,
      fixedTerm: interestRateType === 'FIXED' ? preferences.fixedTerm || 1 : undefined
    };
    setPreferences(newPreferences);
  };

  const handleFixedTermChange = (event: SelectChangeEvent<number>) => {
    setPreferences({
      ...preferences,
      fixedTerm: event.target.value as number
    });
  };

  const handleLoanFeatureTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences({
      ...preferences,
      loanFeatureType: event.target.value as LoanFeatureType
    });
  };

  const handleRepaymentTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const repaymentType = event.target.value as RepaymentType;
    
    // If switching to Principal and Interest, remove interest only term
    const newPreferences = {
      ...preferences,
      repaymentType,
      interestOnlyTerm: repaymentType === 'INTEREST_ONLY' ? preferences.interestOnlyTerm || 1 : undefined
    };
    setPreferences(newPreferences);
  };

  const handleInterestOnlyTermChange = (event: SelectChangeEvent<number>) => {
    setPreferences({
      ...preferences,
      interestOnlyTerm: event.target.value as number
    });
  };

  const handleLoanTermChange = (event: SelectChangeEvent<number>) => {
    setPreferences({
      ...preferences,
      loanTerm: event.target.value as number
    });
  };

  const handleSave = () => {
    onPreferencesChange(preferences);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Configure Loan Preferences</DialogTitle>
      <DialogContent>
        <ModalContainer>
          {productDetails.athenaProduct && (
            <ProductSummary>
              <Typography variant="h6" gutterBottom>
                Product Summary
              </Typography>
              <SummaryRow>
                <SummaryLabel>Product</SummaryLabel>
                <SummaryValue>{productDetails.athenaProduct.productName}</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>Interest Rate</SummaryLabel>
                <SummaryValue>{formatPercentage(productDetails.athenaProduct.interestRate)}</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>Monthly repayments</SummaryLabel>
                <SummaryValue>
                  {formatCurrency(productDetails.athenaProduct.monthlyRepayment)}
                </SummaryValue>
              </SummaryRow>
              {productDetails.athenaProduct.revertingInterestRate && (
                <SummaryRow>
                  <SummaryLabel>Reverting Rate</SummaryLabel>
                  <SummaryValue>
                    {formatPercentage(productDetails.athenaProduct.revertingInterestRate)}
                  </SummaryValue>
                </SummaryRow>
              )}
              {productDetails.athenaProduct.revertingMonthlyRepayment && (
                <SummaryRow>
                  <SummaryLabel>Reverting Monthly repayments</SummaryLabel>
                  <SummaryValue>
                    {formatCurrency(productDetails.athenaProduct.revertingMonthlyRepayment)}
                  </SummaryValue>
                </SummaryRow>
              )}
            </ProductSummary>
          )}

          {!isTailored && (
            <>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">Interest Rate Type</FormLabel>
                <RadioOptionsContainer
                  value={preferences.interestRateType}
                  onChange={handleInterestRateTypeChange}
                >
                  <FormControlLabel 
                    value="VARIABLE" 
                    control={<Radio />} 
                    label="Variable" 
                  />
                  <FormControlLabel 
                    value="FIXED" 
                    control={<Radio />} 
                    label="Fixed" 
                  />
                </RadioOptionsContainer>
              </FormControl>

              {preferences.interestRateType === 'FIXED' && (
                <FormControl fullWidth>
                  <FormLabel>Fixed Term</FormLabel>
                  <Select
                    value={preferences.fixedTerm || 1}
                    onChange={handleFixedTermChange}
                  >
                    <MenuItem value={1}>1 Year</MenuItem>
                    <MenuItem value={2}>2 Years</MenuItem>
                    <MenuItem value={3}>3 Years</MenuItem>
                  </Select>
                </FormControl>
              )}

              {preferences.interestRateType === 'VARIABLE' && (
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">Loan Features</FormLabel>
                  <RadioOptionsContainer
                    value={preferences.loanFeatureType || 'redraw'}
                    onChange={handleLoanFeatureTypeChange}
                  >
                    <FormControlLabel 
                      value="offset" 
                      control={<Radio />} 
                      label="Offset Account" 
                    />
                    <FormControlLabel 
                      value="redraw" 
                      control={<Radio />} 
                      label="Redraw Facility" 
                    />
                  </RadioOptionsContainer>
                </FormControl>
              )}
            </>
          )}

          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">Repayment Type</FormLabel>
            <RadioOptionsContainer
              value={preferences.repaymentType}
              onChange={handleRepaymentTypeChange}
            >
              <FormControlLabel 
                value="PRINCIPAL_AND_INTEREST" 
                control={<Radio />} 
                label="Principal & Interest" 
              />
              <FormControlLabel 
                value="INTEREST_ONLY" 
                control={<Radio />} 
                label="Interest Only" 
              />
            </RadioOptionsContainer>
          </FormControl>

          {preferences.repaymentType === 'INTEREST_ONLY' && (
            <FormControl fullWidth>
              <FormLabel>Interest Only Term</FormLabel>
              <Select
                value={preferences.interestOnlyTerm || 1}
                onChange={handleInterestOnlyTermChange}
              >
                <MenuItem value={1}>1 Year</MenuItem>
                <MenuItem value={2}>2 Years</MenuItem>
                <MenuItem value={3}>3 Years</MenuItem>
                <MenuItem value={4}>4 Years</MenuItem>
                <MenuItem value={5}>5 Years</MenuItem>
              </Select>
            </FormControl>
          )}

          <FormControl fullWidth>
            <FormLabel>Loan Term</FormLabel>
            <Select
              value={preferences.loanTerm}
              onChange={handleLoanTermChange}
            >
              {[10, 15, 20, 25, 30].map((years) => (
                <MenuItem key={years} value={years}>
                  {years} Years
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </ModalContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 