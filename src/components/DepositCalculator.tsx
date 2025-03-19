import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Switch, 
  FormControlLabel, 
  Grid, 
  Paper, 
  Divider 
} from '@mui/material';
import { calculateDeposit } from '../logic/depositService';
import { calculateLoanAmountRequired } from '../logic/depositService';
import { LoanPurpose } from '../types/loan';
import { AustralianState } from '../types/stampDuty';
import { INPUT_DEBOUNCE_TIME } from '../constants/defaultValues';
import { formatCurrency } from '../logic/formatters';

/**
 * Deposit Calculator Component
 * 
 * Demonstrates the usage of the deposit service and stamp duty calculator
 * in a UI component, with proper input handling and error states.
 */
export const DepositCalculator: React.FC = () => {
  // Input states
  const [propertyPrice, setPropertyPrice] = useState<number>(750000);
  const [savings, setSavings] = useState<number>(200000);
  const [state, setState] = useState<AustralianState>('NSW');
  const [purpose, setPurpose] = useState<LoanPurpose>('OWNER_OCCUPIED');
  const [firstHomeBuyer, setFirstHomeBuyer] = useState<boolean>(false);
  
  // Result states
  const [stampDuty, setStampDuty] = useState<number>(0);
  const [upfrontCosts, setUpfrontCosts] = useState<number>(0);
  const [availableForDeposit, setAvailableForDeposit] = useState<number>(0);
  const [loanRequired, setLoanRequired] = useState<number>(0);
  const [lvr, setLvr] = useState<number>(0);
  
  // Error states
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Calculate deposit and loan results when inputs change
  useEffect(() => {
    // Add delay to prevent calculation on every keystroke
    const timer = setTimeout(() => {
      try {
        // Check for valid inputs
        if (propertyPrice < 0) {
          setErrors(prev => ({ ...prev, propertyPrice: 'Property price cannot be negative' }));
          return;
        }
        
        if (savings < 0) {
          setErrors(prev => ({ ...prev, savings: 'Savings cannot be negative' }));
          return;
        }
        
        // Clear previous errors
        setErrors({});
        
        // Calculate deposit
        const depositResult = calculateDeposit({
          propertyPrice,
          savings,
          state,
          purpose,
          firstHomeBuyer
        });
        
        // Calculate loan amount
        const loanResult = calculateLoanAmountRequired({
          propertyPrice,
          availableForDeposit: depositResult.availableForDeposit
        });
        
        // Update result states
        setStampDuty(depositResult.stampDuty);
        setUpfrontCosts(depositResult.upfrontCosts);
        setAvailableForDeposit(depositResult.availableForDeposit);
        setLoanRequired(loanResult.required);
        setLvr(loanResult.lvr);
      } catch (error) {
        if (error instanceof Error) {
          setErrors(prev => ({ ...prev, calculation: error.message }));
        }
      }
    }, INPUT_DEBOUNCE_TIME);
    
    return () => clearTimeout(timer);
  }, [propertyPrice, savings, state, purpose, firstHomeBuyer]);
  
  // Input handlers
  const handlePropertyPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setPropertyPrice(isNaN(value) ? 0 : value);
  };
  
  const handleSavingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSavings(isNaN(value) ? 0 : value);
  };
  
  const handleStateChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setState(e.target.value as AustralianState);
  };
  
  const handlePurposeChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setPurpose(e.target.value as LoanPurpose);
  };
  
  const handleFirstHomeBuyerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFirstHomeBuyer(e.target.checked);
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>Property Deposit Calculator</Typography>
      
      <Grid container spacing={3}>
        {/* Left column - Inputs */}
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Property Details</Typography>
            
            <TextField
              fullWidth
              label="Property Price"
              type="number"
              value={propertyPrice}
              onChange={handlePropertyPriceChange}
              error={!!errors.propertyPrice}
              helperText={errors.propertyPrice}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Savings"
              type="number"
              value={savings}
              onChange={handleSavingsChange}
              error={!!errors.savings}
              helperText={errors.savings}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>State</InputLabel>
              <Select
                value={state}
                onChange={handleStateChange}
                label="State"
              >
                <MenuItem value="NSW">New South Wales</MenuItem>
                <MenuItem value="VIC">Victoria</MenuItem>
                <MenuItem value="QLD">Queensland</MenuItem>
                <MenuItem value="WA">Western Australia</MenuItem>
                <MenuItem value="SA">South Australia</MenuItem>
                <MenuItem value="TAS">Tasmania</MenuItem>
                <MenuItem value="ACT">Australian Capital Territory</MenuItem>
                <MenuItem value="NT">Northern Territory</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Purpose</InputLabel>
              <Select
                value={purpose}
                onChange={handlePurposeChange}
                label="Purpose"
              >
                <MenuItem value="OWNER_OCCUPIED">Owner Occupied</MenuItem>
                <MenuItem value="INVESTMENT">Investment</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={firstHomeBuyer} 
                  onChange={handleFirstHomeBuyerChange}
                />
              }
              label="First Home Buyer"
              sx={{ mb: 2 }}
            />
          </Box>
        </Grid>
        
        {/* Right column - Results */}
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Calculation Results</Typography>
            
            {errors.calculation ? (
              <Typography color="error">{errors.calculation}</Typography>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Property Price:</Typography>
                  <Typography fontWeight="bold">{formatCurrency(propertyPrice)}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Stamp Duty:</Typography>
                  <Typography>{formatCurrency(stampDuty)}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Upfront Costs:</Typography>
                  <Typography>{formatCurrency(upfrontCosts)}</Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Available for Deposit:</Typography>
                  <Typography fontWeight="bold">{formatCurrency(availableForDeposit)}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Loan Required:</Typography>
                  <Typography fontWeight="bold">{formatCurrency(loanRequired)}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Loan-to-Value Ratio (LVR):</Typography>
                  <Typography fontWeight="bold">{lvr.toFixed(1)}%</Typography>
                </Box>
                
                {lvr > 80 && (
                  <Typography color="warning.main" sx={{ mt: 2 }}>
                    LVR exceeds 80% - Lender's Mortgage Insurance (LMI) may apply
                  </Typography>
                )}
              </>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}; 