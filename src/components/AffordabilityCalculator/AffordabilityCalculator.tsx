import { useState, useEffect, useRef, useCallback, useMemo, useTransition, startTransition } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
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
  Button,
  Grid,
  Chip,
  Stack,
  Alert
} from '@mui/material';
import { ExpandMore, BugReport, Download, Bed as BedIcon, Bathtub as BathtubIcon, DirectionsCar as DirectionsCarIcon, Home as HomeIcon, Apartment as ApartmentIcon, HomeWork as HomeWorkIcon, SquareFoot as SquareFootIcon } from '@mui/icons-material';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { ImprovementSuggestions } from './ImprovementSuggestions';
import { calculateMaxBorrowing } from '../../logic/maxBorrow/adapter';
import { MaxBorrowingResult, ImprovementScenario } from '../../types/FinancialTypes';
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

// Property card styled components
const PropertyCard = styled(Card)(({ theme }) => ({
  borderRadius: "4px",
  overflow: "hidden",
  height: "100%", // Ensure all cards have the same height
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
  },
}));

const PropertyImage = styled(CardMedia)(({ theme }) => ({
  height: "160px", // Fixed height for all images
  objectFit: "cover",
  objectPosition: "center",
}));

const PropertyFeature = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginRight: theme.spacing(1.5),
  "& svg": {
    fontSize: "1rem",
    marginRight: theme.spacing(0.5),
    color: theme.palette.text.secondary,
  },
  "& .MuiTypography-root": {
    fontSize: "0.8rem",
    color: theme.palette.text.secondary,
  },
}));

const ValuationChip = styled(Chip)(({ theme }) => ({
  backgroundColor: "#F5F0FF", // Light purple background
  color: "#4C108C", // Deep purple text
  fontWeight: 600,
  fontSize: "0.85rem",
  height: "28px",
  "& .MuiChip-label": {
    padding: "0 10px",
  },
}));

// Property interface
interface Property {
  id: number;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  landSize?: number;
  buildingSize?: number;
  propertyType: "house" | "apartment" | "townhouse";
  valuation: number;
  imageUrl: string;
}

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
  maxBorrowResult?: MaxBorrowingResult;
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
  maxBorrowResult,
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
    // Force the value to never exceed maxBorrowingPower
    const newValue = Math.min(
      Array.isArray(value) ? value[0] : value, 
      maxBorrowingPower || requiredLoanAmount
    );
    
    logDebug(`[SLIDER] Value changed: ${formatCurrency(newValue)} (capped to max: ${formatCurrency(maxBorrowingPower)})`);
    
    // Immediate update of loan amount
    setSelectedLoanAmount(newValue);
    
    // Always update product details with transition
    startTransition(() => {
      updateDerivedValues(newValue);
    });
  }, [maxBorrowingPower, updateDerivedValues, requiredLoanAmount]);

  // Safety check effect to ensure selectedLoanAmount never exceeds maxBorrowingPower
  // This has the highest priority and runs after any other state changes
  useEffect(() => {
    if (maxBorrowingPower > 0 && selectedLoanAmount > maxBorrowingPower) {
      logDebug(`[SAFETY] Loan amount exceeds max borrowing power - forcing correction`);
      logDebug(`  - Current loan: ${formatCurrency(selectedLoanAmount)}`);
      logDebug(`  - Max allowed: ${formatCurrency(maxBorrowingPower)}`);
      
      // Force the loan amount to respect the maximum borrowing power
      unstable_batchedUpdates(() => {
        setSelectedLoanAmount(maxBorrowingPower);
        setDebouncedLoanAmount(maxBorrowingPower);
      });
      
      // Update derived values with correct loan amount
      updateDerivedValues(maxBorrowingPower);
    }
  }, [selectedLoanAmount, maxBorrowingPower, updateDerivedValues]);

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

  // High priority effect to handle maxBorrowResult 
  // This must run before other calculation effects
  useEffect(() => {
    if (maxBorrowResult) {
      logDebug('[MAX_BORROW] Received external maxBorrowResult');
      
      // Use the result from the parent component
      const maxBorrowAmount = maxBorrowResult.maxBorrowAmount;
      setMaxBorrowingPower(maxBorrowAmount);
      
      // Determine if the required loan is affordable
      const isAffordable = maxBorrowAmount >= requiredLoanAmount;
      setLoanAmountRequiredMet(isAffordable);
      
      // Force the loan amount to respect the max borrow limit
      // This is critical to ensure the UI shows the correct value
      const initialLoanAmount = isAffordable ? requiredLoanAmount : maxBorrowAmount;
      const targetPropertyValue = isAffordable ? propertyPrice : maxBorrowResult.propertyValue;
      
      // Force update the loan amount and derived values
      logDebug(`[MAX_BORROW] Forcing loan amount to: ${formatCurrency(initialLoanAmount)}`);
      logDebug(`[MAX_BORROW] Using property value: ${formatCurrency(targetPropertyValue)}`);
      
      // First set isCalculating to false to avoid race conditions
      setIsCalculating(false);
      
      // Important: Update in a single batch to prevent race conditions
      unstable_batchedUpdates(() => {
        setSelectedLoanAmount(initialLoanAmount);
        setDebouncedLoanAmount(initialLoanAmount);
        // Also set the property value directly to avoid calculation issues
        setSelectedPropertyValue(targetPropertyValue);
      });
      
      // Update property values and other derived values
      updateDerivedValues(initialLoanAmount, targetPropertyValue);
    }
  }, [maxBorrowResult, requiredLoanAmount, updateDerivedValues, propertyPrice]);

  // Calculated borrowing power using serviceability formula
  useEffect(() => {
    // Skip if we already have max borrow result from parent
    if (maxBorrowResult) {
      logDebug('[SCENARIOS] Skipping serviceability calculation - using provided maxBorrowResult');
      return;
    }
    
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
      setIsCalculating(true);
      setError(null);
      logDebug('[MAX_BORROW] Starting calculation...');
      const calculationStart = performance.now();

      try {
        // ** Correct calculateMaxBorrowing call based on definition **
        const result = await calculateMaxBorrowing(
          financials,           // 1
          loanProductDetails,  // 2
          propertyPrice,       // 3
          isInvestmentProperty, // 4
          propertyPostcode,    // 5
          savings,             // 6
          propertyState,       // 7
          isFirstHomeBuyer,    // 8
          requiredLoanAmount,  // 9
          false,               // 10 - hasOwnHomeComponent
          loanPreferences      // 11 
          // appliedScenarios - Removed: Not a parameter in the function definition
        );
        
        const calculationTimeMs = performance.now() - calculationStart;
        logDebug(`[MAX_BORROW] Calculation complete in ${calculationTimeMs.toFixed(2)}ms`);
        logDebug(`[MAX_BORROW] Result: ${JSON.stringify(result, null, 2)}`);

        // Apply scenario impact AFTER the base calculation
        const appliedImpact = appliedScenarios.reduce((totalImpact, scenarioId) => {
          // Find the scenario object corresponding to the ID 
          // (Assuming scenarios are available here, might need adjustment if they aren't yet)
          const scenario = improvementScenarios.find(s => s.id === scenarioId);
          return totalImpact + (scenario?.impact || 0);
        }, 0);

        const finalMaxBorrowing = result.maxBorrowAmount + appliedImpact;
        logDebug(`[SCENARIOS] Applied impact: ${formatCurrency(appliedImpact)}, Final Max Borrow: ${formatCurrency(finalMaxBorrowing)}`);

        setMaxBorrowingPower(finalMaxBorrowing);
        const meetsRequirement = finalMaxBorrowing >= requiredLoanAmount;
        setLoanAmountRequiredMet(meetsRequirement);
        
        // Determine the appropriate loan amount to use for derived values
        const loanAmountForDerived = meetsRequirement ? requiredLoanAmount : finalMaxBorrowing;
        updateDerivedValues(loanAmountForDerived);

        // Update selected loan amount (slider value)
        const newSelectedLoanAmount = Math.min(loanAmountForDerived, finalMaxBorrowing); 
        if (selectedLoanAmount !== newSelectedLoanAmount) {
          setSelectedLoanAmount(newSelectedLoanAmount);
          logDebug(`[UI_UPDATE] Selected loan amount updated to: ${formatCurrency(newSelectedLoanAmount)}`);
        }

        logDebug(`[SERVICEABILITY] Meets Requirement: ${meetsRequirement}`);
        logDebug(`  - Final Max Borrowing (inc scenarios): ${formatCurrency(finalMaxBorrowing)}`);
        logDebug(`  - Required Loan: ${formatCurrency(requiredLoanAmount)}`);

        // ... logging financials and property value used (from base result) ...
        if (result.maxBorrowingAmountFinancialsUsed) {
          logDebug(`[MAX_BORROW] Base Financials used: ${JSON.stringify(result.maxBorrowingAmountFinancialsUsed, null, 2)}`);
        }
        if (result.propertyValue) {
          logDebug(`[MAX_BORROW] Base Property value used: ${formatCurrency(result.propertyValue)}`);
        }

        // Calculate improvement scenarios *based on the base result* if needed
        if (requiredLoanAmount > 0 && !meetsRequirement) { 
          logDebug('[SCENARIOS] Calculating improvement scenarios - conditions met (based on final borrow amount):');
          
          const scenariosStart = performance.now();
          
          try {
            // Use the base result (before scenario impact) for scenario calculation
            const baseMaxBorrowForScenarios = result.maxBorrowAmount;
            const cappedRequiredLoanAmount = Math.min(requiredLoanAmount, baseMaxBorrowForScenarios * 1.5);
            logDebug(`- Using base max borrow for scenario calc: ${formatCurrency(baseMaxBorrowForScenarios)}`);
            logDebug(`- Using capped required loan amount: ${formatCurrency(cappedRequiredLoanAmount)}`);
            
            const scenarios = await calculateImprovementScenarios(
              financials,
              result, // Pass the base result object
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
            logDebug(`[SCENARIOS] Calculation complete in ${(scenariosEnd - scenariosStart).toFixed(2)}ms`);
            // ... rest of scenario handling ...
            setImprovementScenarios(scenarios);
            setLoanAmountRequiredMet(false); 
            // ... more logging ...
            setCalculationMetrics({
              maxBorrowingTime: calculationTimeMs, // Base calc time
              scenariosTime: scenariosEnd - scenariosStart
            });

          } catch (error) {
             // ... scenario error handling ...
             setImprovementScenarios([]);
          }
        } else {
           // ... skip scenario calculation ...
           setImprovementScenarios([]);
        }
      } catch (error) {
         // ... max borrow error handling ...
         setMaxBorrowingPower(0);
         setLoanAmountRequiredMet(false);
         setImprovementScenarios([]);
      } finally {
         // ... finally block ...
      }
    };
    
    calculateBorrowingPower();
  }, [
    // Dependencies - appliedScenarios is no longer needed here as it's handled internally now
    financials, loanProductDetails, savings, propertyPrice, propertyState, 
    propertyPostcode, isFirstHomeBuyer, isInvestmentProperty, requiredLoanAmount, 
    loanPreferences, selectedLoanAmount, updateDerivedValues, improvementScenarios // Added improvementScenarios needed for appliedImpact calc
  ]);

  // Separate effect for initial derived values setup
  useEffect(() => {
    const initialLoanAmount = requiredLoanAmount > 0 ? requiredLoanAmount : (maxBorrowingPower > 0 ? Math.min(selectedLoanAmount || maxBorrowingPower, maxBorrowingPower) : 0);
    
    if (initialLoanAmount > 0 && propertyPrice > 0) {
      logDebug(`[INIT_DERIVED] Setting up initial derived values with Loan: ${formatCurrency(initialLoanAmount)}`);
      // Call updateDerivedValues with only one argument
      updateDerivedValues(initialLoanAmount);
    } else {
      logDebug(`[INIT_DERIVED] Skipping initial derived values setup - initial loan or property price is zero.`);
    }
  }, [propertyPrice, requiredLoanAmount, maxBorrowingPower, updateDerivedValues, selectedLoanAmount]);

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
  const toggleImprovementScenario = useCallback((scenario: ImprovementScenario) => {
    // Check if this scenario is already applied
    const isAlreadyApplied = appliedScenarios.includes(scenario.id);
    let updatedAppliedScenarios: string[];

    if (isAlreadyApplied) {
      // Remove the scenario
      updatedAppliedScenarios = appliedScenarios.filter(id => id !== scenario.id);
      setAppliedScenarios(updatedAppliedScenarios);
      // Apply impact reversal immediately for calculation
      setMaxBorrowingPower(prev => prev - scenario.impact);
      setAffordabilityScenarioUsed(updatedAppliedScenarios.length > 0);
       tracingService.logUI('Scenario removed', { 
        scenarioId: scenario.id, 
        scenarioType: scenario.type,
        scenarioTitle: scenario.title 
      });
    } else {
      // Apply the scenario
      updatedAppliedScenarios = [...appliedScenarios, scenario.id];
      setAppliedScenarios(updatedAppliedScenarios);
      // Apply impact immediately for calculation
      setMaxBorrowingPower(prev => prev + scenario.impact);
      setAffordabilityScenarioUsed(true);
       tracingService.logUI('Scenario applied', { 
        scenarioId: scenario.id, 
        scenarioType: scenario.type,
        scenarioTitle: scenario.title,
        impact: scenario.impact
      });
    }

    // Re-calculate derived values after applying/removing a scenario
    const maxBorrowAfterToggle = maxBorrowingPower + (isAlreadyApplied ? -scenario.impact : scenario.impact);
    const loanAmountAfterToggle = Math.min(selectedLoanAmount, maxBorrowAfterToggle);
    // Update derived values based on the potentially adjusted loan amount
    updateDerivedValues(loanAmountAfterToggle);
    // Also update the slider if the loan amount was capped
    if (loanAmountAfterToggle < selectedLoanAmount) {
      setSelectedLoanAmount(loanAmountAfterToggle);
    }

  }, [appliedScenarios, selectedLoanAmount, maxBorrowingPower, updateDerivedValues, setAppliedScenarios, setMaxBorrowingPower, setAffordabilityScenarioUsed, setSelectedLoanAmount]);

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
          min={100000}
          max={Math.min(3000000, maxBorrowingPower || 3000000)}
          step={5000}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => formatCurrency(value)}
          disabled={isCalculating}
          sx={{
            color: "#4C108C",
            "& .MuiSlider-thumb": {
              height: 24,
              width: 24,
              backgroundColor: "#fff",
              border: "2px solid #4C108C",
              "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
                boxShadow: "0 0 0 8px rgba(76, 16, 140, 0.16)",
              },
            },
          }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {formatCurrency(100000)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatCurrency(Math.min(3000000, maxBorrowingPower || 3000000))}
          </Typography>
        </Box>
      </Box>
    );
  }, [selectedLoanAmount, maxBorrowingPower, isCalculating]);

  // Static property data
  const nearbyProperties: Property[] = [
    {
      id: 1,
      address: "12 Maple Street",
      suburb: "Suburbia",
      state: "NSW",
      postcode: "2075",
      bedrooms: 4,
      bathrooms: 2,
      parking: 2,
      landSize: 650,
      propertyType: "house",
      valuation: 875000,
      imageUrl:
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhvdXNlfGVufDB8fDB8fHww",
    },
    {
      id: 2,
      address: "8/45 Oak Avenue",
      suburb: "Suburbia",
      state: "NSW",
      postcode: "2075",
      bedrooms: 3,
      bathrooms: 2,
      parking: 1,
      buildingSize: 120,
      propertyType: "apartment",
      valuation: 650000,
      imageUrl:
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YXBhcnRtZW50fGVufDB8fDB8fHww",
    },
    {
      id: 3,
      address: "24 Pine Road",
      suburb: "Suburbia",
      state: "NSW",
      postcode: "2075",
      bedrooms: 3,
      bathrooms: 2.5,
      parking: 2,
      landSize: 450,
      propertyType: "townhouse",
      valuation: 780000,
      imageUrl:
        "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG93bmhvdXNlfGVufDB8fDB8fHww",
    },
  ];

  // Helper function for property type icon
  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case "house":
        return <HomeIcon />;
      case "apartment":
        return <ApartmentIcon />;
      case "townhouse":
        return <HomeWorkIcon />;
      default:
        return <HomeIcon />;
    }
  };

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

          {/* Affordability Comparison */}
          {maxBorrowResult && (
            <Box sx={{ mb: 3, mt: 2 }}>
              {requiredLoanAmount > maxBorrowResult.maxBorrowAmount ? (
                <Alert 
                  severity="warning" 
                  sx={{ mb: 2 }}
                >
                  Your maximum borrowing capacity ({formatCurrency(maxBorrowResult.maxBorrowAmount)}) is less than 
                  the required loan amount ({formatCurrency(requiredLoanAmount)}) for this property.
                  The slider is constrained to your maximum borrowing capacity.
                </Alert>
              ) : (
                <Alert 
                  severity="success" 
                  sx={{ mb: 2 }}
                >
                  Good news! Your maximum borrowing capacity ({formatCurrency(maxBorrowResult.maxBorrowAmount)}) exceeds 
                  the required loan amount ({formatCurrency(requiredLoanAmount)}) for this property.
                </Alert>
              )}
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: requiredLoanAmount > maxBorrowResult.maxBorrowAmount ? 'error.light' : 'success.light', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">Required Loan</Typography>
                    <Typography variant="h6">{formatCurrency(requiredLoanAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">Max Borrowing</Typography>
                    <Typography variant="h6">{formatCurrency(maxBorrowResult.maxBorrowAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">Affordable Property</Typography>
                    <Typography variant="h6">{formatCurrency(maxBorrowResult.propertyValue)}</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => {
                    // Find the MaxBorrowLogs component and scroll to it
                    const logsElement = document.getElementById('max-borrow-logs');
                    if (logsElement) {
                      logsElement.scrollIntoView({ behavior: 'smooth' });
                      // Toggle expansion if possible
                      const accordion = logsElement.querySelector('.MuiAccordion-root');
                      if (accordion) {
                        const expandButton = accordion.querySelector('.MuiAccordionSummary-expandIconWrapper');
                        if (expandButton) {
                          (expandButton as HTMLElement).click();
                        }
                      }
                    }
                  }}
                >
                  View detailed calculation logs
                </Button>
              </Box>
            </Box>
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

          {/* Property Recommendations Section */}
          <Box sx={{ mt: 4, mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: "#4C108C",
                mb: 1,
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              Properties in this suburb within your budget
            </Typography>

            <Grid container spacing={2}>
              {nearbyProperties.map((property) => (
                <Grid item xs={12} sm={4} key={property.id}>
                  <PropertyCard elevation={1}>
                    <Box sx={{ height: "160px", overflow: "hidden" }}>
                      <PropertyImage 
                        sx={{ height: 160 }}
                        image={property.imageUrl} 
                        title={property.address} 
                      />
                    </Box>
                    <CardContent sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                      <Box sx={{ mb: "auto" }}>
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            mb: 0.25,
                            fontWeight: 600,
                            color: "#260937",
                          }}
                        >
                          {property.address}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            mb: 1.5,
                            color: "#666666",
                          }}
                        >
                          {property.suburb}, {property.state} {property.postcode}
                        </Typography>

                        {/* Property Features */}
                        <Stack direction="row" flexWrap="wrap" sx={{ mb: 1.5 }} alignItems="center">
                          <PropertyFeature>
                            {getPropertyTypeIcon(property.propertyType)}
                            <Typography variant="body2">
                              {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
                            </Typography>
                          </PropertyFeature>
                          <PropertyFeature>
                            <BedIcon />
                            <Typography variant="body2">{property.bedrooms}</Typography>
                          </PropertyFeature>
                          <PropertyFeature>
                            <BathtubIcon />
                            <Typography variant="body2">{property.bathrooms}</Typography>
                          </PropertyFeature>
                          <PropertyFeature>
                            <DirectionsCarIcon />
                            <Typography variant="body2">{property.parking}</Typography>
                          </PropertyFeature>
                          {property.landSize && (
                            <PropertyFeature>
                              <SquareFootIcon />
                              <Typography variant="body2">{property.landSize}m²</Typography>
                            </PropertyFeature>
                          )}
                        </Stack>
                      </Box>

                      {/* Valuation */}
                      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                        <ValuationChip label={formatCurrency(property.valuation)} />
                      </Box>
                    </CardContent>
                  </PropertyCard>
                </Grid>
              ))}
            </Grid>
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