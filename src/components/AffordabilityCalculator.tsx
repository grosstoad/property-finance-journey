import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  Fade, 
  Slider, 
  alpha,
  CircularProgress,
  Container,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton
} from '@mui/material';
import { ExpandMore, BugReport, Download } from '@mui/icons-material';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { depositService } from '../logic/depositService';
import { formatCurrency } from '../logic/formatters';
import { DEFAULT_UPFRONT_COSTS, GLOBAL_LIMITS } from '../constants';
import { calculateImprovementScenarios } from '../logic/calculateImprovementScenarios';
import { tracingService } from '../logic/tracingService';
import { calculateMaxBorrowing } from '../logic/maxBorrow/adapter';
import type { MaxBorrowingResult, ImprovementScenario } from '../types/FinancialTypes';
import { FinancialTooltip } from './AffordabilityCalculator/FinancialTooltip';
import { SimplifiedAnimatedNumber } from './AffordabilityCalculator/SimplifiedAnimatedNumber';
import { ImprovementSuggestions } from './AffordabilityCalculator/ImprovementSuggestions';
import { LoanProductCard } from './LoanProductCard';
import { styled } from '@mui/material/styles';
import { getProductForLvr, calculateMonthlyRepayment } from '../logic/productSelector';
import { LoanProductDetails } from '../types/loan';
import { getLoanProductDetails } from '../logic/loanProductService';
import { useLoanProducts } from '../hooks';
import { convertToAnnual as toAnnualAmount } from '../logic/frequencyConverter';

const CardContainer = styled(Container)(({ theme }) => ({
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

// Helper function to get customer-friendly messaging
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
  loanProductDetails: any;
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
  const [selectedLoanAmount, setSelectedLoanAmount] = useState<number>(requiredLoanAmount);
  const [debouncedLoanAmount, setDebouncedLoanAmount] = useState<number>(requiredLoanAmount);
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
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  // Get loan preferences from context
  const { loanPreferences } = useLoanProducts();

  // Get window size for confetti
  const { width, height } = useWindowSize();

  // Helper function to log debug messages
  const logDebug = useCallback((message: string) => {
    console.log(message);
    setDebugLogs(prev => [message, ...prev].slice(0, 100)); // Keep last 100 logs
  }, []);

  // Memoize updateDerivedValues function to prevent unnecessary recalculations
  const updateDerivedValues = useCallback((loanAmount: number, propValue: number = 0, skipServiceabilityUpdate: boolean = true) => {
    console.time('updateDerivedValues');
    
    // Ensure loan amount doesn't exceed max borrowing power
    const effectiveLoanAmount = maxBorrowingPower > 0 
      ? Math.min(loanAmount, maxBorrowingPower) 
      : loanAmount;
    
    // Set default property value to state if not provided
    const currentPropertyValue = propValue > 0 ? propValue : selectedPropertyValue;
    
    // Calculate LVR based on loan amount and property value
    const lvr = currentPropertyValue > 0 ? (effectiveLoanAmount / currentPropertyValue) * 100 : 0;
    console.log(`Calculated LVR: ${lvr.toFixed(2)}% for loan $${effectiveLoanAmount.toLocaleString()} and property $${currentPropertyValue.toLocaleString()}`);
    
    // Get loan product for this LVR
    const product = getProductForLvr(
      lvr / 100,
      effectiveLoanAmount,
      isInvestmentProperty,
      loanPreferences.interestOnlyTerm ? loanPreferences.interestOnlyTerm > 0 : false,
      loanPreferences.interestRateType === 'FIXED',
      loanPreferences.fixedTerm || 0,
      loanPreferences.loanFeatureType || 'redraw'
    );
    console.log('Selected product for LVR:', product ? product.productName : 'None');
    
    // Update product state
    setSelectedProduct(product);
    
    // Calculate monthly repayment
    const monthlyRepayment = calculateMonthlyRepayment(
      effectiveLoanAmount,
      product.interestRate / 100,
      loanPreferences.loanTerm || 30
    );
    console.log(`Monthly repayment: $${monthlyRepayment.toFixed(2)}`);
    
    // Update deposit and related details
    let finalPropertyValue = currentPropertyValue;
    if (propValue <= 0 && selectedPropertyValue <= 0) {
      // When no property value is provided, maintain the LVR by calculating new property value
      const initialLvr = propertyPrice > 0 && requiredLoanAmount > 0 ? 
        requiredLoanAmount / propertyPrice : 0.8;
        
      finalPropertyValue = Math.round(effectiveLoanAmount / initialLvr);
    }
    
    // Calculate stamp duty
    const depositComponents = depositService.calculateDepositComponents(
      finalPropertyValue,
      propertyState,
      isFirstHomeBuyer,
      isInvestmentProperty
    );
    
    // Use the DEFAULT_UPFRONT_COSTS for consistency
    const upfrontCosts = DEFAULT_UPFRONT_COSTS;
    
    // Calculate deposit amount
    const depositAmount = finalPropertyValue - effectiveLoanAmount;
    
    // Update state with deposit details
    setSelectedPropertyValue(finalPropertyValue);
    setSelectedDepositAmount(depositAmount);
    setSelectedStampDuty(depositComponents.stampDuty);
    setSelectedUpfrontCosts(depositComponents.legalFees + depositComponents.otherUpfrontCosts);
    
    // Update monthly repayment state
    setSelectedMonthlyRepayment(monthlyRepayment);
    
    // Update selected loan amount last
    setSelectedLoanAmount(effectiveLoanAmount);
    
    console.timeEnd('updateDerivedValues');
  }, [
    selectedPropertyValue,
    isInvestmentProperty,
    loanPreferences,
    propertyPrice,
    requiredLoanAmount,
    propertyState,
    isFirstHomeBuyer,
    maxBorrowingPower,
    savings
  ]);

  // Effect for handling slider updates - separated from serviceability calculation
  useEffect(() => {
    if (debouncedLoanAmount && maxBorrowingPower > 0) {
      logDebug(`Updating UI for selected loan amount: ${formatCurrency(debouncedLoanAmount)}`);
      updateDerivedValues(debouncedLoanAmount, 0);
    }
  }, [debouncedLoanAmount, maxBorrowingPower]);

  // Effect for serviceability calculation
  useEffect(() => {
    // Skip if we don't have required inputs
    if (!propertyPrice && !savings && !baseInterestRate && !financials) {
      logDebug('[SCENARIOS] Missing required inputs, skipping calculation');
      return;
    }
    
    if (!loanProductDetails) {
      logDebug('[SCENARIOS] Missing loan product details, cannot proceed');
      return;
    }
    
    const calculateBorrowingPower = async () => {
      try {
        setError(null);
        setIsCalculating(true);
        
        const startTime = performance.now();
        tracingService.startTimer('maxBorrowing_total');
        
        logDebug('[SCENARIOS] Starting max borrowing calculation');
        const result = await calculateMaxBorrowing(
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
        const calculationTimeMs = endTime - startTime;
        
        logDebug(`[SCENARIOS] Max borrowing calculation result: ${formatCurrency(result.maxBorrowAmount)}`);
        logDebug(`[SCENARIOS] Required loan amount: ${formatCurrency(requiredLoanAmount)}`);
        
        setMaxBorrowingPower(result.maxBorrowAmount);
        setIsCalculating(false);
        
        const meetsRequirement = requiredLoanAmount > 0 
          ? result.maxBorrowAmount >= requiredLoanAmount
          : false;
          
        logDebug(`[SCENARIOS] Meets requirement? ${meetsRequirement}`);
        setLoanAmountRequiredMet(meetsRequirement);
        
        // Set initial loan amount based on requirements:
        // If required loan exceeds max borrowing, cap at max borrowing
        // Otherwise use the required loan amount
        const initialLoanAmount = requiredLoanAmount > result.maxBorrowAmount 
          ? result.maxBorrowAmount 
          : requiredLoanAmount;
        
        logDebug(`[SCENARIOS] Setting initial loan amount to: ${formatCurrency(initialLoanAmount)}`);
        setSelectedLoanAmount(initialLoanAmount);
        
        // Update derived values based on the selected loan amount
        updateDerivedValues(initialLoanAmount, propertyPrice);
        
        // Once we have max borrowing, calculate the improvement scenarios
        if (requiredLoanAmount > 0 && !meetsRequirement) {
          logDebug('[SCENARIOS] Calculating improvement scenarios - conditions met:');
          logDebug(`- Required loan: ${formatCurrency(requiredLoanAmount)}`);
          logDebug(`- Max borrowing: ${formatCurrency(result.maxBorrowAmount)}`);
          logDebug(`- Shortfall: ${formatCurrency(requiredLoanAmount - result.maxBorrowAmount)}`);
          logDebug(`- Constraint reason: ${result.maxBorrowAmountReason}`);
          logDebug(`- Meets requirement? ${meetsRequirement}`);
          logDebug(`- Current improvement scenarios: ${improvementScenarios.length}`);
          
          const scenariosStart = performance.now();
          
          try {
            // Use the capped loan amount to calculate improvement scenarios
            // This prevents errors when required loan amount is much larger than max borrowing
            const cappedRequiredLoanAmount = Math.min(requiredLoanAmount, result.maxBorrowAmount * 1.5);
            logDebug(`- Using capped required loan amount: ${formatCurrency(cappedRequiredLoanAmount)}`);
            
            const scenarios = await calculateImprovementScenarios(
              financials,
              result,
              loanProductDetails,
              savings,
              propertyPrice,
              propertyState,
              propertyPostcode,
              isFirstHomeBuyer,
              isInvestmentProperty,
              cappedRequiredLoanAmount,
              loanPreferences
            );
            
            const scenariosEnd = performance.now();
            
            logDebug(`[SCENARIOS] Generated ${scenarios.length} scenarios:`);
            scenarios.forEach(scenario => {
              logDebug(`- ${scenario.type}: ${scenario.title} (Impact: ${formatCurrency(scenario.impact)})`);
            });
            
            setImprovementScenarios(scenarios);
            setLoanAmountRequiredMet(false); // Ensure this is set correctly
            logDebug(`[SCENARIOS] State updates:`);
            logDebug(`- Setting improvementScenarios.length to ${scenarios.length}`);
            logDebug(`- Setting loanAmountRequiredMet to false`);
            
            setCalculationMetrics({
              maxBorrowingTime: calculationTimeMs,
              scenariosTime: scenariosEnd - scenariosStart
            });
          } catch (error) {
            console.error('[SCENARIOS] Error calculating improvement scenarios:', error);
            setError('Error calculating improvement scenarios. Please try again.');
          }
        } else {
          logDebug('[SCENARIOS] Skipping improvement scenarios - conditions not met:');
          logDebug(`- Required loan amount > 0? ${requiredLoanAmount > 0}`);
          logDebug(`- Required loan amount: ${formatCurrency(requiredLoanAmount)}`);
          logDebug(`- Meets requirement? ${meetsRequirement}`);
          logDebug(`- Max borrowing: ${formatCurrency(result.maxBorrowAmount)}`);
          setImprovementScenarios([]);
        }
      } catch (error) {
        console.error('[SCENARIOS] Max borrowing calculation error:', error);
        setError('Unable to calculate borrowing power. Please try again.');
        setIsCalculating(false);
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

  // Add debug logging for render conditions
  useEffect(() => {
    logDebug('[RENDER] Improvement suggestions render conditions:');
    logDebug(`- Loan amount required met? ${loanAmountRequiredMet}`);
    logDebug(`- Number of scenarios: ${improvementScenarios.length}`);
    logDebug(`- Will render? ${!loanAmountRequiredMet && improvementScenarios.length > 0}`);
    
    if (improvementScenarios.length > 0) {
      logDebug('[RENDER] Current scenarios:');
      improvementScenarios.forEach(scenario => {
        logDebug(`- ${scenario.type}: ${scenario.title} (Applied: ${appliedScenarios.includes(scenario.id)})`);
      });
    }
  }, [loanAmountRequiredMet, improvementScenarios, appliedScenarios]);

  // Info message to display
  const infoBox = getCustomerMessage(loanAmountRequiredMet, maxBorrowingPower, requiredLoanAmount);

  // Toggle improvement scenario
  const toggleImprovementScenario = useCallback((scenario: ImprovementScenario) => {
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
    } else {
      // Apply the scenario
      setAppliedScenarios(prev => [...prev, scenario.id]);
      
      // Update borrowing power with the impact
      setMaxBorrowingPower(prev => prev + scenario.impact);
      setAffordabilityScenarioUsed(true);
    }
  }, [appliedScenarios, selectedLoanAmount, updateDerivedValues]);

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
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
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
                
                {/* Financial details section */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Property Amount
                      <FinancialTooltip 
                        title="Property Amount" 
                        content="The total cost of the property. This value changes based on your loan amount selection and available savings."
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

                {/* Loan Slider */}
                <Box sx={{ px: 1, mb: 1 }}>
                  <Slider
                    value={selectedLoanAmount}
                    onChange={(_, value) => setSelectedLoanAmount(value as number)}
                    min={Math.max(GLOBAL_LIMITS.MIN_LOAN_AMOUNT, maxBorrowingPower * 0.5)}
                    max={maxBorrowingPower}
                    step={10000}
                    aria-labelledby="loan-amount-slider"
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => formatCurrency(value)}
                    marks={[
                      { value: Math.max(GLOBAL_LIMITS.MIN_LOAN_AMOUNT, maxBorrowingPower * 0.5), label: '' },
                      // Only show required loan mark if it's within the valid range
                      ...(requiredLoanAmount >= Math.max(GLOBAL_LIMITS.MIN_LOAN_AMOUNT, maxBorrowingPower * 0.5) && 
                         requiredLoanAmount <= maxBorrowingPower 
                         ? [{ value: requiredLoanAmount, label: 'Required' }] 
                         : []),
                      { value: maxBorrowingPower, label: '' }
                    ]}
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
              </CardContent>
            </Card>
          </Fade>

          {selectedProduct && (
            <Fade in={true} timeout={900}>
              <Box>
                <LoanProductCard
                  product={selectedProduct}
                  showLoanAmount={true}
                />
              </Box>
            </Fade>
          )}

          {/* Improvement Suggestions - Only shown when needed */}
          <Fade in={!loanAmountRequiredMet && improvementScenarios.length > 0} timeout={1000} unmountOnExit>
            <Box>
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
        </>
      )}
    </CardContainer>
  );
} 