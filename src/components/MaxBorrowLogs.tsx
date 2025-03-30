import { useState } from 'react';
import { 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Typography, 
  Box, 
  Divider, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MaxBorrowingResult, LvrFinancialsUsed, LvrDepositUsed, AffordabilitySuggestions, SuggestionImpacts } from '../types/FinancialTypes';
import { formatCurrency, formatPercentage } from '../logic/formatters';
import { ExpandMore } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Define potential suggestion types (excluding SAVINGS, handled separately)
const CORE_SUGGESTION_TYPES = [
  {
    type: 'LONGER_TERM', // Placeholder type
    title: 'Longer loan term',
    description: 'Extending loan term to 30 years',
    defaultCriteria: 'Calculation not implemented'
  },
  {
    type: 'JOINT_APP', // Placeholder type
    title: 'Joint application',
    description: 'Adding a co-borrower to the application',
    defaultCriteria: 'Calculation not implemented'
  },
  {
    type: 'EXPENSES',
    title: 'Reduce expenses to minimum',
    description: 'Lowering monthly spending',
    defaultCriteria: 'Expenses meet/below HEM limits'
  },
  {
    type: 'CREDIT',
    title: 'Close credit cards',
    description: 'Closing credit cards with outstanding limits',
    defaultCriteria: 'No credit card limits reported'
  },
  /* // Removed generic SAVINGS entry - specific ones rendered below
  {
    type: 'SAVINGS', // Represents the category
    title: 'Increase savings',
    description: 'Adding more to deposit/savings',
    defaultCriteria: 'Savings increase not applicable/calculated'
  }
  */
];

interface MaxBorrowLogsProps {
  maxBorrowResult: MaxBorrowingResult;
  affordabilityLogs?: Array<{message: string, timestamp: string}>;
}

export function MaxBorrowLogs({ maxBorrowResult, affordabilityLogs = [] }: MaxBorrowLogsProps) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [showAffordabilityLogs, setShowAffordabilityLogs] = useState<boolean>(false);

  if (!maxBorrowResult) {
    return null;
  }

  // Helper function to get the constraint name
  const getConstraintName = (constraintKey: string): string => {
    const key = constraintKey.replace('maxBorrowingAmountFinancials_', '');
    switch (key) {
      case '0_50':
        return 'LVR 0-50%';
      case '50_60':
        return 'LVR 50-60%';
      case '60_70':
        return 'LVR 60-70%';
      case '70_80':
        return 'LVR 70-80%';
      case '80_85':
        return 'LVR 80-85%';
      default:
        return key;
    }
  };

  // Function to get readable name for the constraint reason
  const getConstraintReasonName = (reason: string): string => {
    switch (reason) {
      case 'financials':
        return 'Financial Serviceability';
      case 'deposit':
        return 'Deposit Constraint';
      case 'global':
        return 'Global Maximum Limit';
      case 'unserviceable':
        return 'Not Serviceable';
      default:
        return reason;
    }
  };

  // Financial LVR bands
  const financialLvrBands = [
    { id: 'maxBorrowingAmountFinancials_0_50', label: '0-50%', value: maxBorrowResult.maxBorrowingAmountFinancials_0_50 },
    { id: 'maxBorrowingAmountFinancials_50_60', label: '50-60%', value: maxBorrowResult.maxBorrowingAmountFinancials_50_60 },
    { id: 'maxBorrowingAmountFinancials_60_70', label: '60-70%', value: maxBorrowResult.maxBorrowingAmountFinancials_60_70 },
    { id: 'maxBorrowingAmountFinancials_70_80', label: '70-80%', value: maxBorrowResult.maxBorrowingAmountFinancials_70_80 },
    { id: 'maxBorrowingAmountFinancials_80_85', label: '80-85%', value: maxBorrowResult.maxBorrowingAmountFinancials_80_85 },
  ];

  // Deposit LVR bands
  const depositLvrBands = [
    { id: 'maxBorrowingAmountDeposit_0_50', label: '0-50%', value: maxBorrowResult.maxBorrowingAmountDeposit_0_50 },
    { id: 'maxBorrowingAmountDeposit_50_60', label: '50-60%', value: maxBorrowResult.maxBorrowingAmountDeposit_50_60 },
    { id: 'maxBorrowingAmountDeposit_60_70', label: '60-70%', value: maxBorrowResult.maxBorrowingAmountDeposit_60_70 },
    { id: 'maxBorrowingAmountDeposit_70_80', label: '70-80%', value: maxBorrowResult.maxBorrowingAmountDeposit_70_80 },
    { id: 'maxBorrowingAmountDeposit_80_85', label: '80-85%', value: maxBorrowResult.maxBorrowingAmountDeposit_80_85 },
  ];

  // Calculate total impact of applied suggestions
  const totalSuggestionsImpact = maxBorrowResult.scenarios
    ?.filter(scenario => maxBorrowResult.appliedScenarioIds?.includes(scenario.id))
    .reduce((sum, scenario) => sum + scenario.impact, 0) || 0;

  return (
    <Box sx={{ mb: 4 }} id="max-borrow-logs">
      <Accordion 
        expanded={expanded} 
        onChange={() => setExpanded(!expanded)}
        sx={{ 
          border: '1px solid #e0e0e0',
          boxShadow: 'none'
        }}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1" fontWeight="bold">
            Borrowing Capacity Details
          </Typography>
        </AccordionSummary>
        
        <AccordionDetails>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Maximum Borrowing: {formatCurrency(maxBorrowResult.maxBorrowAmount)}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Your maximum borrowing amount is determined by several financial calculations and constraints.
              The most restrictive of these becomes your maximum borrowing limit.
            </Typography>
          </Box>
          
          {/* Affordability Suggestions Table */}
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            Affordability Suggestions
          </Typography>
          
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Suggestion</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Evaluation Criteria</TableCell>
                  <TableCell align="center">Applied</TableCell>
                  <TableCell align="right">Impact</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {CORE_SUGGESTION_TYPES.map((suggestionType) => {
                  // Find if a specific scenario of this type was calculated
                  const scenario = maxBorrowResult.scenarios?.find(s => s.type === suggestionType.type);
                  
                  // Determine applied status based on *specific* scenarios in the result
                  const isApplied = scenario ? maxBorrowResult.appliedScenarioIds?.includes(scenario.id) || false : false;
                  
                  // Use calculated criteria if a specific scenario exists, otherwise use default
                  const displayCriteria = scenario ? scenario.evaluationCriteria : suggestionType.defaultCriteria;
                  
                  const displayImpact = scenario ? scenario.impact : 0; // Still need scenario.impact for N/A logic
                  const displayDescription = scenario ? scenario.description : suggestionType.description;
                  
                  const impactText = scenario ? formatCurrency(displayImpact) : 'N/A';
                  
                  return (
                    <TableRow key={suggestionType.type} sx={{ 
                      backgroundColor: isApplied ? '#f0f7ff' : 'inherit',
                      opacity: scenario ? 1 : 0.6 // Dim if no scenario of this type was generated
                    }}>
                      <TableCell component="th" scope="row" sx={{ fontWeight: isApplied ? 'bold' : 'normal' }}>
                        {suggestionType.title} 
                      </TableCell>
                      <TableCell>{displayDescription}</TableCell>
                      <TableCell>{displayCriteria || 'N/A'}</TableCell>
                      <TableCell align="center">
                        {isApplied ? (
                          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                        ) : (
                          <CancelIcon sx={{ color: 'text.disabled', fontSize: 20 }} /> 
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {impactText}
                      </TableCell>
                    </TableRow>
                  );
                })}
                
                {/* Render specific SAVINGS scenarios if they exist */}
                {maxBorrowResult.scenarios?.filter(s => s.type === 'SAVINGS').map((scenario) => {
                    const isApplied = maxBorrowResult.appliedScenarioIds?.includes(scenario.id) || false;
                    return (
                      <TableRow key={scenario.id} sx={{ 
                        backgroundColor: isApplied ? '#f0f7ff' : 'inherit'
                      }}>
                        <TableCell component="th" scope="row" sx={{ fontWeight: isApplied ? 'bold' : 'normal' }}>
                          {scenario.title} 
                        </TableCell>
                        <TableCell>{scenario.description}</TableCell>
                        <TableCell>{scenario.evaluationCriteria || 'N/A'}</TableCell>
                        <TableCell align="center">
                          {isApplied ? (
                            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                          ) : (
                            <CancelIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(scenario.impact)}
                        </TableCell>
                      </TableRow>
                    );
                })}
                
                {/* Handle case where NO scenarios were generated AT ALL */}
                {(!maxBorrowResult.scenarios || maxBorrowResult.scenarios.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No specific affordability suggestions applicable based on current constraints.
                    </TableCell>
                  </TableRow>
                )}

                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                    Total Impact of Applied Suggestions:
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(totalSuggestionsImpact)}
                  </TableCell>
                </TableRow>
                {maxBorrowResult.baseBorrowingAmount !== undefined && (
                  <>
                    <TableRow>
                      <TableCell colSpan={4} align="right">
                        Base Borrowing Amount (without suggestions):
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(maxBorrowResult.baseBorrowingAmount)}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                        Final Borrowing Amount (with applied suggestions):
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(maxBorrowResult.maxBorrowAmount)}
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Primary Limiting Factor: {getConstraintReasonName(maxBorrowResult.maxBorrowAmountReason)}
            </Typography>
            
            <Typography variant="body2" paragraph>
              {maxBorrowResult.maxBorrowAmountReason === 'financials' && (
                <>This constraint is based on your financial serviceability calculations.</>
              )}
              {maxBorrowResult.maxBorrowAmountReason === 'deposit' && (
                <>This constraint is based on your available deposit amount.</>
              )}
              {maxBorrowResult.maxBorrowAmountReason === 'global' && (
                <>This constraint is based on the global maximum lending limit.</>
              )}
              {maxBorrowResult.maxBorrowAmountReason === 'unserviceable' && (
                <>Your income and expenses don't support a loan at this time.</>
              )}
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {/* Financial Constraints Table */}
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            Financial Constraints by LVR Band
          </Typography>
          
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>LVR Band</TableCell>
                  <TableCell align="right">Max Loan Amount</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {financialLvrBands.map((band) => (
                  <TableRow key={band.id} sx={{ 
                    backgroundColor: band.id === maxBorrowResult.maxBorrowingAmountFinancialsUsed ? '#f0f7ff' : 'inherit'
                  }}>
                    <TableCell component="th" scope="row">
                      {band.label}
                      {band.id === maxBorrowResult.maxBorrowingAmountFinancialsUsed && (
                        <Typography variant="caption" color="primary" component="span" sx={{ ml: 1 }}>
                          (Used)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">{formatCurrency(band.value)}</TableCell>
                    <TableCell align="right">
                      {band.value > 0 ? (
                        <Typography variant="body2" color="success.main">Serviceable</Typography>
                      ) : (
                        <Typography variant="body2" color="error.main">Not Serviceable</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Deposit Constraints Table */}
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            Deposit Constraints by LVR Band
          </Typography>
          
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>LVR Band</TableCell>
                  <TableCell align="right">Max Loan Amount</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {depositLvrBands.map((band) => (
                  <TableRow key={band.id} sx={{ 
                    backgroundColor: band.id === maxBorrowResult.maxBorrowingAmountDepositUsed ? '#f0f7ff' : 'inherit'
                  }}>
                    <TableCell component="th" scope="row">
                      {band.label}
                      {band.id === maxBorrowResult.maxBorrowingAmountDepositUsed && (
                        <Typography variant="caption" color="primary" component="span" sx={{ ml: 1 }}>
                          (Used)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">{formatCurrency(band.value)}</TableCell>
                    <TableCell align="right">
                      {band.value > 0 ? (
                        <Typography variant="body2" color="success.main">Available</Typography>
                      ) : (
                        <Typography variant="body2" color="error.main">Not Available</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Additional Information */}
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            Additional Information
          </Typography>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Property Value</Typography>
                <Typography variant="h6">{formatCurrency(maxBorrowResult.propertyValue)}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Loan-to-Value Ratio</Typography>
                <Typography variant="h6">{(maxBorrowResult.lvr * 100).toFixed(1)}%</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Deposit Amount</Typography>
                <Typography variant="h6">{formatCurrency(maxBorrowResult.depositAmount)}</Typography>
              </Box>
            </Grid>
          </Grid>
          
          {/* Affordability Suggestions Logs */}
          {affordabilityLogs && affordabilityLogs.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                Affordability Suggestions Logs
              </Typography>
              
              <Accordion 
                expanded={showAffordabilityLogs} 
                onChange={() => setShowAffordabilityLogs(!showAffordabilityLogs)}
                sx={{ 
                  boxShadow: 'none',
                  border: '1px solid #e0e0e0',
                  '&:before': {
                    display: 'none',
                  },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="body2">
                    View detailed logs ({affordabilityLogs.length} entries)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ maxHeight: '400px', overflow: 'auto', p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Box sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
                      {affordabilityLogs.map((log, index) => (
                        <Box key={index} sx={{ py: 0.5, borderBottom: index < affordabilityLogs.length - 1 ? '1px dashed #ddd' : 'none' }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#555' }}>
                            [{log.timestamp.split('T')[1].split('.')[0]}]
                          </Typography>
                          <Typography variant="caption" sx={{ ml: 1 }}>
                            {log.message}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      These logs track the state of affordability suggestions calculations and the conditions that trigger them.
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
} 