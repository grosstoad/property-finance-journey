import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  styled,
  Switch,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  Grid,
  Stack,
  InputAdornment
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { CurrencyTextField } from './CurrencyTextField';
import { formatCurrency } from '../logic/formatters';
import { useProperty } from '../contexts/PropertyContext';
import { useLoan } from '../contexts/LoanContext';
import { LoanPurpose } from '../types/loan';
import { calculateLoanDeposit, calculateLoanAmount } from '../logic/loanService';
import { DEFAULT_SAVINGS_PERCENTAGE, INPUT_DEBOUNCE_TIME } from '../constants/defaultValues';
import { calculateStampDuty } from '../logic/stampDutyCalculator';
import { AustralianState } from '../types/stampDuty';
import { depositService } from '../logic/depositService';

// Types
interface PurchaseCostsProps {
  onCostsChange?: (costs: {
    propertyPrice: number;
    savingsToContribute: number;
    isFirstTimeBuyer: boolean;
    propertyType: 'live-in' | 'investment';
  }) => void;
}

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  padding: theme.spacing(2, 4),
  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5, 3),
  }
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  width: '100%',
  backgroundColor: theme.palette.grey[100],
  borderRadius: 16,
  '& .MuiToggleButton-root': {
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    borderRadius: 16,
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 500,
    color: theme.palette.text.primary,
    '&.Mui-selected': {
      backgroundColor: '#7200CB',
      color: '#fff',
      '&:hover': {
        backgroundColor: '#6000A8',
      },
    },
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
}));

const ProgressBar = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 8,
  backgroundColor: '#F1E8FF',
  borderRadius: 4,
  position: 'relative',
  overflow: 'hidden',
}));

const ProgressFill = styled(Box)<{ width: number }>(({ theme, width }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  width: `${width}%`,
  backgroundColor: '#350736',
  borderRadius: 4,
}));

// Component
export const PurchaseCosts: React.FC<PurchaseCostsProps> = ({ onCostsChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Get context hooks
  const { selectedProperty, updateSavings, depositDetails } = useProperty();
  const { 
    loanPurpose, setLoanPurpose,
    isFirstHomeBuyer, setIsFirstHomeBuyer,
    loanDeposit, setLoanDeposit,
    loanAmount, setLoanAmount
  } = useLoan();
  
  // State
  const [propertyPrice, setPropertyPrice] = useState(() => {
    return selectedProperty?.valuation?.mid || 1200000;
  });
  const [savingsToContribute, setSavingsToContribute] = useState(() => {
    return depositDetails?.savings || 400000;
  });
  
  // State flags to track manual input
  const [propertyPriceManuallySet, setPropertyPriceManuallySet] = useState(false);
  const [savingsManuallySet, setSavingsManuallySet] = useState(false);
  
  // Debounced values
  const [debouncedPropertyPrice, setDebouncedPropertyPrice] = useState(propertyPrice);
  const [debouncedSavings, setDebouncedSavings] = useState(savingsToContribute);

  // Initialize/Update from selected property when it changes, respecting manual overrides
  useEffect(() => {
    if (selectedProperty) {
      if (selectedProperty.valuation) {
        const valuation = selectedProperty.valuation.mid;
        // Only update property price if not manually set
        if (!propertyPriceManuallySet) {
          setPropertyPrice(valuation);
          setDebouncedPropertyPrice(valuation);
        }
      }

      // Only update savings if not manually set
      if (!savingsManuallySet) {
        if (depositDetails?.savings) {
          // If context has savings, use that
          setSavingsToContribute(depositDetails.savings);
          setDebouncedSavings(depositDetails.savings);
        } else if (selectedProperty.valuation) {
          // If no context savings but valuation exists, calculate default %
          const defaultSavings = Math.round(selectedProperty.valuation.mid * (DEFAULT_SAVINGS_PERCENTAGE / 100));
          setSavingsToContribute(defaultSavings);
          setDebouncedSavings(defaultSavings);
        } else {
          // Fallback if no context savings and no valuation (should we use the hardcoded default?)
           // Using the state initializer default (400000) implicitly here if neither context nor valuation provides a value.
        }
      }
    }
    // We only want this effect to re-run when the selectedProperty itself changes,
    // not when the manual flags change. The flags control logic *inside* the effect.
  }, [selectedProperty]);
  
  // Debounce property price changes
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedPropertyPrice(propertyPrice);
    }, INPUT_DEBOUNCE_TIME);
    
    return () => {
      clearTimeout(timerId);
    };
  }, [propertyPrice]);
  
  // Debounce savings changes and sync to context
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSavings(savingsToContribute);
      // Update PropertyContext only if the value was manually changed
      if (savingsManuallySet) {
          updateSavings(savingsToContribute);
          console.log('Syncing manually set savings value to PropertyContext:', savingsToContribute);
      }
    }, INPUT_DEBOUNCE_TIME);
    
    return () => {
      clearTimeout(timerId);
    };
  }, [savingsToContribute, updateSavings, savingsManuallySet]);
  
  // Calculate loan amount when debounced inputs change
  useEffect(() => {
    // Ensure we have a property context before calculating
    const state = selectedProperty?.address?.state as AustralianState | undefined ?? 'NSW';
    const postcode = selectedProperty?.address?.postcode ?? '2000';
    
    // Calculate deposit
    const deposit = calculateLoanDeposit(
      debouncedPropertyPrice,
      debouncedSavings,
      state,
      loanPurpose,
      isFirstHomeBuyer
    );
    
    setLoanDeposit(deposit);
    
    // Calculate loan amount
    const amount = calculateLoanAmount(
      debouncedPropertyPrice,
      debouncedSavings,
      state,
      loanPurpose,
      isFirstHomeBuyer,
      postcode
    );
    
    setLoanAmount(amount);
    // Removed selectedProperty from dependencies as state/postcode are derived and handled
  }, [debouncedPropertyPrice, debouncedSavings, loanPurpose, isFirstHomeBuyer, setLoanDeposit, setLoanAmount]);

  // Convert between our UI representation and context representation
  const propertyType: 'live-in' | 'investment' = loanPurpose === 'OWNER_OCCUPIED' ? 'live-in' : 'investment';
  
  // For the component's internal state
  const handlePropertyTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: 'live-in' | 'investment' | null
  ) => {
    if (newValue !== null) {
      // Update local state
      // Convert to LoanContext format
      setLoanPurpose(newValue === 'live-in' ? 'OWNER_OCCUPIED' : 'INVESTMENT');
      
      if (newValue === 'investment') {
        setIsFirstHomeBuyer(false);
      }
    }
  };
  
  // Calculate costs for display
  const costs = {
    deposit: loanDeposit?.availableForDeposit ?? savingsToContribute,
    stampDuty: loanDeposit?.stampDuty ?? 
      calculateStampDuty({
        propertyPrice: debouncedPropertyPrice,
        state: selectedProperty?.address?.state as AustralianState ?? 'NSW',
        purpose: propertyType === 'live-in' ? 'owner-occupied' : 'investment',
        firstHomeBuyer: isFirstHomeBuyer
      }).stampDuty,
    otherCosts: loanDeposit?.upfrontCosts ?? depositService.calculateUpfrontCosts(debouncedPropertyPrice),
    loanAmount: loanAmount?.required ?? Math.max(0, debouncedPropertyPrice - savingsToContribute),
    lvr: loanAmount?.lvr ?? (debouncedPropertyPrice > 0 ? (Math.max(0, debouncedPropertyPrice - savingsToContribute) / debouncedPropertyPrice * 100) : 0)
  };

  // Notify parent component of changes - Use debounced values for consistency
  useEffect(() => {
    if (onCostsChange) {
      console.log('[PurchaseCosts] Calling onCostsChange with:', {
        propertyPrice: debouncedPropertyPrice,
        savingsToContribute: debouncedSavings,
        isFirstTimeBuyer: isFirstHomeBuyer,
        propertyType
      });
      onCostsChange({
        propertyPrice: debouncedPropertyPrice,
        savingsToContribute: debouncedSavings,
        isFirstTimeBuyer: isFirstHomeBuyer,
        propertyType,
      });
    }
  }, [debouncedPropertyPrice, debouncedSavings, isFirstHomeBuyer, propertyType, onCostsChange]);

  return (
    <StyledCard>
      <Box sx={{ width: '100%' }}>
        <Typography
          variant="h5"
          component="h2"
          fontWeight={700}
          gutterBottom
          sx={{ mb: 3 }}
        >
          Purchase costs & savings
        </Typography>

        <StyledToggleButtonGroup
          value={propertyType}
          exclusive
          onChange={handlePropertyTypeChange}
          aria-label="property type"
          sx={{ mb: 3 }}
        >
          <ToggleButton value="live-in">To live in</ToggleButton>
          <ToggleButton value="investment">As an investment</ToggleButton>
        </StyledToggleButtonGroup>

        {propertyType === 'live-in' && (
          <Grid container alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={8} sm={9}>
              <Typography variant="body1" fontWeight={500}>
                First time home buyer
              </Typography>
            </Grid>
            <Grid item xs={4} sm={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Switch
                checked={isFirstHomeBuyer}
                onChange={(e) => setIsFirstHomeBuyer(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#7200CB',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#7200CB',
                  },
                }}
              />
            </Grid>
          </Grid>
        )}

        <Grid container alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={6} sm={7}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" fontWeight={500} mr={0.5}>
                Estimated property price
              </Typography>
              <IconButton size="small" color="inherit" sx={{ p: 0.5 }}>
                <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={6} sm={5} sx={{ display: 'flex', justifyContent: 'flex-end', pr: 1 }}>
            <CurrencyTextField
              value={propertyPrice}
              onChange={(e) => {
                 setPropertyPrice(Number(e.target.value));
                 setPropertyPriceManuallySet(true);
               }}
              variant="outlined"
              size="small"
              sx={{
                width: '100%',
                maxWidth: { xs: '110px', sm: '140px' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                },
              }}
              InputProps={{
                sx: {
                  borderColor: '#7200CB',
                  '&:hover': {
                    borderColor: '#6000A8',
                  },
                },
                startAdornment: <InputAdornment position="start"></InputAdornment>,
              }}
            />
          </Grid>
        </Grid>

        <Grid container alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={6} sm={7}>
            <Typography variant="body1" fontWeight={500}>
              Savings I have to contribute
            </Typography>
          </Grid>
          <Grid item xs={6} sm={5} sx={{ display: 'flex', justifyContent: 'flex-end', pr: 1 }}>
            <CurrencyTextField
              value={savingsToContribute}
               onChange={(e) => {
                 setSavingsToContribute(Number(e.target.value));
                 setSavingsManuallySet(true);
               }}
              variant="outlined"
              size="small"
              sx={{
                width: '100%',
                maxWidth: { xs: '110px', sm: '140px' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                },
              }}
              InputProps={{
                sx: {
                  borderColor: '#7200CB',
                  '&:hover': {
                    borderColor: '#6000A8',
                  },
                },
                startAdornment: <InputAdornment position="start"></InputAdornment>,
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ my: 1.5 }}>
          <Grid container sx={{ mb: 1 }}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Deposit
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', pr: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {formatCurrency(costs.deposit)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Grid container sx={{ mb: 1 }}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Stamp duty
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', pr: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {formatCurrency(costs.stampDuty)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Other costs
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', pr: 1 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {formatCurrency(costs.otherCosts)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mt: 2 }}>
          <Grid container alignItems="center">
            <Grid item xs={6}>
              <Typography variant="body1" fontWeight={700}>
                Loan amount required
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', pr: 1 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#1A1A1A' }}>
                  {formatCurrency(costs.loanAmount)}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 1 }}>
            <ProgressBar>
              <ProgressFill width={Math.min(costs.lvr, 100)} />
            </ProgressBar>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
              <Typography variant="body2" fontWeight={500} color="text.secondary">
                {Math.round(costs.lvr)}% of the property value (LVR)
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </StyledCard>
  );
}; 