import { useState, useEffect, useRef, useCallback, useMemo, useTransition, startTransition } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  styled,
  Slider,
  Divider,
  alpha,
  Fade,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Button
} from '@mui/material';
import { ExpandMore, BugReport, Download } from '@mui/icons-material';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { ImprovementSuggestions } from './ImprovementSuggestions';
import { calculateMaxBorrowing } from '../../logic/maxBorrow/adapter';
import { ImprovementScenario } from '../../types/FinancialTypes';
import { calculateImprovementScenarios } from '../../logic/calculateImprovementScenarios';
import { formatCurrency } from '../../logic/formatters';
import { GLOBAL_LIMITS, DEFAULT_UPFRONT_COSTS } from '../../constants';
import { LoanProductDetails } from '../../types/loan';
import { getProductForLvr, calculateMonthlyRepayment } from '../../logic/productSelector';
import { depositService } from '../../logic/depositService';
import { LoanProductCard } from '../LoanProductCard';
import { SimplifiedAnimatedNumber } from './SimplifiedAnimatedNumber';
import { FinancialTooltip } from './FinancialTooltip';
import { getLoanProductDetails } from '../../logic/loanProductService';
import { useLoanProducts } from '../../hooks';
import { convertToAnnual as toAnnualAmount } from '../../logic/frequencyConverter';
import { tracingService } from '../../logic/tracingService';
import { LoggerFactory } from '../../logic/maxBorrow/utilities';
import { unstable_batchedUpdates } from 'react-dom';
import debounce from 'lodash/debounce';

const CardContainer = styled(Card)(({ theme }) => ({
  maxWidth: 730,
  margin: '0 auto',
  padding: theme.spacing(3),
}));

const InfoBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.info.light,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  color: theme.palette.info.contrastText,
}));

const LogItem = styled(Box)(({ theme }) => ({
  fontFamily: 'monospace',
  fontSize: '0.75rem',
  whiteSpace: 'pre-wrap',
  padding: theme.spacing(0.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.05)
  }
}));

const LogsContainer = styled(Box)(({ theme }) => ({
  maxHeight: 300,
  overflowY: 'auto',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.03)
}));

/**
 * Get customer-friendly messaging based on loan amount serviceability
 */
function getCustomerMessage(loanAmountRequiredMet: boolean, maxBorrowAmount: number, requiredLoanAmount: number) {
  if (loanAmountRequiredMet) {
    const difference = maxBorrowAmount - requiredLoanAmount;
    return {
      title: 'Good news!',
      message: `Yes we can lend you the loan amount needed for this property. Your overall maximum borrowing amount is up to ${formatCurrency(maxBorrowAmount)}, which is ${formatCurrency(difference)} more than the amount you need for this property.`
    };
  } else {
    return {
      title: 'Let\'s explore your options',
      message: `We may be able to lend you up to ${formatCurrency(maxBorrowAmount)}, which is lower than the ${formatCurrency(requiredLoanAmount)} you need for the property.`
    };
  }
}

export interface AffordabilityCalculatorProps {
  savings: number;
  propertyPrice: number;
  propertyState: string;
  propertyPostcode: string;
  isFirstHomeBuyer: boolean;
  isInvestmentProperty: boolean;
  baseInterestRate: number;
  requiredLoanAmount: number;
  financials: any;
  loanProductDetails: LoanProductDetails;
  onShowLoanOptions: () => void;
  onOpenFinancialsModal: () => void;
}

export function AffordabilityCalculator({
  savings,
  propertyPrice,
  propertyState,
  propertyPostcode,
  isFirstHomeBuyer,
  isInvestmentProperty,
  baseInterestRate,
  requiredLoanAmount,
  financials,
  loanProductDetails,
  onShowLoanOptions,
  onOpenFinancialsModal,
}: AffordabilityCalculatorProps) {
  // State hooks
  const [maxBorrowingPower, setMaxBorrowingPower] = useState<number>(0);
  const [loanAmountRequiredMet, setLoanAmountRequiredMet] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [selectedLoanAmount, setSelectedLoanAmount] = useState<number>(0);
  const [debouncedLoanAmount, setDebouncedLoanAmount] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedMonthlyRepayment, setSelectedMonthlyRepayment] = useState<number>(0);
  const [selectedPropertyValue, setSelectedPropertyValue] = useState<number>(propertyPrice);
  const [selectedDepositAmount, setSelectedDepositAmount] = useState<number>(0);
  const [selectedStampDuty, setSelectedStampDuty] = useState<number>(0);
  const [selectedUpfrontCosts, setSelectedUpfrontCosts] = useState<number>(0);
  const [improvementScenarios, setImprovementScenarios] = useState<ImprovementScenario[]>([]);
  const [affordabilityScenarioUsed, setAffordabilityScenarioUsed] = useState<boolean>(false);
  const [appliedScenarios, setAppliedScenarios] = useState<string[]>([]);
  const [calculationMetrics, setCalculationMetrics] = useState<{ maxBorrowingTime: number; scenariosTime: number }>({
    maxBorrowingTime: 0,
    scenariosTime: 0
  });
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  // Get loan preferences from context
  const { loanPreferences } = useLoanProducts();
  
  // Get window size for confetti
  const { width, height } = useWindowSize();

  // Add transition state for non-critical updates
  const [isPending, startTransition] = useTransition();

  // Product selection logic
  const getLoanProduct = useCallback((loanAmount: number, propertyValue: number) => {
    const lvr = (loanAmount / propertyValue) * 100;
    logDebug(`[PRODUCT_SELECTION] Getting product for:
      - Loan Amount: ${formatCurrency(loanAmount)}
      - Property Value: ${formatCurrency(propertyValue)}
      - LVR: ${lvr.toFixed(2)}%
      - Is Investment: ${isInvestmentProperty}
      - Interest Only: ${loanPreferences?.interestOnlyTerm ? loanPreferences.interestOnlyTerm > 0 : false}
      - Rate Type: ${loanPreferences?.interestRateType}
      - Fixed Term: ${loanPreferences?.fixedTerm || 0}
      - Feature Type: ${loanPreferences?.loanFeatureType || 'redraw'}
    `);
    
    return getProductForLvr(
      lvr / 100,
      loanAmount,
      isInvestmentProperty,
      loanPreferences?.interestOnlyTerm ? loanPreferences.interestOnlyTerm > 0 : false,
      loanPreferences?.interestRateType === 'FIXED',
      loanPreferences?.fixedTerm || 0,
      loanPreferences?.loanFeatureType || 'redraw'
    );
  }, [isInvestmentProperty, loanPreferences]);

  // Memoize LVR band calculation
  const getLvrBand = useMemo(() => {
    return (lvr: number) => {
      if (lvr <= 60) return 'LOW';
      if (lvr <= 70) return 'MEDIUM';
      if (lvr <= 80) return 'HIGH';
      return 'VERY_HIGH';
    };
  }, []);

  // Track previous LVR band
  const previousLvrBand = useRef<string | undefined>(undefined);

  // Batch update derived values
  const updateDerivedValues = useCallback((loanAmount: number, propValue?: number) => {
    console.time('updateDerivedValues');
    
    const currentPropertyValue = propValue || selectedPropertyValue;
    
    // Calculate all values first
    const propertyValueResult = calculatePropertyValueFromLoanAmount(
      loanAmount,
      savings,
      propertyState,
      isFirstHomeBuyer,
      isInvestmentProperty
    );
    
    const effectivePropertyValue = propertyValueResult.propertyValue;
    const lvr = effectivePropertyValue > 0 ? (loanAmount / effectivePropertyValue) * 100 : 0;
    
    // Always get new product for the loan amount
    const product = getLoanProduct(loanAmount, effectivePropertyValue);
    
    logDebug(`[UPDATE_VALUES] Updating derived values:
      - Loan Amount: ${formatCurrency(loanAmount)}
      - Property Value: ${formatCurrency(effectivePropertyValue)}
      - LVR: ${lvr.toFixed(2)}%
      - Product Rate: ${product.interestRate}%
      - Monthly Repayment: ${formatCurrency(product.monthlyRepayment)}
    `);
    
    // Calculate deposit components
    const depositComponents = depositService.calculateDepositComponents(
      effectivePropertyValue,
      propertyState,
      isFirstHomeBuyer,
      isInvestmentProperty
    );
    
    // Batch all state updates
    unstable_batchedUpdates(() => {
      setSelectedPropertyValue(effectivePropertyValue);
      setSelectedDepositAmount(effectivePropertyValue - loanAmount);
      setSelectedStampDuty(depositComponents.stampDuty);
      setSelectedUpfrontCosts(depositComponents.legalFees + depositComponents.otherUpfrontCosts);
      setSelectedProduct(product);
      setSelectedMonthlyRepayment(product.monthlyRepayment);
    });
    
    console.timeEnd('updateDerivedValues');
  }, [
    savings,
    propertyState,
    isFirstHomeBuyer,
    isInvestmentProperty,
    selectedPropertyValue,
    getLoanProduct
  ]);

  // Debounced slider update with quick feedback
  const debouncedUpdateValues = useRef(
    debounce((value: number) => {
      updateDerivedValues(value);
    }, 250)
  ).current;

  // Optimized slider change handler
  const handleSliderChange = useCallback((event: Event, value: number | number[]) => {
    const newValue = Math.min(Array.isArray(value) ? value[0] : value, maxBorrowingPower);
    
    // Immediate update of loan amount
    setSelectedLoanAmount(newValue);
    
    // Always update product details with transition
    startTransition(() => {
      updateDerivedValues(newValue);
    });
  }, [maxBorrowingPower, updateDerivedValues]);

  // Memoized loan product card
  const MemoizedLoanProductCard = useMemo(() => {
    if (!selectedProduct) return null;
    
    return (
      <Fade in={true} timeout={900}>
        <Box sx={{ mt: 3 }}>
          <LoanProductCard
            product={{
              ...selectedProduct,
              loanAmount: selectedLoanAmount, // Ensure loan amount is always current
            }}
            showLoanAmount={true}
          />
        </Box>
      </Fade>
    );
  }, [selectedProduct, selectedLoanAmount]);

  // Helper function to get LVR color based on value
  const getLvrColor = useCallback((lvr: number) => {
    if (lvr <= 60) return 'success.main';
    if (lvr <= 70) return 'success.light';
    if (lvr <= 80) return 'warning.main';
    return 'error.main';
  }, []);

  // Quick LVR calculation for immediate feedback
  const quickLvrDisplay = useMemo(() => {
    const lvr = selectedPropertyValue > 0 ? (selectedLoanAmount / selectedPropertyValue) * 100 : 0;
    return {
      value: lvr,
      color: getLvrColor(lvr)
    };
  }, [selectedLoanAmount, selectedPropertyValue, getLvrColor]);

  // Apply debounce to loan amount changes to avoid excessive recalculations
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedLoanAmount(selectedLoanAmount);
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timerId);
  }, [selectedLoanAmount]);

  // Log function for debugging
  const logDebug = (message: string) => {
    console.log(message);
    setDebugLogs(prev => [message, ...prev].slice(0, 100)); // Keep last 100 logs
  };

  // Calculated borrowing power using serviceability formula
  useEffect(() => {
    // More graceful input validation that allows for zero values
    if (!propertyPrice && !savings && !baseInterestRate && !financials) {
      console.warn('All required values are missing, calculation likely to fail');
    } else if (!propertyPrice || !savings || !baseInterestRate || !financials) {
      console.warn('Some required values are missing or zero:', { 
        hasPropertyPrice: !!propertyPrice, 
        hasSavings: !!savings, 
        hasInterestRate: !!baseInterestRate, 
        hasFinancials: !!financials 
      });
    }
    
    if (!loanProductDetails) {
      console.error('loanProductDetails is undefined, cannot proceed with calculation');
      return;
    }
    
    const calculateBorrowingPower = async () => {
      try {
        setError(null);
        setIsCalculating(true);
        
        const startTime = performance.now();
        tracingService.startTimer('maxBorrowing_total');
        
        logDebug('[SCENARIOS] Starting max borrowing calculation');
        const result = calculateMaxBorrowing(
          financials,
          loanProductDetails,
          propertyPrice,
          isInvestmentProperty,
          propertyPostcode,
          savings,
          propertyState,
          isFirstHomeBuyer,
          requiredLoanAmount,
          false,
          loanPreferences
        );
        
        const endTime = performance.now();
        
        logDebug(`[SCENARIOS] Max borrowing calculation result: ${formatCurrency(result.maxBorrowAmount)}`);
        logDebug(`[SCENARIOS] Required loan amount: ${formatCurrency(requiredLoanAmount)}`);
        
        setMaxBorrowingPower(result.maxBorrowAmount);
        setIsCalculating(false);
        
        const meetsRequirement = requiredLoanAmount > 0 
          ? result.maxBorrowAmount >= requiredLoanAmount
          : false;
          
        setLoanAmountRequiredMet(meetsRequirement);
        
        // Show confetti if we meet the requirement
        if (meetsRequirement && requiredLoanAmount > 0) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }
        
        // Calculate improvement scenarios if needed
        if (requiredLoanAmount > 0 && !meetsRequirement) {
          const scenarios = calculateImprovementScenarios(
            financials,
            result,
            loanProductDetails,
            savings,
            propertyPrice,
            propertyState,
            propertyPostcode,
            isFirstHomeBuyer,
            isInvestmentProperty,
            requiredLoanAmount,
            loanPreferences
          );
          setImprovementScenarios(scenarios);
        } else {
          setImprovementScenarios([]);
        }
        
      } catch (error) {
        console.error('[SCENARIOS] Max borrowing calculation error:', error);
        setError('Unable to calculate borrowing power. Please try again.');
        setIsCalculating(false);
        setImprovementScenarios([]);
        setLoanAmountRequiredMet(false);
      }
    };
    
    calculateBorrowingPower();
  }, [
    propertyPrice, 
    savings, 
    propertyState, 
    isFirstHomeBuyer, 
    isInvestmentProperty, 
    baseInterestRate, 
    financials, 
    loanProductDetails,
    requiredLoanAmount,
    propertyPostcode,
    loanPreferences
  ]);

  // Separate effect for initial derived values setup
  useEffect(() => {
    if (maxBorrowingPower > 0 && !isCalculating) {
      const initialLoanAmount = requiredLoanAmount > 0 
        ? Math.min(requiredLoanAmount, maxBorrowingPower)
        : maxBorrowingPower;
      
      logDebug(`[INITIAL_SETUP] Setting initial loan amount: ${formatCurrency(initialLoanAmount)}`);
      setSelectedLoanAmount(initialLoanAmount);
      updateDerivedValues(initialLoanAmount, propertyPrice);
    }
  }, [maxBorrowingPower, isCalculating, requiredLoanAmount, propertyPrice]);

  // Add a separate effect to handle UI updates when the selected loan amount changes via the slider
  useEffect(() => {
    if (debouncedLoanAmount && maxBorrowingPower > 0) {
      // Only update UI without triggering the expensive max borrowing calculation
      logDebug(`Updating UI for selected loan amount: ${formatCurrency(debouncedLoanAmount)}`);
      updateDerivedValues(debouncedLoanAmount);
    }
  }, [debouncedLoanAmount, maxBorrowingPower, updateDerivedValues]);

  // Info message to display
  const infoBox = getCustomerMessage(loanAmountRequiredMet, maxBorrowingPower, requiredLoanAmount);

  // Toggle improvement scenario
  const toggleImprovementScenario = (scenario: ImprovementScenario) => {
    // Check if this scenario is already applied
    const isAlreadyApplied = appliedScenarios.includes(scenario.id);
    
    if (isAlreadyApplied) {
      // Remove the scenario
      setAppliedScenarios(prev => prev.filter(id => id !== scenario.id));
      
      // Reset to original max borrowing
      setMaxBorrowingPower(prev => {
        const updatedBorrowing = prev - scenario.impact;
        
        // Update loan amount slider if it's now higher than max
        if (selectedLoanAmount > updatedBorrowing) {
          updateDerivedValues(updatedBorrowing);
        }
        
        return updatedBorrowing;
      });
      
      setAffordabilityScenarioUsed(appliedScenarios.length > 1); // Keep flag true if other scenarios are still applied
      
      tracingService.logUI('Scenario removed', { 
        scenarioId: scenario.id, 
        scenarioType: scenario.type,
        scenarioTitle: scenario.title 
      });
    } else {
      // Apply the scenario
      setAppliedScenarios(prev => [...prev, scenario.id]);
      
      // Update borrowing power with the impact
      setMaxBorrowingPower(prev => {
        const updatedBorrowing = prev + scenario.impact;
        return updatedBorrowing;
      });
      
      setAffordabilityScenarioUsed(true);
      
      tracingService.logUI('Scenario applied', { 
        scenarioId: scenario.id, 
        scenarioType: scenario.type,
        scenarioTitle: scenario.title,
        impact: scenario.impact
      });
    }
  };

  // Handle export of debug logs as a text file
  const handleExportLogs = () => {
    if (debugLogs.length === 0) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `affordability-calculation-logs-${timestamp}.txt`;
    const content = debugLogs.join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    tracingService.logUI('Debug logs exported', { filename });
  };

  useEffect(() => {
    logDebug(`[UI_STATE] Improvement suggestions visibility check:
      - loanAmountRequiredMet: ${loanAmountRequiredMet}
      - improvementScenarios.length: ${improvementScenarios.length}
      - requiredLoanAmount: ${formatCurrency(requiredLoanAmount)}
      - maxBorrowingPower: ${formatCurrency(maxBorrowingPower)}
      - isCalculating: ${isCalculating}
    `);
  }, [loanAmountRequiredMet, improvementScenarios.length, requiredLoanAmount, maxBorrowingPower, isCalculating]);

  // Add effect to monitor improvement scenarios state
  useEffect(() => {
    logDebug(`[SCENARIOS_STATE] State updated:
      - improvementScenarios: ${improvementScenarios.length}
      - loanAmountRequiredMet: ${loanAmountRequiredMet}
      - isCalculating: ${isCalculating}
      - Scenarios: ${JSON.stringify(improvementScenarios.map(s => ({ id: s.id, title: s.title })))}
    `);
  }, [improvementScenarios, loanAmountRequiredMet, isCalculating]);

  // Optimized slider component
  const LoanSlider = useMemo(() => {
    return (
      <Box sx={{ px: 1, mb: 1 }}>
        <Slider
          value={selectedLoanAmount}
          onChange={handleSliderChange}
          min={Math.max(GLOBAL_LIMITS.MIN_LOAN_AMOUNT, maxBorrowingPower * 0.5)}
          max={maxBorrowingPower}
          step={10000}
          disabled={isCalculating}
          aria-labelledby="loan-amount-slider"
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => formatCurrency(value)}
          marks={[
            { value: Math.max(GLOBAL_LIMITS.MIN_LOAN_AMOUNT, maxBorrowingPower * 0.5), label: '' },
            { value: maxBorrowingPower, label: '' }
          ].filter(mark => mark.value >= Math.max(GLOBAL_LIMITS.MIN_LOAN_AMOUNT, maxBorrowingPower * 0.5) && mark.value <= maxBorrowingPower)}
          sx={{
            color: (theme) => theme.palette.primary.main,
            height: 8,
            "& .MuiSlider-track": {
              transition: "width 0.3s ease-out", 
              height: 8,
            },
            "& .MuiSlider-thumb": {
              height: 24,
              width: 24,
              backgroundColor: "#fff",
              border: (theme) => `2px solid ${theme.palette.primary.main}`,
              transition: "transform 0.1s, left 0.3s ease-out, box-shadow 0.2s",
              "&:active": {
                transform: "scale(1.2)",
              },
              "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
                boxShadow: (theme) => `0 0 0 8px ${alpha(theme.palette.primary.main, 0.16)}`,
              },
            },
            "& .MuiSlider-valueLabel": {
              backgroundColor: theme => theme.palette.primary.main,
              fontSize: "0.75rem",
              padding: "0.5rem 0.75rem",
              borderRadius: "4px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              '&:before': {
                display: 'none',
              },
              '&.MuiSlider-valueLabelOpen': {
                transform: 'translateY(-100%) scale(1)',
              },
              transition: 'transform 0.2s ease-out, opacity 0.2s',
            }
          }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {formatCurrency(Math.max(GLOBAL_LIMITS.MIN_LOAN_AMOUNT, maxBorrowingPower * 0.5))}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatCurrency(maxBorrowingPower)}
          </Typography>
        </Box>
      </Box>
    );
  }, [selectedLoanAmount, maxBorrowingPower, isCalculating, handleSliderChange]);

  // Now showing loading state when needed and error when there's an issue
  return (
    <CardContainer>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={150}
          recycle={false}
          gravity={0.2}
        />
      )}
      
      {isCalculating ? (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px' 
          }}
        >
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Calculating your borrowing power...
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            Your Borrowing Power
          </Typography>

          {error ? (
            <Box sx={{ p: 3, bgcolor: 'error.light', borderRadius: 1, mb: 2 }}>
              <Typography color="error" variant="body1">
                {error}
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={() => {
                  setError(null);
                  // Force recalculation by updating a dependency
                  setSelectedLoanAmount(prev => prev + 1);
                  setTimeout(() => setSelectedLoanAmount(prev => prev - 1), 100);
                }}
              >
                Retry Calculation
              </Button>
            </Box>
          ) : (
            <Fade in={true} timeout={500}>
              <InfoBox>
                <Typography variant="h6" gutterBottom>
                  {infoBox.title}
                </Typography>
                <Typography variant="body1">
                  {infoBox.message}
                </Typography>
              </InfoBox>
            </Fade>
          )}

          {/* Updated Card-based Loan Details Display */}
          <Fade in={true} timeout={700}>
            <Card elevation={1} sx={{ borderRadius: 1, overflow: "hidden", mb: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, color: (theme) => theme.palette.primary.main }}>
                  Loan Details
                </Typography>
                
                {/* Use memoized loan details display */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Property Amount
                      <FinancialTooltip 
                        title="Property Amount" 
                        content="The total cost of the property. This value changes based on your loan amount selection to maintain a consistent loan-to-value ratio."
                      />
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      <SimplifiedAnimatedNumber value={selectedPropertyValue} />
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Your Savings
                      <FinancialTooltip 
                        title="Your Savings" 
                        content="The total funds you have available for the property purchase, including your deposit and funds for upfront costs."
                      />
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      <SimplifiedAnimatedNumber value={savings} />
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Required Deposit
                      <FinancialTooltip 
                        title="Required Deposit" 
                        content="The amount needed toward the property purchase (property price minus loan amount)."
                      />
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      <SimplifiedAnimatedNumber value={selectedDepositAmount} />
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Stamp Duty
                      <FinancialTooltip 
                        title="Stamp Duty" 
                        content="A state government tax calculated based on your property value, location, and buyer status."
                      />
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      <SimplifiedAnimatedNumber value={selectedStampDuty} />
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Upfront Costs
                      <FinancialTooltip 
                        title="Upfront Costs" 
                        content="Additional expenses including legal fees, inspection costs, and loan application fees."
                      />
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      <SimplifiedAnimatedNumber value={selectedUpfrontCosts} />
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Loan Amount
                      <FinancialTooltip 
                        title="Loan Amount" 
                        content="The amount you'll need to borrow to purchase the property, based on the property value minus your deposit."
                      />
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: (theme) => theme.palette.primary.main }}>
                      <SimplifiedAnimatedNumber value={selectedLoanAmount} />
                    </Typography>
                  </Box>

                  {/* LVR Display */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5, mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Loan to Value Ratio (LVR)
                      <FinancialTooltip 
                        title="Loan to Value Ratio (LVR)" 
                        content={
                          <>
                            <p>LVR measures the ratio of your loan amount to the property value, expressed as a percentage.</p>
                            <p>Lower LVR (below 80%) typically means better interest rates and avoiding Lenders Mortgage Insurance (LMI).</p>
                          </>
                        }
                      />
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 600,
                        color: theme => {
                          const lvr = (selectedLoanAmount / selectedPropertyValue) * 100;
                          if (lvr <= 60) return theme.palette.success.main;
                          if (lvr <= 70) return theme.palette.success.light;
                          if (lvr <= 80) return theme.palette.warning.main;
                          return theme.palette.error.main;
                        },
                        transition: 'color 0.3s ease'
                      }}
                    >
                      <SimplifiedAnimatedNumber 
                        value={(selectedLoanAmount / selectedPropertyValue) * 100} 
                        format="percent" 
                        decimals={1} 
                      />
                    </Typography>
                  </Box>
                </Box>

                {/* Use memoized slider */}
                {LoanSlider}
              </CardContent>
            </Card>
          </Fade>

          {/* Use memoized loan product card */}
          {MemoizedLoanProductCard}

          {/* Improvement Suggestions - Only shown when needed */}
          <Fade 
            in={!loanAmountRequiredMet && improvementScenarios.length > 0} 
            timeout={1000} 
            unmountOnExit
          >
            <Box sx={{ mt: 3 }}>
              <ImprovementSuggestions
                scenarios={improvementScenarios}
                onScenarioClick={toggleImprovementScenario}
                appliedScenarios={appliedScenarios}
              />
            </Box>
          </Fade>

          {/* Show what scenarios have been applied in a separate area when scrolling away from suggestions */}
          <Fade in={affordabilityScenarioUsed} timeout={800} unmountOnExit>
            <Box sx={{ mt: 2, mb: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Your borrowing power estimate includes {appliedScenarios.length} improvement {appliedScenarios.length === 1 ? 'scenario' : 'scenarios'}
              </Typography>
            </Box>
          </Fade>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ 
                textDecoration: 'underline', 
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
                '&:hover': {
                  opacity: 0.8
                }
              }}
              onClick={() => onOpenFinancialsModal()}
            >
              Update my financials
            </Typography>
            
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ 
                textDecoration: 'underline', 
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
                '&:hover': {
                  opacity: 0.8
                }
              }}
              onClick={() => onShowLoanOptions()}
            >
              View all loan options
            </Typography>
          </Box>

          {/* Debug Panel - Only in development */}
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <IconButton 
                  color={showDebugPanel ? 'primary' : 'default'} 
                  onClick={() => setShowDebugPanel(prev => !prev)}
                  title="Toggle debug panel"
                >
                  <BugReport />
                </IconButton>
                
                {showDebugPanel && debugLogs.length > 0 && (
                  <IconButton 
                    color="primary" 
                    onClick={handleExportLogs}
                    title="Export logs"
                  >
                    <Download />
                  </IconButton>
                )}
              </Box>
              
              {showDebugPanel && (
                <Accordion defaultExpanded={false}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle2">Performance Metrics & Diagnostics</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" component="div" fontWeight="bold">
                        Performance metrics:
                      </Typography>
                      <Typography variant="caption" component="div">
                        Max borrowing calc: {calculationMetrics.maxBorrowingTime.toFixed(1)}ms
                      </Typography>
                      <Typography variant="caption" component="div">
                        Scenarios calc: {calculationMetrics.scenariosTime.toFixed(1)}ms
                      </Typography>
                    </Box>
                    
                    {debugLogs.length > 0 && (
                      <Box>
                        <Typography variant="caption" component="div" fontWeight="bold">
                          Calculation Debug Logs ({debugLogs.length} entries):
                        </Typography>
                        <LogsContainer>
                          {debugLogs.map((log, index) => (
                            <LogItem key={index}>
                              {log.startsWith('ERROR:') ? (
                                <span style={{ color: 'red' }}>{log}</span>
                              ) : log.startsWith('WARN:') ? (
                                <span style={{ color: 'orange' }}>{log}</span>
                              ) : log.includes('[CALCULATION]') || log.includes('[CONSTRAINT]') ? (
                                <span style={{ color: 'blue' }}>{log}</span>
                              ) : log.includes('[PERFORMANCE]') ? (
                                <span style={{ color: 'green' }}>{log}</span>
                              ) : (
                                log
                              )}
                            </LogItem>
                          ))}
                        </LogsContainer>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          )}

          {/* Show loading indicator during transitions */}
          {isPending && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={20} />
            </Box>
          )}
        </>
      )}
    </CardContainer>
  );
}

/**
 * Helper function to determine LVR band from LVR
 * @param lvr LVR as decimal (0-1)
 * @returns LVR band object with min and max values
 */
function getLvrBand(lvr: number): { min: number, max: number } {
  if (lvr <= 0.5) return { min: 0, max: 0.5 };
  if (lvr <= 0.6) return { min: 0.5, max: 0.6 };
  if (lvr <= 0.7) return { min: 0.6, max: 0.7 };
  if (lvr <= 0.8) return { min: 0.7, max: 0.8 };
  if (lvr <= 0.85) return { min: 0.8, max: 0.85 };
  return { min: 0.85, max: 1.0 }; // Should never reach this given our constraints
}

/**
 * Calculate property value from loan amount using iterative approach
 */
function calculatePropertyValueFromLoanAmount(
  loanAmount: number,
  savings: number,
  propertyState: string,
  isFirstHomeBuyer: boolean,
  isInvestmentProperty: boolean,
  maxIterations: number = 20
): { propertyValue: number; iterations: number } {
  const logger = LoggerFactory.getLogger('PropertyValueCalculator');
  
  // Define initial bounds for property value
  // Upper bound: loan amount + savings (assuming no costs)
  const upperBoundPropertyValue = loanAmount + savings;
  // Lower bound: 90% of upper bound (reasonable starting point)
  const lowerBoundPropertyValue = (loanAmount + savings) * 0.90;
  
  // Start with average as initial guess
  let propertyValue = (upperBoundPropertyValue + lowerBoundPropertyValue) / 2;
  
  logger.debug(`Initial property value bounds calculation:`);
  logger.debug(`  Upper bound property value: $${formatCurrency(upperBoundPropertyValue)}`);
  logger.debug(`  Lower bound property value: $${formatCurrency(lowerBoundPropertyValue)}`);
  logger.debug(`  Starting property value: $${formatCurrency(propertyValue)}`);

  // Binary search implementation
  let iteration = 0;
  let lowerBound = lowerBoundPropertyValue;
  let upperBound = upperBoundPropertyValue;
  let found = false;
  
  while (iteration < maxIterations && !found) {
    // Calculate stamp duty and costs for this property value
    const depositComponents = depositService.calculateDepositComponents(
      propertyValue,
      propertyState,
      isFirstHomeBuyer,
      isInvestmentProperty
    );
    
    const totalCosts = depositComponents.stampDuty + depositComponents.legalFees + depositComponents.otherUpfrontCosts;
    
    // Calculate available deposit from savings after costs
    const availableDeposit = savings - totalCosts;
    
    // Calculate required deposit for this property value
    const requiredDeposit = propertyValue - loanAmount;
    
    // Calculate difference between available and required deposit
    const depositDifference = availableDeposit - requiredDeposit;
    
    logger.debug(`Iteration ${iteration + 1}: Property $${formatCurrency(propertyValue)}, ` +
      `Loan $${formatCurrency(loanAmount)}, ` +
      `Required deposit $${formatCurrency(requiredDeposit)}, ` +
      `Costs $${formatCurrency(totalCosts)}, ` +
      `Available $${formatCurrency(availableDeposit)}, ` +
      `Difference $${formatCurrency(depositDifference)}`);
    
    // Check if we've found the solution (within $10 tolerance)
    if (Math.abs(depositDifference) < 10) {
      found = true;
      logger.debug(`Convergence achieved at iteration ${iteration + 1}`);
    } else if (depositDifference > 0) {
      // We have more deposit than needed, increase property value
      lowerBound = propertyValue;
      propertyValue = (upperBound + propertyValue) / 2;
    } else {
      // We don't have enough deposit, decrease property value
      upperBound = propertyValue;
      propertyValue = (lowerBound + propertyValue) / 2;
    }
    
    iteration++;
  }
  
  logger.debug(`Property value calculation completed after ${iteration} iterations`);
  logger.debug(`Final property value: $${formatCurrency(propertyValue)}`);
  
  return {
    propertyValue,
    iterations: iteration
  };
}