import { useState, useContext } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Radio,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  InputAdornment,
  Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import CloseIcon from '@mui/icons-material/Close';
import { FinancialsContext } from '../../contexts/FinancialsContext';
import { ApplicantFinancials, FinancialsInput, FrequencyType } from '../../types/FinancialTypes';
import { AffordabilityContext } from '../../contexts/AffordabilityContext';
import { CurrencyTextField } from '../CurrencyTextField';
import { formatCurrency } from '../../logic/formatters';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`borrower-tabpanel-${index}`}
      aria-labelledby={`borrower-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `borrower-tab-${index}`,
    'aria-controls': `borrower-tabpanel-${index}`,
  };
}

interface FinancialsModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function FinancialsModal({ open, onClose, onSubmit }: FinancialsModalProps) {
  const { financials, setFinancials } = useContext(FinancialsContext);
  const { setShowAffordability } = useContext(AffordabilityContext);
  
  const [tabValue, setTabValue] = useState(0);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCalculate = () => {
    try {
      console.log("[FINANCIALS_MODAL] Calculating with financials:", financials);
      
      // Validate financials before submission
      if (!financials || !financials.applicantType) {
        console.error("[FINANCIALS_MODAL] Invalid financials data:", financials);
        alert("Please complete all required financial information before calculating.");
        return;
      }
      
      // First, update financials context
      setFinancials(financials);
      
      // Properly sequence modal closing and affordability display
      // First close the modal
      setTimeout(() => {
        // Call the onClose prop instead of directly manipulating context
        if (onClose) {
          onClose();
        }
        
        // Then show affordability after ensuring modal is closed
        setTimeout(() => {
          console.log("[FINANCIALS_MODAL] Triggering affordability display");
          setShowAffordability(true);
          
          // Finally call onSubmit after affordability is set to true
          setTimeout(() => {
            console.log("[FINANCIALS_MODAL] Sequence complete, calling onSubmit");
            if (onSubmit) {
              onSubmit();
            }
          }, 100);
        }, 300);
      }, 300);
    } catch (error) {
      console.error("[FINANCIALS_MODAL] Error during calculation:", error);
      alert("An error occurred while calculating. Please try again.");
    }
  };

  const updateApplicantType = (type: 'individual' | 'joint') => {
    setFinancials({
      ...financials,
      applicantType: type,
    });
  };

  const updateNumDependents = (numDependents: number) => {
    setFinancials({
      ...financials,
      numDependents,
    });
  };

  const updateApplicantField = (
    applicant: 'applicant1' | 'applicant2',
    field: keyof ApplicantFinancials,
    property: 'value' | 'frequency',
    value: number | FrequencyType,
  ) => {
    setFinancials({
      ...financials,
      [applicant]: {
        ...(financials[applicant] || {}),
        [field]: {
          ...(financials[applicant]?.[field] || {}),
          [property]: value,
        },
      },
    });
  };

  const updateLiabilityField = (
    field: 'expenses' | 'otherHomeLoanRepayments' | 'otherLoanRepayments',
    property: 'value' | 'frequency',
    value: number | FrequencyType,
  ) => {
    setFinancials({
      ...financials,
      liabilities: {
        ...financials.liabilities,
        [field]: {
          ...financials.liabilities[field],
          [property]: value,
        },
      },
    });
  };

  const updateCreditCardLimit = (value: number) => {
    setFinancials({
      ...financials,
      liabilities: {
        ...financials.liabilities,
        creditCardLimit: value,
      },
    });
  };

  const renderIncomeField = (
    applicant: 'applicant1' | 'applicant2',
    field: keyof ApplicantFinancials,
    label: string,
    description: string,
  ) => {
    const data = financials[applicant] || {} as ApplicantFinancials;
    const incomeField = data[field] || { value: 0, frequency: 'yearly' as FrequencyType };

    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {description}
        </Typography>
        
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body1">Amount</Typography>
            <CurrencyTextField
              value={incomeField.value || 0}
              onChange={(e) => updateApplicantField(applicant, field, 'value', Number(e.target.value) || 0)}
              variant="outlined"
              size="small"
              sx={{ width: "140px" }}
              InputProps={{
                startAdornment: <InputAdornment position="start"></InputAdornment>,
              }}
            />
          </Box>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body1">Frequency</Typography>
            <FormControl size="small" sx={{ width: "140px" }}>
              <Select
                value={incomeField.frequency}
                onChange={(e) => updateApplicantField(applicant, field, 'frequency', e.target.value as FrequencyType)}
              >
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="fortnightly">Fortnightly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Annual</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
      </Box>
    );
  };

  const renderCreditCardLimitField = () => {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Credit Card Limit
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          The total limit across all credit cards
        </Typography>
        
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body1">Total Credit Card Limit</Typography>
          <CurrencyTextField
            value={financials.liabilities.creditCardLimit || 0}
            onChange={(e) => updateCreditCardLimit(Number(e.target.value) || 0)}
            variant="outlined"
            size="small"
            sx={{ width: "140px" }}
            InputProps={{
              startAdornment: <InputAdornment position="start"></InputAdornment>,
            }}
          />
        </Box>
        <Divider sx={{ my: 2 }} />
      </Box>
    );
  };

  const renderLiabilityField = (
    field: 'expenses' | 'otherHomeLoanRepayments' | 'otherLoanRepayments',
    label: string,
    description: string,
  ) => {
    const liabilityField = financials.liabilities[field];

    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {description}
        </Typography>
        
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body1">Amount</Typography>
            <CurrencyTextField
              value={liabilityField.value || 0}
              onChange={(e) => updateLiabilityField(field, 'value', Number(e.target.value) || 0)}
              variant="outlined"
              size="small"
              sx={{ width: "140px" }}
              InputProps={{
                startAdornment: <InputAdornment position="start"></InputAdornment>,
              }}
            />
          </Box>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body1">Frequency</Typography>
            <FormControl size="small" sx={{ width: "140px" }}>
              <Select
                value={liabilityField.frequency}
                onChange={(e) => updateLiabilityField(field, 'frequency', e.target.value as FrequencyType)}
              >
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="fortnightly">Fortnightly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Annual</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          // width: '550px',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        Financial Information
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Applicant Information
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ width: '60%' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Applicant Type
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Select whether this is an individual or joint application
                </Typography>
              </Box>
              <Box sx={{ width: '40%' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Number of Dependents
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Select the number of financial dependents
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ width: '60%', display: 'flex', gap: 1 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    py: 0.75,
                    px: 1.5,
                    border: financials.applicantType === 'individual' ? '2px solid #1976d2' : '1px solid rgba(0, 0, 0, 0.12)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    width: '48%',
                  }}
                  onClick={() => updateApplicantType('individual')}
                >
                  <PersonIcon sx={{ mr: 1, fontSize: '1.1rem' }} />
                  <Typography variant="body2">Individual</Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Radio
                    checked={financials.applicantType === 'individual'}
                    onChange={() => updateApplicantType('individual')}
                    value="individual"
                    name="applicant-type"
                    size="small"
                  />
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    py: 0.75,
                    px: 1.5,
                    border: financials.applicantType === 'joint' ? '2px solid #1976d2' : '1px solid rgba(0, 0, 0, 0.12)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    width: '48%',
                  }}
                  onClick={() => updateApplicantType('joint')}
                >
                  <PeopleIcon sx={{ mr: 1, fontSize: '1.1rem' }} />
                  <Typography variant="body2">Joint</Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Radio
                    checked={financials.applicantType === 'joint'}
                    onChange={() => updateApplicantType('joint')}
                    value="joint"
                    name="applicant-type"
                    size="small"
                  />
                </Paper>
              </Box>

              <Box sx={{ width: '40%' }}>
                <FormControl fullWidth size="small">
                  <Select 
                    value={financials.numDependents} 
                    onChange={(e) => updateNumDependents(Number(e.target.value))}
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <MenuItem key={num} value={num}>
                        {num}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="borrower tabs"
            variant={financials.applicantType === 'joint' ? 'fullWidth' : 'standard'}
          >
            <Tab label="Borrower 1" {...a11yProps(0)} />
            {financials.applicantType === 'joint' && <Tab label="Borrower 2" {...a11yProps(1)} />}
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="subtitle1" gutterBottom>
            Income Details - Borrower 1
          </Typography>

          {renderIncomeField(
            'applicant1',
            'baseSalaryIncome',
            'Base Salary Income',
            'Regular income from primary employment'
          )}
          {renderIncomeField(
            'applicant1',
            'supplementaryIncome',
            'Supplementary Income',
            'Additional income from secondary employment'
          )}
          {renderIncomeField(
            'applicant1',
            'otherIncome',
            'Other Income',
            'Any other regular income sources'
          )}
          {renderIncomeField(
            'applicant1',
            'rentalIncome',
            'Rental Income',
            'Income from investment properties'
          )}
        </TabPanel>

        {financials.applicantType === 'joint' && (
          <TabPanel value={tabValue} index={1}>
            <Typography variant="subtitle1" gutterBottom>
              Income Details - Borrower 2
            </Typography>

            {renderIncomeField(
              'applicant2',
              'baseSalaryIncome',
              'Base Salary Income',
              'Regular income from primary employment'
            )}
            {renderIncomeField(
              'applicant2',
              'supplementaryIncome',
              'Supplementary Income',
              'Additional income from secondary employment'
            )}
            {renderIncomeField(
              'applicant2',
              'otherIncome',
              'Other Income',
              'Any other regular income sources'
            )}
            {renderIncomeField(
              'applicant2',
              'rentalIncome',
              'Rental Income',
              'Income from investment properties'
            )}
          </TabPanel>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Liabilities and Expenses
          </Typography>

          {renderLiabilityField(
            'expenses',
            'Expenses',
            'Regular living expenses including utilities, food, etc.'
          )}
          {renderLiabilityField(
            'otherHomeLoanRepayments',
            'Other Home Loan Repayments',
            'Current repayments for any existing home loans'
          )}
          {renderLiabilityField(
            'otherLoanRepayments',
            'Other Loan Repayments',
            'Repayments for personal loans, car loans, etc.'
          )}

          {renderCreditCardLimitField()}
        </Box>
      </DialogContent>

      <DialogActions sx={{ py: 1.5, px: 3 }}>
        <Button onClick={handleClose} color="inherit" size="small" sx={{ mr: 1 }}>
          CANCEL
        </Button>
        <Button onClick={handleCalculate} variant="contained" color="primary" size="small" sx={{ px: 3 }}>
          CALCULATE
        </Button>
      </DialogActions>
    </Dialog>
  );
} 