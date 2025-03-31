import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Card, 
  Box, 
  Typography, 
  TextField, 
  Slider, 
  useMediaQuery, 
  alpha,
  styled, 
  useTheme,
  Stack,
  Alert
} from '@mui/material';
import { SimplifiedAnimatedNumber } from '../components/AffordabilityCalculator/SimplifiedAnimatedNumber';
import { formatCurrency } from '../logic/formatters';
import { depositService } from '../logic/depositService';
import { calculateStampDuty } from '../logic/stampDutyCalculator';
import { AustralianState } from '../types/stampDuty';
import { calculateLoanDeposit, calculateLoanAmount } from '../logic/loanService';
import { LoanPurpose } from '../types/loan';

// Card container with shadow - Reduced padding
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  padding: theme.spacing(3, 3), // Reduced padding
  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 2), // Reduced padding for mobile
  }
}));

// Progress bar component for the horizontal bars
const ProgressBar = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'width' && prop !== 'color'
})<{ width: number; color: string }>(({ width, color, theme }) => ({
  height: '32px',
  background: color,
  borderRadius: '8px 0 0 8px',
  transition: 'width 0.5s ease-in-out',
  width: `${width}%`,
  maxWidth: '75%', // Prevent overlap with text
  position: 'absolute',
  left: 0,
  zIndex: 0,
}));

// Interface for the component props
interface AffordabilityCard_2Props {
  initialPropertyValue?: number;
  minPropertyValue?: number;
  maxPropertyValue?: number;
  savings?: number;
  onChange?: (propertyValue: number) => void;
  propertyState?: string;
  isFirstHomeBuyer?: boolean;
  isInvestmentProperty?: boolean;
  maxBorrowingPower?: number;
  requiredLoanAmount?: number;
  desiredPropertyValue?: number;
  maxAffordablePropertyValue?: number;

  // Calculated values passed for display
  loanAmount?: number;
  deposit?: number;
  stampDuty?: number;
  upfrontCosts?: number;
  lvr?: number;
}

export function AffordabilityCard_2({
  initialPropertyValue: initialPropertyValueProp = 1960000,
  minPropertyValue = 1000000,
  maxPropertyValue = 3000000,
  savings = 800000,
  onChange,
  propertyState = 'NSW',
  isFirstHomeBuyer = false,
  isInvestmentProperty = false,
  maxBorrowingPower,
  requiredLoanAmount,
  desiredPropertyValue,
  maxAffordablePropertyValue,
  // Destructure calculated display props
  loanAmount: loanAmountProp,
  deposit: depositProp,
  stampDuty: stampDutyProp,
  upfrontCosts: upfrontCostsProp,
  lvr: lvrProp
}: AffordabilityCard_2Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Use props or provide defaults internally
  const initialPropertyValue = initialPropertyValueProp;
  
  // Determine affordability status
  const isAffordable = useMemo(() => {
    // Ensure both values are valid numbers before comparing
    if (typeof maxBorrowingPower === 'number' && typeof requiredLoanAmount === 'number') {
      return maxBorrowingPower >= requiredLoanAmount;
    }
    return false; // Default to false if values are not valid
  }, [maxBorrowingPower, requiredLoanAmount]);
  
  // State for the property value
  const [propertyValue, setPropertyValue] = useState(initialPropertyValue);
  const [inputValue, setInputValue] = useState(formatCurrency(initialPropertyValue));
  
  // Ref to ensure initialization effect runs only once
  const didInit = useRef(false);

  // Apply constraints on initial render
  useEffect(() => {
    // Prevent re-running after initial mount
    if (didInit.current) return;
    didInit.current = true; 

    console.log('[INIT] Initializing with constraints:', {
      initialPropertyValue,
      requiredLoanAmount,
      maxBorrowingPower,
      minPropertyValue,
      maxPropertyValue
    });
    
    // Start with initial property value from props
    let startPropertyValue = initialPropertyValue;
    let startLoanAmount = loanAmountProp ?? 0; // Use the pre-calculated initial loan amount

    // If the initial loan amount was set based on maxBorrowingPower, ensure property value aligns
    if (!isAffordable && maxBorrowingPower && maxBorrowingPower > 0) {
      console.log('[INIT] Scenario is unaffordable, ensuring initial state aligns with maxBorrowingPower.');
      startLoanAmount = maxBorrowingPower;
      
      // Calculate the deposit needed for this max loan
      const loanPurpose: LoanPurpose = isInvestmentProperty ? 'INVESTMENT' : 'OWNER_OCCUPIED';
      const depositComponents = calculateLoanDeposit(
        startPropertyValue, // Use initial property value as a starting point
        savings,
        propertyState,
        loanPurpose,
        isFirstHomeBuyer
      );
      const costs = depositComponents.stampDuty + depositComponents.upfrontCosts;
      const availableForDeposit = Math.max(0, savings - costs);
      
      // Recalculate the property value based on the max loan and available deposit
      startPropertyValue = maxBorrowingPower + availableForDeposit;
      console.log(`[INIT] Adjusted initial property value to ${formatCurrency(startPropertyValue)}`);
    } 

    // Calculate derived values immediately
    setPropertyValue(startPropertyValue);
    setInputValue(formatCurrency(startPropertyValue));
    // The initial loan amount is already set correctly by useState initializer or the logic above
    // setLoanAmount(startLoanAmount); 
    
    console.log(`[INIT] Initialization complete with property value: ${formatCurrency(startPropertyValue)} and loan amount: ${formatCurrency(startLoanAmount)}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPropertyValue, minPropertyValue, maxPropertyValue, maxBorrowingPower, requiredLoanAmount]); // Keep dependencies for ESLint but effect guards itself
  
  // Calculate bar widths as percentage of property value
  const barWidths = useMemo(() => {
    const currentDisplayPropValue = propertyValue;
    if (!currentDisplayPropValue || currentDisplayPropValue <= 0) return {
      loanAmount: 0,
      deposit: 0,
      stampDuty: 0,
      upfrontCosts: 0
    };
    
    const calculateWidth = (amount: number) => {
      const percentage = (amount / currentDisplayPropValue) * 100;
      return Math.min(Math.max(percentage, 1), 100);
    };
    
    return {
      loanAmount: calculateWidth(loanAmountProp ?? 0),
      deposit: calculateWidth(depositProp ?? 0),
      stampDuty: calculateWidth(stampDutyProp ?? 0),
      upfrontCosts: calculateWidth(upfrontCostsProp ?? 0)
    };
  }, [propertyValue, loanAmountProp, depositProp, stampDutyProp, upfrontCostsProp]);

  // Handle slider change - immediately update UI and notify parent
  const handleSliderChange = (
    _event: React.SyntheticEvent | Event,
    newValue: number | number[]
  ) => {
    try {
      const value = newValue as number;
      
      // Skip if unchanged or out of bounds
      if (value === propertyValue || value < minPropertyValue || value > maxPropertyValue) {
        return;
      }
      
      // Update local state immediately for responsive UI (text input)
      setPropertyValue(value);
      setInputValue(formatCurrency(value));

      // Notify parent of the change immediately
      if (onChange) {
        // Log only significant changes (every $50k) to reduce console noise
        if (Math.abs(value - propertyValue) >= 50000) { // Check against previous propertyValue state for logging
          console.log(`[SLIDER] Notifying parent of value change: ${formatCurrency(value)}`);
        }
        onChange(value);
      }
    } catch (error) {
      console.error("Error handling slider change:", error);
    }
  };
  
  // Handle slider change completion - ensures final value is set, potentially redundant
  const handleSliderChangeEnd = (
    _event: React.SyntheticEvent | Event,
    newValue: number | number[]
  ) => {
    try {
      const value = newValue as number;
      
      // Only notify parent if value is valid and slider has been released
      if (value >= minPropertyValue && value <= maxPropertyValue) {
        // Notify parent of the selected property value only when slider interaction ends
        if (onChange) {
          console.log(`[SLIDER_END] Notifying parent of final property value: ${formatCurrency(value)}`);
          onChange(value);
        }
      }
    } catch (error) {
      console.error("Error handling slider change end:", error);
    }
  };

  // Handle text input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    
    // Parse the currency string to a number
    const numericValue = Number(value.replace(/[^0-9.-]+/g, ''));
    if (!isNaN(numericValue)) {
      // Keep value within min and max range
      const constrainedValue = Math.min(Math.max(numericValue, minPropertyValue), maxPropertyValue);
      setPropertyValue(constrainedValue);
    }
  };

  // Handle text input blur to format the value and notify parent
  const handleInputBlur = () => {
    const numericValue = Number(inputValue.replace(/[^0-9.-]+/g, ''));
    let finalValue = propertyValue; // Default to current state

    if (!isNaN(numericValue)) {
      // Ensure the final value is constrained
      finalValue = Math.min(Math.max(numericValue, minPropertyValue), maxPropertyValue);
    }
    
    // Format the constrained value for display
    setInputValue(formatCurrency(finalValue));
    setPropertyValue(finalValue); // Update internal state to match formatted value
    
    // Notify parent of the final validated value
    if (onChange) {
      console.log(`[InputBlur] Notifying parent of final property value: ${formatCurrency(finalValue)}`);
      onChange(finalValue);
    }
  };

  // Update input when the initial prop changes (e.g., due to parent recalculation)
  useEffect(() => {
    setPropertyValue(initialPropertyValue);
    setInputValue(formatCurrency(initialPropertyValue));
  }, [initialPropertyValue]);

  return (
    <StyledCard>
      {/* Title */}
      <Box sx={{ mb: 3 }}> {/* Reduced margin */}
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Affordability
        </Typography>
        
        {/* Dynamic Affordability Message Box */}
        <Box 
          sx={{ 
            p: 1.5, 
            border: isAffordable ? '1px solid #2E7D32' : '1px solid #D32F2F', // Dynamic border
            borderRadius: 1,
            bgcolor: isAffordable ? alpha('#2E7D32', 0.05) : alpha('#D32F2F', 0.05), // Dynamic background
            color: isAffordable ? '#1E4620' : '#D32F2F', // Dynamic text color
            mt: 1.5 /* Reduced margin */
          }}
        >
          <Typography variant="body2">
            {isAffordable 
              ? `You can likely borrow enough for this property value. The maximum you could potentially borrow for a property is ${formatCurrency(maxPropertyValue)}.`
              : `Your maximum borrowing power of ${formatCurrency(maxBorrowingPower || 0)} is less than the required loan amount of ${formatCurrency(requiredLoanAmount || 0)} for your estimated property price of ${formatCurrency(desiredPropertyValue || 0)}. The maximum property value you can afford is ${formatCurrency(maxAffordablePropertyValue || 0)}.`
            }
          </Typography>
        </Box>
      </Box>

      {/* Property value input and slider */}
      <Box sx={{ mb: 3 }}> {/* Reduced margin */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          mb: 1
        }}>
          <Stack>
            <Typography variant="subtitle1" fontWeight={500}>
              Your selected property price
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              {Math.round(lvrProp || 0)}% LVR
            </Typography>
          </Stack>
          <TextField
            variant="outlined"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            size="small"
            sx={{ 
              width: { xs: '120px', sm: '160px' },
              '& .MuiOutlinedInput-root': {
                '& input': {
                  textAlign: 'right',
                  fontWeight: 500
                }
              }
            }}
          />
        </Box>

        <Slider
          value={propertyValue}
          onChange={handleSliderChange}
          // onChangeCommitted={handleSliderChangeEnd} // Keep or remove onChangeCommitted based on need
          min={minPropertyValue}
          max={maxPropertyValue}
          step={10000}
          sx={{
            color: '#9C27B0',
            height: 8,
            '& .MuiSlider-rail': {
              opacity: 0.38,
              height: 8,
            },
            '& .MuiSlider-track': {
              height: 8,
            },
            '& .MuiSlider-thumb': {
              height: 24,
              width: 24,
              backgroundColor: '#9C27B0',
              '&:focus, &:hover, &.Mui-active': {
                boxShadow: '0 0 0 8px rgba(156, 39, 176, 0.16)',
              },
            },
          }}
        />
        
        {/* Min/Max labels repositioned to match financial values alignment */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          mt: 0.5,
          width: '100%',
        }}>
          <Box sx={{ width: '50%' }}>
            <Stack alignItems="flex-start">
              <Typography variant="caption" fontWeight={500}>
                {formatCurrency(minPropertyValue)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Min
              </Typography>
            </Stack>
          </Box>
          <Box sx={{ width: '50%', display: 'flex', justifyContent: 'flex-end', pr: 1 }}>
            <Stack alignItems="flex-end">
              <Typography variant="caption" fontWeight={500}>
                {formatCurrency(maxPropertyValue)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Max
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Financial breakdown with bars */}
      <Box sx={{ mt: 2, mb: 1, width: '100%' }}> {/* Added width 100% */}
        {/* Loan amount */}
        <Box sx={{ 
          position: 'relative', 
          height: 32, 
          mb: 2, /* Reduced margin */
          display: 'flex',
          alignItems: 'center',
          width: '100%' /* Ensure full width */
        }}>
          <ProgressBar width={barWidths.loanAmount} color="#00E3B9" />
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-end',
              pr: 1
            }}
          >
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.1 }}>
                <SimplifiedAnimatedNumber value={loanAmountProp ?? 0} />
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Your loan amount
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Deposit */}
        <Box sx={{ 
          position: 'relative', 
          height: 32, 
          mb: 2, /* Reduced margin */
          display: 'flex', 
          alignItems: 'center',
          width: '100%' /* Ensure full width */
        }}>
          <ProgressBar width={barWidths.deposit} color="#0975E0" />
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-end',
              pr: 1
            }}
          >
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.1 }}>
                <SimplifiedAnimatedNumber value={depositProp ?? 0} />
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Your deposit
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Stamp duty */}
        <Box sx={{ 
          position: 'relative', 
          height: 32, 
          mb: 2, /* Reduced margin */
          display: 'flex', 
          alignItems: 'center' 
        }}>
          <ProgressBar width={barWidths.stampDuty} color="#7200CB" />
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-end',
              pr: 1
            }}
          >
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.1 }}>
                <SimplifiedAnimatedNumber value={stampDutyProp ?? 0} />
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Stamp duty
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Upfront costs */}
        <Box sx={{ 
          position: 'relative', 
          height: 32,
          display: 'flex', 
          alignItems: 'center' 
        }}>
          <ProgressBar width={barWidths.upfrontCosts} color="#E4002B" />
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-end',
              pr: 1
            }}
          >
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.1 }}>
                <SimplifiedAnimatedNumber value={upfrontCostsProp ?? 0} />
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Upfront costs
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Savings note */}
      <Box sx={{ mt: 2, pt: 1 }}> {/* Reduced margins */}
        <Typography variant="caption" fontWeight={500}>
          Note: this uses your full savings of {formatCurrency(savings)}
        </Typography>
      </Box>
    </StyledCard>
  );
} 