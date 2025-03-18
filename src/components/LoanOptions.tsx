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
  useTheme,
  useMediaQuery
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useState, useEffect, useCallback } from 'react';
import { CurrencyInput } from './CurrencyInput';
import { useLoan } from '../contexts/LoanContext';
import { useProperty } from '../contexts/PropertyContext';
import { 
  calculateLoanDeposit, 
  calculateLoanAmount 
} from '../logic/loanService';
import { formatCurrency } from '../logic/formatters';
import { LoanPurpose } from '../types/loan';
import { 
  DEFAULT_SAVINGS_PERCENTAGE, 
  INPUT_DEBOUNCE_TIME 
} from '../constants/defaultValues';

const Container = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  marginBottom: theme.spacing(3),
}));

const CardContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
}));

const SectionHeading = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  marginBottom: theme.spacing(3),
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(3),
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
  padding: theme.spacing(1.5, 3),
  fontWeight: 500,
}));

const SwitchLabel = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 500,
}));

const FormRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const InputLabel = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 500,
}));

const ValueDisplay = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 600,
  textAlign: 'right',
}));

const ExpandButton = styled(IconButton)(({ theme }) => ({
  padding: 0,
  marginLeft: theme.spacing(1),
}));

const SubRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  paddingLeft: theme.spacing(2),
}));

const SubLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
}));

const SubValue = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  textAlign: 'right',
}));

const ResultRow = styled(FormRow)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const ResultLabel = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 600,
}));

const ResultValue = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 700,
  textAlign: 'right',
}));

const InputContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 240,
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100%',
  },
}));

export const LoanOptions = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { selectedProperty } = useProperty();
  const { 
    loanPurpose, setLoanPurpose,
    isFirstHomeBuyer, setIsFirstHomeBuyer,
    loanDeposit, setLoanDeposit,
    loanAmount, setLoanAmount
  } = useLoan();
  
  const [propertyPrice, setPropertyPrice] = useState(0);
  const [savings, setSavings] = useState(0);
  const [costsExpanded, setCostsExpanded] = useState(false);
  
  // Debounced property price and savings values
  const [debouncedPropertyPrice, setDebouncedPropertyPrice] = useState(propertyPrice);
  const [debouncedSavings, setDebouncedSavings] = useState(savings);
  
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
    }, INPUT_DEBOUNCE_TIME);
    
    return () => {
      clearTimeout(timerId);
    };
  }, [savings]);
  
  // Calculate loan deposit and amount whenever debounced inputs change
  useEffect(() => {
    if (selectedProperty && debouncedPropertyPrice > 0) {
      const state = selectedProperty.address.state;
      const postcode = selectedProperty.address.postcode;
      
      const deposit = calculateLoanDeposit(
        debouncedPropertyPrice,
        debouncedSavings,
        state,
        loanPurpose,
        isFirstHomeBuyer
      );
      
      setLoanDeposit(deposit);
      
      const amount = calculateLoanAmount(
        debouncedPropertyPrice,
        deposit.availableForDeposit,
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
  
  if (!selectedProperty) {
    return null;
  }
  
  return (
    <Container>
      <SectionTitle variant="h1">To buy this property</SectionTitle>
      
      <CardContainer>
        <SectionHeading>Affordability</SectionHeading>
        
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
          <FormRow sx={{ mb: 3 }}>
            <SwitchLabel>First time home buyer</SwitchLabel>
            <Switch 
              checked={isFirstHomeBuyer}
              onChange={(e) => setIsFirstHomeBuyer(e.target.checked)}
              inputProps={{ 'aria-label': 'first home buyer toggle' }}
            />
          </FormRow>
        )}
        
        {/* Property price input */}
        <FormRow>
          <InputLabel>Estimated property sale price</InputLabel>
          <InputContainer>
            <CurrencyInput
              value={propertyPrice}
              onChange={setPropertyPrice}
              fullWidth
              variant="outlined"
              size="small"
              aria-label="Property price"
            />
          </InputContainer>
        </FormRow>
        
        {/* Savings input */}
        <FormRow>
          <InputLabel>Savings I have to contribute</InputLabel>
          <InputContainer>
            <CurrencyInput
              value={savings}
              onChange={setSavings}
              fullWidth
              variant="outlined"
              size="small"
              aria-label="Savings amount"
            />
          </InputContainer>
        </FormRow>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Loan result */}
        <ResultRow>
          <ResultLabel>Loan amount required</ResultLabel>
          <ResultValue>
            {loanAmount ? formatCurrency(loanAmount.required) : '$0'}
          </ResultValue>
        </ResultRow>
        
        {/* Other costs expandable section */}
        <FormRow 
          onClick={() => setCostsExpanded(!costsExpanded)}
          sx={{ cursor: 'pointer' }}
          role="button"
          aria-expanded={costsExpanded}
          aria-label="Toggle other costs details"
        >
          <InputLabel>Other costs</InputLabel>
          <Box display="flex" alignItems="center">
            <ValueDisplay>
              {loanDeposit ? formatCurrency(debouncedSavings) : '$0'}
            </ValueDisplay>
            <ExpandButton size="small">
              {costsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ExpandButton>
          </Box>
        </FormRow>
        
        {/* Expanded costs breakdown */}
        <Collapse in={costsExpanded}>
          {loanDeposit && (
            <>
              <SubRow>
                <SubLabel>Deposit for home loan</SubLabel>
                <SubValue>{formatCurrency(loanDeposit.availableForDeposit)}</SubValue>
              </SubRow>
              <SubRow>
                <SubLabel>Stamp duty</SubLabel>
                <SubValue>{formatCurrency(loanDeposit.stampDuty)}</SubValue>
              </SubRow>
              <SubRow>
                <SubLabel>Upfront costs</SubLabel>
                <SubValue>{formatCurrency(loanDeposit.upfrontCosts)}</SubValue>
              </SubRow>
            </>
          )}
        </Collapse>
      </CardContainer>
    </Container>
  );
}; 