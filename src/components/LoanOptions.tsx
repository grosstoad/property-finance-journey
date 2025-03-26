import { 
  Box, 
  Typography, 
  Paper, 
  styled, 
  ToggleButtonGroup,
  ToggleButton,
  Switch, 
  Grid, 
  Divider,
  Collapse,
  IconButton,
  Button,
  useTheme,
  useMediaQuery,
  InputAdornment,
  LinearProgress
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SettingsIcon from '@mui/icons-material/Settings';
import { useState, useEffect } from 'react';
import { CurrencyInput } from './CurrencyInput';
import { CurrencyTextField } from './CurrencyTextField';
import { useLoan } from '../contexts/LoanContext';
import { useProperty } from '../contexts/PropertyContext';
import { calculateLoanDeposit, calculateLoanAmount } from '../logic/loanService';
import { formatCurrency } from '../logic/formatters';
import { LoanPurpose } from '../types/loan';
import { 
  DEFAULT_SAVINGS_PERCENTAGE, 
  INPUT_DEBOUNCE_TIME 
} from '../constants/defaultValues';
import { LoanProductCard, OwnHomeLoanProductCard } from './LoanProductCard';
import { ConfigureLoanModal } from './ConfigureLoanModal';
import { useLoanProducts } from '../hooks';
import { ATHENA_LOGO_URL, OWNHOME_LOGO_URL } from '../constants/urls';

const Container = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  maxWidth: 800,
  marginLeft: 'auto',
  marginRight: 'auto',
  [theme.breakpoints.down('md')]: {
    maxWidth: '100%',
    margin: theme.spacing(3, 2)
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.5rem'
  }
}));

const CardContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#ffffff'
}));

const SectionHeading = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.1rem'
  }
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(2),
  '& .MuiToggleButtonGroup-grouped': {
    margin: 0,
    border: 0,
    '&:not(:first-of-type)': {
      borderRadius: 24,
    },
    '&:first-of-type': {
      borderRadius: 24,
    },
  },
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  backgroundColor: '#f5f5f5',
  color: theme.palette.text.primary,
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  '&:hover': {
    backgroundColor: '#e0e0e0',
  },
  flex: 1,
  padding: theme.spacing(1, 2),
  fontWeight: 500,
}));

const SwitchLabel = styled(Typography)({
  fontSize: '0.9rem',
  fontWeight: 500,
});

const FormRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5),
}));

const InputLabel = styled(Typography)({
  fontSize: '0.9rem',
  fontWeight: 500,
});

const ValueDisplay = styled(Typography)({
  fontSize: '1rem',
  fontWeight: 600,
  textAlign: 'right',
});

const ExpandButton = styled(IconButton)({
  padding: 0,
  marginLeft: 8,
});

const SubLabel = styled(Typography)({
  fontSize: '0.8rem',
  color: '#666',
});

const SubValue = styled(Typography)({
  fontSize: '0.8rem',
  color: '#666',
  textAlign: 'right',
});

const ResultRow = styled(FormRow)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
}));

const ResultLabel = styled(Typography)({
  fontSize: '1rem',
  fontWeight: 600,
});

const ResultValue = styled(Typography)({
  fontSize: '1.25rem',
  fontWeight: 700,
  textAlign: 'right',
});

const InputContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 180,
  textAlign: 'right',
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100%',
  },
}));

const LoanProductsContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const ProductHeadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5)
}));

const ProductTitle = styled(Typography)({
  fontSize: '1.1rem',
  fontWeight: 600
});

const ConfigureButton = styled(Button)({
  whiteSpace: 'nowrap'
});

// New styled components for LVR visualization
const LvrProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: '#E8E0F7',
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    backgroundColor: theme.palette.primary.main,
  },
  marginBottom: theme.spacing(0.5),
}));

const LvrLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  textAlign: 'right',
}));

// New styled components for deposit section
const DepositHeading = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  fontWeight: 600,
}));

const DepositValue = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 700,
}));

const CostLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  color: theme.palette.text.secondary,
}));

const CostValue = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  fontWeight: 500,
}));

interface LoanOptionsProps {
  onCalculateAffordability: () => void;
}

export const LoanOptions = ({ onCalculateAffordability }: LoanOptionsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { selectedProperty } = useProperty();
  const { 
    loanPurpose, setLoanPurpose,
    isFirstHomeBuyer, setIsFirstHomeBuyer,
    loanDeposit, setLoanDeposit,
    loanAmount, setLoanAmount
  } = useLoan();
  
  const {
    loanProductDetails,
    loanPreferences,
    updateLoanPreferences
  } = useLoanProducts();
  
  const {
    selectedProperty: property,
    depositDetails,
    updateSavings
  } = useProperty();
  
  const [propertyPrice, setPropertyPrice] = useState(0);
  const [savings, setSavings] = useState(0);
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);
  
  // Debounced property price and savings values
  const [debouncedPropertyPrice, setDebouncedPropertyPrice] = useState(propertyPrice);
  const [debouncedSavings, setDebouncedSavings] = useState(savings);
  
  // Calculate LVR percentage
  const lvrPercentage = debouncedPropertyPrice > 0 && loanAmount?.required
    ? (loanAmount.required / debouncedPropertyPrice) * 100 
    : 0;
  
  // Initialize property price from selected property if available
  useEffect(() => {
    if (selectedProperty && selectedProperty.valuation) {
      const valuation = selectedProperty.valuation.mid;
      setPropertyPrice(valuation);
      setDebouncedPropertyPrice(valuation);
      
      // Set savings to default percentage of property price
      const defaultSavings = Math.round(valuation * (DEFAULT_SAVINGS_PERCENTAGE / 100));
      setSavings(defaultSavings);
      setDebouncedSavings(defaultSavings);
    }
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
  
  // Debounce savings changes
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSavings(savings);
      // Update PropertyContext with new savings value
      updateSavings(savings);
      console.log('Syncing savings value to PropertyContext:', savings);
    }, INPUT_DEBOUNCE_TIME);
    
    return () => {
      clearTimeout(timerId);
    };
  }, [savings, updateSavings]);
  
  // Calculate loan amount when inputs change
  useEffect(() => {
    if (selectedProperty) {
      const state = selectedProperty.address.state;
      const postcode = selectedProperty.address.postcode;
      
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
    }
  }, [debouncedPropertyPrice, debouncedSavings, loanPurpose, isFirstHomeBuyer, selectedProperty, setLoanDeposit, setLoanAmount]);
  
  const handlePurposeChange = (_event: React.MouseEvent<HTMLElement>, newPurpose: LoanPurpose | null) => {
    if (newPurpose !== null) {
      setLoanPurpose(newPurpose);
    }
  };
  
  const handleConfigureClick = () => {
    setIsConfigureModalOpen(true);
  };
  
  const handleCloseConfigureModal = () => {
    setIsConfigureModalOpen(false);
  };
  
  const handlePreferencesChange = (newPreferences: typeof loanPreferences) => {
    updateLoanPreferences(newPreferences);
  };
  
  // Check if we need to display loan products
  const showLoanProducts = loanAmount && loanAmount.required > 0 && loanProductDetails.athenaProduct !== null;
  
  // Check if we're showing a Tailored product (80-85% LVR)
  const isTailoredProduct = loanAmount ? (loanAmount.lvr > 80 && loanAmount.lvr <= 85) : false;
  
  if (!selectedProperty) {
    return null;
  }
  
  return (
    <Box sx={{ width: '100%' }}>
      <Container>
        <SectionTitle variant="h1">To buy this property</SectionTitle>
        
        <CardContainer>
          <SectionHeading>Your Loan Options</SectionHeading>
          
          {/* Purpose toggle - using ToggleButtonGroup for segmented buttons */}
          <StyledToggleButtonGroup
            value={loanPurpose}
            exclusive
            onChange={handlePurposeChange}
            aria-label="Property purpose"
            fullWidth
          >
            <StyledToggleButton value="OWNER_OCCUPIED" aria-label="live in">
              To live in
            </StyledToggleButton>
            <StyledToggleButton value="INVESTMENT" aria-label="investment">
              As an investment
            </StyledToggleButton>
          </StyledToggleButtonGroup>
          
          {/* First home buyer toggle - only visible for owner occupied */}
          {loanPurpose === 'OWNER_OCCUPIED' && (
            <FormRow sx={{ mb: 2 }}>
              <SwitchLabel>First time home buyer</SwitchLabel>
              <Switch 
                checked={isFirstHomeBuyer}
                onChange={(e) => setIsFirstHomeBuyer(e.target.checked)}
                inputProps={{ 'aria-label': 'first home buyer toggle' }}
                size="small"
              />
            </FormRow>
          )}
          
          {/* Property price input */}
          <FormRow>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InputLabel>Estimated property sale price</InputLabel>
              <IconButton size="small" sx={{ ml: 0.5, p: 0.5 }}>
                <InfoOutlinedIcon fontSize="small" sx={{ width: 16, height: 16 }} />
              </IconButton>
            </Box>
            <InputContainer>
              <CurrencyTextField
                value={propertyPrice}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setPropertyPrice(isNaN(value) ? 0 : value);
                }}
                variant="outlined"
                size="small"
                sx={{ width: "140px", input: { textAlign: "right" } }}
                inputProps={{ style: { textAlign: "right" } }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"></InputAdornment>,
                }}
                aria-label="Property price"
              />
            </InputContainer>
          </FormRow>
          
          {/* Savings input */}
          <FormRow>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InputLabel>Savings I have to contribute</InputLabel>
              <IconButton size="small" sx={{ ml: 0.5, p: 0.5 }}>
                <InfoOutlinedIcon fontSize="small" sx={{ width: 16, height: 16 }} />
              </IconButton>
            </Box>
            <InputContainer>
              <CurrencyTextField
                value={savings}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setSavings(isNaN(value) ? 0 : value);
                }}
                variant="outlined"
                size="small"
                sx={{ width: "140px", input: { textAlign: "right" } }}
                inputProps={{ style: { textAlign: "right" } }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"></InputAdornment>,
                }}
                aria-label="Savings amount"
              />
            </InputContainer>
          </FormRow>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Loan result with LVR visualization */}
          <Box sx={{ mb: 2 }}>
            <ResultRow>
              <ResultLabel>Loan amount required</ResultLabel>
              <ResultValue>
                {loanAmount ? formatCurrency(loanAmount.required) : '$0'}
              </ResultValue>
            </ResultRow>
            
            {/* LVR Progress Bar */}
            <LvrProgress 
              variant="determinate" 
              value={Math.min(lvrPercentage, 100)} 
            />
            
            {/* LVR Percentage */}
            <LvrLabel>
              {Math.round(lvrPercentage)}% of the property value (LVR)
            </LvrLabel>
          </Box>
          
          {/* Deposit and costs section */}
          <Box sx={{ mt: 2 }}>
            <FormRow>
              <DepositHeading>Deposit</DepositHeading>
              <DepositValue>
                {loanDeposit ? formatCurrency(loanDeposit.availableForDeposit) : '$0'}
              </DepositValue>
            </FormRow>
            
            {/* Stamp duty */}
            <FormRow sx={{ mb: 1 }}>
              <CostLabel>Stamp duty</CostLabel>
              <CostValue>
                {loanDeposit ? formatCurrency(loanDeposit.stampDuty) : '$0'}
              </CostValue>
            </FormRow>
            
            {/* Other upfront costs */}
            <FormRow sx={{ mb: 1 }}>
              <CostLabel>Other upfront costs</CostLabel>
              <CostValue>
                {loanDeposit ? formatCurrency(loanDeposit.upfrontCosts) : '$0'}
              </CostValue>
            </FormRow>
          </Box>
          
          {/* Loan product details section */}
          {showLoanProducts && loanProductDetails.athenaProduct && (
            <LoanProductsContainer>
              <Divider sx={{ my: 2 }} />
              
              <ProductHeadingContainer>
                <ProductTitle>
                  {loanProductDetails.ownHomeProduct 
                    ? 'Combined loan solution' 
                    : 'Recommended loan product'}
                </ProductTitle>
                <ConfigureButton
                  variant="outlined"
                  color="primary"
                  startIcon={<SettingsIcon />}
                  onClick={handleConfigureClick}
                  size="small"
                >
                  Configure loan preferences
                </ConfigureButton>
              </ProductHeadingContainer>
              
              {loanProductDetails.ownHomeProduct ? (
                <OwnHomeLoanProductCard 
                  athenaProduct={{
                    ...loanProductDetails.athenaProduct,
                    brandLogoSrc: ATHENA_LOGO_URL
                  }}
                  ownHomeProduct={{
                    ...loanProductDetails.ownHomeProduct,
                    brandLogoSrc: OWNHOME_LOGO_URL
                  }}
                />
              ) : (
                <LoanProductCard 
                  product={{
                    ...loanProductDetails.athenaProduct,
                    brandLogoSrc: ATHENA_LOGO_URL
                  }}
                  showLoanAmount={false}
                />
              )}
              
              {/* Configure loan modal */}
              <ConfigureLoanModal
                open={isConfigureModalOpen}
                onClose={handleCloseConfigureModal}
                initialPreferences={loanPreferences}
                onPreferencesChange={handlePreferencesChange}
                productDetails={loanProductDetails}
                isTailored={isTailoredProduct}
              />
            </LoanProductsContainer>
          )}

          {/* Add Calculate Affordability button */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={onCalculateAffordability}
              size="large"
            >
              Calculate your affordability
            </Button>
          </Box>
        </CardContainer>
      </Container>
    </Box>
  );
}; 