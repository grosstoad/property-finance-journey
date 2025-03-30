import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  styled,
  Switch,
  IconButton,
  InputBase,
  Divider,
  Tooltip,
  TextField,
  useTheme,
  useMediaQuery,
  Grid,
  Stack
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditIcon from '@mui/icons-material/Edit';
import HelpIcon from '@mui/icons-material/Help';
import { formatCurrency } from '../logic/formatters';
import { useFinancials } from '../contexts/FinancialsContext';

// Types
interface YourFinancialsData {
  hasMultipleApplicants: boolean;
  dependants: number;
  income: number;
  expenses: number;
  debt: number;
  creditCardLimit: number;
}

interface YourFinancialsProps {
  onFinancialsChange?: (financials: YourFinancialsData) => void;
  onOpenModal?: (section?: string) => void;
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

const NumberField = styled(TextField)(({ theme }) => ({
  width: '100%',
  maxWidth: '120px',
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    fontWeight: 500,
    '& input': {
      textAlign: 'center',
      padding: '8px 12px',
    },
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100px',
  },
}));

// Component
export const YourFinancials: React.FC<YourFinancialsProps> = ({ onFinancialsChange, onOpenModal }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Get financials from context
  const { financials, setFinancials, setShowFinancialsModal } = useFinancials();
  
  // Create local state that maps from the context structure
  const [localFinancials, setLocalFinancials] = useState<YourFinancialsData>(() => {
    return {
      hasMultipleApplicants: financials?.applicantType === 'joint',
      dependants: financials?.numDependents || 0,
      income: calculateTotalMonthlyIncome(financials),
      expenses: calculateMonthlyExpenses(financials),
      debt: calculateTotalDebt(financials),
      creditCardLimit: financials?.liabilities?.creditCardLimit || 0,
    };
  });

  // Update local state when context changes
  useEffect(() => {
    setLocalFinancials({
      hasMultipleApplicants: financials?.applicantType === 'joint',
      dependants: financials?.numDependents || 0,
      income: calculateTotalMonthlyIncome(financials),
      expenses: calculateMonthlyExpenses(financials),
      debt: calculateTotalDebt(financials),
      creditCardLimit: financials?.liabilities?.creditCardLimit || 0,
    });
  }, [financials]);

  // Helper functions to calculate values from context data
  function calculateTotalMonthlyIncome(financialsData: any) {
    if (!financialsData) return 0;
    
    let total = 0;
    
    // Calculate applicant 1 income
    if (financialsData.applicant1) {
      for (const incomeType of ['baseSalaryIncome', 'supplementaryIncome', 'otherIncome', 'rentalIncome']) {
        if (financialsData.applicant1[incomeType]) {
          const value = financialsData.applicant1[incomeType].value || 0;
          const frequency = financialsData.applicant1[incomeType].frequency || 'monthly';
          
          // Convert to monthly amount
          switch (frequency) {
            case 'weekly':
              total += value * 52 / 12;
              break;
            case 'fortnightly':
              total += value * 26 / 12;
              break;
            case 'monthly':
              total += value;
              break;
            case 'yearly':
              total += value / 12;
              break;
          }
        }
      }
    }
    
    // Calculate applicant 2 income if joint application
    if (financialsData.applicantType === 'joint' && financialsData.applicant2) {
      for (const incomeType of ['baseSalaryIncome', 'supplementaryIncome', 'otherIncome', 'rentalIncome']) {
        if (financialsData.applicant2[incomeType]) {
          const value = financialsData.applicant2[incomeType].value || 0;
          const frequency = financialsData.applicant2[incomeType].frequency || 'monthly';
          
          // Convert to monthly amount
          switch (frequency) {
            case 'weekly':
              total += value * 52 / 12;
              break;
            case 'fortnightly':
              total += value * 26 / 12;
              break;
            case 'monthly':
              total += value;
              break;
            case 'yearly':
              total += value / 12;
              break;
          }
        }
      }
    }
    
    return Math.round(total);
  }
  
  function calculateMonthlyExpenses(financialsData: any) {
    if (!financialsData || !financialsData.liabilities || !financialsData.liabilities.expenses) {
      return 0;
    }
    
    const value = financialsData.liabilities.expenses.value || 0;
    const frequency = financialsData.liabilities.expenses.frequency || 'monthly';
    
    // Convert to monthly
    switch (frequency) {
      case 'weekly':
        return Math.round(value * 52 / 12);
      case 'fortnightly':
        return Math.round(value * 26 / 12);
      case 'monthly':
        return Math.round(value);
      case 'yearly':
        return Math.round(value / 12);
      default:
        return Math.round(value);
    }
  }
  
  function calculateTotalDebt(financialsData: any) {
    if (!financialsData || !financialsData.liabilities) {
      return 0;
    }
    
    let total = 0;
    
    // Add other home loan repayments
    if (financialsData.liabilities.otherHomeLoanRepayments) {
      const value = financialsData.liabilities.otherHomeLoanRepayments.value || 0;
      const frequency = financialsData.liabilities.otherHomeLoanRepayments.frequency || 'monthly';
      
      // Convert to annual amount
      switch (frequency) {
        case 'weekly':
          total += value * 52 * 12; // Approximate outstanding debt as 12 years of repayments
          break;
        case 'fortnightly':
          total += value * 26 * 12;
          break;
        case 'monthly':
          total += value * 12 * 12;
          break;
        case 'yearly':
          total += value * 12;
          break;
      }
    }
    
    // Add other loan repayments
    if (financialsData.liabilities.otherLoanRepayments) {
      const value = financialsData.liabilities.otherLoanRepayments.value || 0;
      const frequency = financialsData.liabilities.otherLoanRepayments.frequency || 'monthly';
      
      // Convert to annual amount and estimate debt based on 5 years of repayments
      switch (frequency) {
        case 'weekly':
          total += value * 52 * 5;
          break;
        case 'fortnightly':
          total += value * 26 * 5;
          break;
        case 'monthly':
          total += value * 12 * 5;
          break;
        case 'yearly':
          total += value * 5;
          break;
      }
    }
    
    return Math.round(total);
  }

  // Handle toggle for multiple applicants
  const handleMultipleApplicantsToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const hasMultiple = event.target.checked;
    
    // Update local state
    setLocalFinancials({
      ...localFinancials,
      hasMultipleApplicants: hasMultiple,
    });
    
    // Update context
    setFinancials({
      ...financials,
      applicantType: hasMultiple ? 'joint' : 'individual',
    });
    
    // Notify parent if needed
    if (onFinancialsChange) {
      onFinancialsChange({
        ...localFinancials,
        hasMultipleApplicants: hasMultiple
      });
    }
  };

  // Handle dependents change
  const handleDependentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (isNaN(value) || value < 0 || value > 10) return;
    
    // Update local state
    setLocalFinancials({
      ...localFinancials,
      dependants: value,
    });
    
    // Update context
    setFinancials({
      ...financials,
      numDependents: value,
    });
    
    // Notify parent if needed
    if (onFinancialsChange) {
      onFinancialsChange({
        ...localFinancials,
        dependants: value
      });
    }
  };

  // Handle clicks on edit buttons - open the modal to the right section
  const handleEditClick = (field: string) => {
    if (setShowFinancialsModal) {
      setShowFinancialsModal(true);
    }
    
    if (onOpenModal) {
      onOpenModal(field);
    }
  };

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
          Your financials
        </Typography>

        <Grid container alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={6} sm={7}>
            <Typography variant="body1" fontWeight={500}>
              Multiple applicants
            </Typography>
          </Grid>
          <Grid item xs={6} sm={5} sx={{ display: 'flex', justifyContent: 'flex-end', pr: 1 }}>
            <Switch
              checked={localFinancials.hasMultipleApplicants}
              onChange={handleMultipleApplicantsToggle}
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

        <Grid container alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={6} sm={7}>
            <Typography variant="body1" fontWeight={500}>
              Number of dependants
            </Typography>
          </Grid>
          <Grid item xs={6} sm={5} sx={{ display: 'flex', justifyContent: 'flex-end', pr: 1 }}>
            <NumberField
              type="number"
              value={localFinancials.dependants}
              onChange={handleDependentsChange}
              variant="outlined"
              size="small"
              inputProps={{
                min: 0,
                max: 10,
                step: 1,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#7200CB',
                  },
                },
              }}
            />
          </Grid>
        </Grid>

        <Grid container alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={6} sm={7}>
            <Typography variant="body1" fontWeight={500}>
              Income
            </Typography>
          </Grid>
          <Grid item xs={6} sm={5}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', pr: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography fontWeight={700} variant="subtitle1" noWrap>
                  {localFinancials.income === 0 ? '$0' : formatCurrency(localFinancials.income)} / month
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleEditClick('income')}
                  sx={{ color: 'rgba(0, 0, 0, 0.54)' }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Grid container alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={6} sm={7}>
            <Typography variant="body1" fontWeight={500}>
              Expenses
            </Typography>
          </Grid>
          <Grid item xs={6} sm={5}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', pr: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography fontWeight={700} variant="subtitle1" noWrap>
                  {localFinancials.expenses === 0 ? '$0' : formatCurrency(localFinancials.expenses)} / month
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleEditClick('expenses')}
                  sx={{ color: 'rgba(0, 0, 0, 0.54)' }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Grid container alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={6} sm={7}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" fontWeight={500} mr={0.5}>
                Debt
              </Typography>
              <Tooltip title="This is your total debt excluding credit card limits and any mortgage you're applying for">
                <IconButton size="small" color="primary" sx={{ p: 0.5 }}>
                  <HelpIcon sx={{ fontSize: 18, color: '#7200CB' }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
          <Grid item xs={6} sm={5}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', pr: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography fontWeight={700} variant="subtitle1" noWrap>
                  {localFinancials.debt === 0 ? '$0' : formatCurrency(localFinancials.debt)}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleEditClick('debt')}
                  sx={{ color: 'rgba(0, 0, 0, 0.54)' }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Grid container alignItems="center">
          <Grid item xs={6} sm={7}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" fontWeight={500} mr={0.5}>
                Credit card limit
              </Typography>
              <Tooltip title="The total credit limit of all your credit cards">
                <IconButton size="small" color="primary" sx={{ p: 0.5 }}>
                  <HelpIcon sx={{ fontSize: 18, color: '#7200CB' }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
          <Grid item xs={6} sm={5}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', pr: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography fontWeight={700} variant="subtitle1" noWrap>
                  {localFinancials.creditCardLimit === 0 ? '$0' : formatCurrency(localFinancials.creditCardLimit)}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleEditClick('creditCardLimit')}
                  sx={{ color: 'rgba(0, 0, 0, 0.54)' }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </StyledCard>
  );
}; 