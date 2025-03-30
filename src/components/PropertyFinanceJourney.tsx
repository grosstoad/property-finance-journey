import React from 'react';
import { Box, Button, Typography, CircularProgress, Grid, useTheme, useMediaQuery } from '@mui/material';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFinancials } from '../contexts/FinancialsContext';
import { useProperty } from '../contexts/PropertyContext';
import { useLoan } from '../contexts/LoanContext';
import { LoanOptions } from './LoanOptions';
import { PurchaseCosts } from './PurchaseCosts';
import { YourFinancials } from './YourFinancials';
import { FinancialsModal } from './FinancialsModal';
import { AffordabilityCalculator } from './AffordabilityCalculator';
import { AffordabilityVisualization } from './AffordabilityVisualization';
import { AffordabilityCard } from './AffordabilityCard';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { useLoanProducts } from '../hooks/useLoanProducts';
import { LoanProductCard_New, OwnHomeLoanProductCard_New } from './LoanProductCard_New';
import { ConfigureLoanModal } from './ConfigureLoanModal';
import { calculateMaxBorrowing } from '../logic/maxBorrow/adapter';
import { MaxBorrowLogs } from './MaxBorrowLogs';
import { MaxBorrowingResult, ImprovementScenario, FinancialsInput } from '../types/FinancialTypes';
import { formatCurrency } from '../logic/formatters';
import { LoanProductDetails } from '../types/loan';
import { getProductForLvr, calculateMonthlyRepayment } from '../logic/productSelector';
import { depositService } from '../logic/depositService';
import { getLvrTier } from '../logic/productSelector';

// Let's use direct import paths for images, assuming we'll add these files later
import propertyLogo from '../assets/images/property-logo.svg';
import reaGroupLogo from '../assets/images/rea-group-logo.svg';

// Define the component props
interface PropertyFinanceJourneyProps {
  hideHeader?: boolean;
}

// Define structure for the centralized state
interface VisualisationState {
  displayPropertyValue: number;
  displayLoanAmount: number;
  displayDeposit: number;
  displayStampDuty: number;
  displayUpfrontCosts: number;
  displayLvr: number;
  displayProductDetails: LoanProductDetails | null;
  displayMonthlyRepayment: number;
  displayMinPropertyValue: number;
  displayMaxPropertyValue: number; // Iterative Max
  needsRecalculation: boolean; // Flag to trigger recalculation
}

export const PropertyFinanceJourney: React.FC<PropertyFinanceJourneyProps> = ({ hideHeader = false }) => {
  const [showFinancialsModal, setShowFinancialsModal] = useState(false);
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'loanOptions' | 'affordability'>('loanOptions');
  const [useNewComponents, setUseNewComponents] = useState(true); // Toggle between old and new components
  const [hasCalculatedAffordability, setHasCalculatedAffordability] = useState(false);
  const [maxBorrowingPower, setMaxBorrowingPower] = useState(0);
  const [maxBorrowResult, setMaxBorrowResult] = useState<MaxBorrowingResult | null>(null);
  const [showLoanProductSection, setShowLoanProductSection] = useState(false); // Added to control visibility of loan products
  const [affordabilityLogs, setAffordabilityLogs] = useState<Array<{message: string, timestamp: string}>>([]);
  const [appliedScenarios, setAppliedScenarios] = useState<string[]>([]); // State to track applied scenarios
  const [originalFinancials, setOriginalFinancials] = useState<FinancialsInput | null>(null); // State for original financials
  const [originalSavings, setOriginalSavings] = useState<number | null>(null); // Store original savings for revert
  const [visualisationState, setVisualisationState] = useState<VisualisationState | null>(null);
  const [currentSliderPropertyValue, setCurrentSliderPropertyValue] = useState<number | null>(null); // New state for slider value
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { selectedProperty, depositDetails, updateSavings } = useProperty();
  const { financials, setFinancials } = useFinancials();
  const { loanAmount, loanPurpose, isFirstHomeBuyer } = useLoan();
  const { 
    loanProductDetails,
    loanPreferences,
    updateLoanPreferences
  } = useLoanProducts();

  // Memoize the selectedProduct to prevent unnecessary re-renders
  const selectedProductForAffordability = useMemo(() => {
    // Return the product only if it exists, otherwise null
    return loanProductDetails?.athenaProduct || null;
  }, [loanProductDetails?.athenaProduct]); // Dependency is the product itself

  // Debug effect to trace data availability
  useEffect(() => {
    if (currentView === 'affordability') {
      console.log('AffordabilityCalculator debug:', {
        hasFinancials: !!financials,
        hasLoanProductDetails: !!loanProductDetails,
        loanProductDetailsStructure: loanProductDetails ? Object.keys(loanProductDetails) : 'undefined',
        hasAthenaProduct: !!(loanProductDetails?.athenaProduct)
      });
    }
  }, [currentView, financials, loanProductDetails]);

  // Calculate max borrowing power when needed
  useEffect(() => {
    if (hasCalculatedAffordability && financials && loanProductDetails) {
      calculateBorrowingPower();
    }
  }, [hasCalculatedAffordability, financials, loanProductDetails]);

  // Track affordability suggestions and their impact
  const trackAffordabilitySuggestions = (result: MaxBorrowingResult) => {
    // Log each affordability suggestion and its impact
    addAffordabilityLog('=== AFFORDABILITY SUGGESTIONS ANALYSIS ===');
    
    // Check if scenarios exist and log them
    if (result.scenarios && result.scenarios.length > 0) {
      addAffordabilityLog('Generated Scenarios:');
      result.scenarios.forEach(scenario => {
        const isApplied = result.appliedScenarioIds?.includes(scenario.id) || false;
        addAffordabilityLog(`- ${scenario.title} (Type: ${scenario.type}, Impact: ${formatCurrency(scenario.impact)}, Applied: ${isApplied})`);
      });
    } else {
      addAffordabilityLog('No improvement scenarios were generated.');
    }
    
    // Log the base max borrowing amount (without suggestions)
    if (result.baseBorrowingAmount !== undefined) {
      addAffordabilityLog(`Base borrowing amount (without suggestions): ${formatCurrency(result.baseBorrowingAmount)}`);
      addAffordabilityLog(`Final borrowing amount (potentially with applied suggestions): ${formatCurrency(result.maxBorrowAmount)}`);
      
      // Calculate total impact based on currently applied scenarios in the main state
      const appliedImpact = result.scenarios
        ?.filter(scenario => appliedScenarios.includes(scenario.id)) // Use component state `appliedScenarios`
        .reduce((sum, scenario) => sum + scenario.impact, 0) || 0;
        
      addAffordabilityLog(`Total impact of currently applied suggestions: ${formatCurrency(appliedImpact)}`);
    } else {
      addAffordabilityLog(`Current borrowing amount: ${formatCurrency(result.maxBorrowAmount)}`);
    }
  };

  // Calculate max borrowing result for logs
  useEffect(() => {
    const calculateAsync = async () => { // Wrap in async function
      console.log('[MAX_BORROW_EFFECT] Checking conditions for max borrow calculation...'); // Added log
      // Only calculate max borrowing if hasCalculatedAffordability is true (user has explicitly requested it)
      if (hasCalculatedAffordability && selectedProperty && loanProductDetails?.athenaProduct && financials && loanPreferences) {
        console.log('[MAX_BORROW_EFFECT] Conditions met. Recalculating max borrowing power...'); // Added log
        try {
          const result = await calculateMaxBorrowing( // Add await
            financials,
            loanProductDetails.athenaProduct,
            selectedProperty.valuation?.mid || 0,
            loanPurpose === 'INVESTMENT',
            selectedProperty.address.postcode,
            depositDetails?.savings || 0,
            selectedProperty.address.state,
            false, // Default to false for isFirstHomeBuyer if not available
            loanAmount?.required || 0,
            !!loanProductDetails.ownHomeProduct,
            loanPreferences
          );
          
          setMaxBorrowResult(result); // Pass the resolved result
          setMaxBorrowingPower(result.maxBorrowAmount);
          console.log("Max borrow result calculated:", result);
          
          // Track affordability suggestions using the actual result
          trackAffordabilitySuggestions(result); // Pass the resolved result

        } catch (error) {
          console.error('Error calculating max borrowing:', error);
          setMaxBorrowResult(null);
        }
      } else {
        // Only log when dependencies change significantly
        if (selectedProperty && !hasCalculatedAffordability) {
          console.log('Not calculating max borrowing yet - waiting for user to request affordability calculation');
        }
      }
    };
    
    calculateAsync(); // Call the async function

  }, [
    hasCalculatedAffordability, // Added dependency on hasCalculatedAffordability
    financials, // Revert: Remove stringify
    selectedProperty, // Revert: Remove stringify
    loanPurpose 
    // REMOVED: loanPreferences, loanProductDetails, depositDetails, loanAmount
  ]);

  const calculateBorrowingPower = () => {
    console.log('This method is deprecated - calculation is now done directly in handleFinancialsSubmit');
  };

  // Effect to store original financials when affordability is first calculated
  useEffect(() => {
    // Store the initial financials state only once when affordability is first calculated
    if (hasCalculatedAffordability && financials && !originalFinancials) {
      console.log('[Original Financials] Storing initial financials state used for scenario reverts.');
      setOriginalFinancials({ ...financials }); // Store a copy
    }
    // Optional: Consider if/when originalFinancials should be reset, e.g., if user re-submits financials entirely.
    // else if (!hasCalculatedAffordability && originalFinancials) { // Example reset condition
    //   console.log('[Original Financials] Resetting stored financials.');
    //   setOriginalFinancials(null);
    // }
  }, [hasCalculatedAffordability, financials, originalFinancials]);

  // Add a log entry with timestamp
  const addAffordabilityLog = (message: string) => {
    const timestamp = new Date().toISOString();
    setAffordabilityLogs(prev => [...prev, { message, timestamp }]);
    console.log(`[Affordability Log] ${timestamp}: ${message}`);
  };

  // Log initial state
  useEffect(() => {
    addAffordabilityLog(`Initial state - hasCalculatedAffordability: ${hasCalculatedAffordability}`);
    addAffordabilityLog(`Has financials: ${!!financials}`);
    addAffordabilityLog(`Has loan product details: ${!!loanProductDetails?.athenaProduct}`);
    
    // Log financials structure if available
    if (financials) {
      addAffordabilityLog(`Financials structure: ${JSON.stringify(Object.keys(financials))}`);
      addAffordabilityLog(`Applicant type: ${financials.applicantType}`);
      addAffordabilityLog(`Number of dependents: ${financials.numDependents}`);
    }
    
    // Log loan product details if available
    if (loanProductDetails) {
      addAffordabilityLog(`Loan product details available: ${!!loanProductDetails.athenaProduct}`);
      if (loanProductDetails.athenaProduct) {
        addAffordabilityLog(`Interest rate: ${loanProductDetails.athenaProduct.interestRate}`);
      }
    }
  }, []);

  // Log when calculation affordability is changed
  useEffect(() => {
    addAffordabilityLog(`hasCalculatedAffordability changed to: ${hasCalculatedAffordability}`);
    
    if (hasCalculatedAffordability) {
      addAffordabilityLog('Affordability calculation has been triggered');
      
      // Log conditions for calculation
      const canCalculate = !!financials && !!loanProductDetails?.athenaProduct;
      addAffordabilityLog(`Can calculate affordability: ${canCalculate}`);
      
      if (!financials) {
        addAffordabilityLog('Calculation blocked: Financials missing');
      }
      
      if (!loanProductDetails?.athenaProduct) {
        addAffordabilityLog('Calculation blocked: Loan product details missing');
      }
    }
  }, [hasCalculatedAffordability]);
  
  // Log when financials change
  useEffect(() => {
    if (financials) {
      addAffordabilityLog('Financials have been updated');
      addAffordabilityLog(`Applicant type: ${financials.applicantType}`);
      
      // Check if calculation should be triggered
      if (hasCalculatedAffordability && loanProductDetails?.athenaProduct) {
        addAffordabilityLog('Financials change triggers calculation');
      }
    }
  }, [financials]);
  
  // Log when loan product details change
  useEffect(() => {
    if (loanProductDetails) {
      addAffordabilityLog('Loan product details have been updated');
      addAffordabilityLog(`Has Athena product: ${!!loanProductDetails.athenaProduct}`);
      
      // Check if calculation should be triggered
      if (hasCalculatedAffordability && financials) {
        addAffordabilityLog('Loan product details change triggers calculation');
      }
    }
  }, [loanProductDetails]);

  // Log the result of max borrowing calculation
  useEffect(() => {
    if (maxBorrowingPower) {
      addAffordabilityLog(`Max borrowing power calculated: ${maxBorrowingPower}`);
    }
  }, [maxBorrowingPower]);

  // Update handleCalculateAffordability to log the user action
  const handleCalculateAffordability = () => {
    addAffordabilityLog('User clicked "Calculate my affordability" button');
    setShowFinancialsModal(true);
  };

  // Update handleFinancialsSubmit to be async and await the calculation
  const handleFinancialsSubmit = async () => { // Make async
    // First, close the modal
    setShowFinancialsModal(false);
    
    // Log that we're calculating
    console.log('Calculating affordability...');
    
    // Immediately mark that we've calculated affordability 
    setHasCalculatedAffordability(true);
    
    // Check if we have required data
    if (!selectedProperty || !financials || !loanProductDetails?.athenaProduct) {
      console.error('Missing required data for borrowing calculation');
      return;
    }
    
    // Get the necessary values directly
    const propertyValue = selectedProperty.valuation?.mid || 0;
    const savingsAmount = depositDetails?.savings || 0;
    const requiredAmount = Math.max(loanAmount?.required || 100000, 100000);
    
    // Additional property value check
    if (propertyValue <= 0) {
      console.error('Invalid property value:', propertyValue);
      return;
    }
    
    // Calculate borrowing power directly
    try {
      const result = await calculateMaxBorrowing( // Add await
        financials,
        loanProductDetails.athenaProduct,
        propertyValue,
        loanPurpose === 'INVESTMENT',
        selectedProperty.address.postcode,
        savingsAmount,
        selectedProperty.address.state,
        isFirstHomeBuyer,
        requiredAmount,
        false,
        loanPreferences
      );
      
      setMaxBorrowResult(result); // Pass the resolved result
      
      // Set the max borrowing power immediately
      if (result && result.maxBorrowAmount > 0) {
        setMaxBorrowingPower(result.maxBorrowAmount);
        console.log('Max borrowing power: ' + result.maxBorrowAmount);
      } else {
        // Fallback to 80% of property value
        setMaxBorrowingPower(propertyValue * 0.8);
      }
      
      // Scroll to the section after a short delay to ensure the UI has updated
      setTimeout(() => {
        const section = document.getElementById('affordability-section');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (error) {
      console.error('Error calculating borrowing power:', error);
      // Fallback to 80% of property value
      setMaxBorrowingPower(propertyValue * 0.8);
    }
  };

  const handleShowLoanOptions = () => {
    setCurrentView('loanOptions');
  };

  const handleOpenFinancialsModal = () => {
    setShowFinancialsModal(true);
  };
  
  const handleConfigureClick = () => {
    setIsConfigureModalOpen(true);
  };
  
  const handleCloseConfigureModal = () => {
    setIsConfigureModalOpen(false);
  };
  
  const handlePreferencesChange = async (newPreferences: typeof loanPreferences) => {
    console.log("[handlePreferencesChange] Updating preferences:", newPreferences);
    updateLoanPreferences(newPreferences); // Update state first
    // NO MORE MANUAL RECALCULATION HERE - rely on the useEffect above reacting to loanPreferences change
  };

  // Handler for applying/removing affordability improvement suggestions
  const handleApplySuggestion = useCallback((scenario: ImprovementScenario) => {
    const isApplied = appliedScenarios.includes(scenario.id);
    let updatedFinancials = { ...financials }; // Create a copy

    console.log(`Suggestion clicked: ${scenario.title}, Currently Applied: ${isApplied}`);
    
    // Check if original financials/savings are available for reverting
    if (isApplied) {
       if (scenario.type !== 'SAVINGS' && !originalFinancials) {
        console.error("Cannot revert scenario: Original financials data is missing.");
        return; // Prevent further action
      }
       if (scenario.type === 'SAVINGS' && originalSavings === null) {
         console.error("Cannot revert savings scenario: Original savings amount is missing.");
         return; // Prevent further action
       }
    } else {
       // Store original values *before* applying if not already stored
       if (scenario.type !== 'SAVINGS' && !originalFinancials) {
         setOriginalFinancials(financials); // Store current financials
         console.log('Storing original financials before applying scenario.');
       }
       if (scenario.type === 'SAVINGS' && originalSavings === null && depositDetails?.savings) {
         setOriginalSavings(depositDetails.savings); // Store current savings
         console.log(`Storing original savings (${depositDetails.savings}) before applying scenario.`);
       }
    }


    // Modify the financials copy or call context updates based on the scenario type
    switch (scenario.type) {
      case 'CREDIT': // Example: Close Credit Cards
        if (isApplied) {
          // Revert: Use stored original value
          if (originalFinancials) { // Check again for type safety
            updatedFinancials.liabilities.creditCardLimit = originalFinancials.liabilities.creditCardLimit;
            console.log(`Reverting credit card limit to original: ${originalFinancials.liabilities.creditCardLimit}`);
          } else {
             console.error("Revert failed: Original financials missing despite initial check.");
             return; 
          }
        } else {
          // Apply: Set limit to 0
          console.log(`Applying scenario: Setting credit card limit to 0`);
          updatedFinancials.liabilities.creditCardLimit = 0;
        }
        break; // Make sure break is here
      case 'EXPENSES':
         if (isApplied) {
          if (originalFinancials) {
            // Access living expenses within liabilities object
            updatedFinancials.liabilities.expenses.value = originalFinancials.liabilities.expenses.value;
            console.log(`Reverting living expenses to original value: ${originalFinancials.liabilities.expenses.value}`);
            // Frequency likely doesn't change, but could restore if needed:
            // updatedFinancials.liabilities.expenses.frequency = originalFinancials.liabilities.expenses.frequency;
          } else { return; } // Error handling
        } else {
          console.log(`Applying scenario: Reducing living expenses. Impact on borrowing power: ${scenario.impact}`); // Log impact
          // FIXME: Scenario needs to provide the actual *amount* to change expenses by, not just borrowing impact.
          // Assuming a placeholder reduction for now - THIS NEEDS TO BE FIXED WITH REAL SCENARIO DATA
          // Reduce expenses value
          // const currentExpenses = updatedFinancials.liabilities.expenses.value || 0;
          // const expenseReductionAmount = scenario.value || 500; // ERROR: scenario.value doesn't exist
          // updatedFinancials.liabilities.expenses.value = Math.max(0, currentExpenses - expenseReductionAmount); 
          // console.log(`Reducing expenses from ${currentExpenses} to ${updatedFinancials.liabilities.expenses.value}`);
          // Temporarily removing modification until actual expense reduction amount is available
         }
        break; // Make sure break is here
       // Add other cases as needed (SAVINGS, INCOME)
       // Ensure they use originalFinancials for reverting

      case 'SAVINGS': { // Add SAVINGS case
        // We need the specific amount the savings changes by.
        // Parse it from the title. Example: "Increase savings by $20,000"
        const increaseMatch = scenario.title.match(/\\$([\d,]+)/);
        // Use parsed title amount
        const increaseAmount = increaseMatch ? parseInt(increaseMatch[1].replace(/,/g, ''), 10) : 0;

        if (increaseAmount === 0) {
           console.error("Could not determine savings increase amount from scenario title:", scenario.title);
           return; // Don't proceed if amount is unknown
        }

        const currentSavings = depositDetails?.savings;
        if (typeof currentSavings !== 'number') {
           console.error("Cannot apply savings scenario: Current savings is not available.");
           return; // Need current savings
        }

        if (isApplied) {
          // Revert: Use stored original value
          if (originalSavings !== null) {
            console.log(`Reverting savings to original: ${originalSavings}`);
            updateSavings(originalSavings);
             // Clear original savings after reverting this specific type
             setOriginalSavings(null);
          } else {
             console.error("Revert failed: Original savings missing despite initial check.");
             return; 
          }
        } else {
          // Apply: Add increase amount to current savings
          const newSavings = currentSavings + increaseAmount;
          console.log(`Applying scenario: Increasing savings from ${currentSavings} to ${newSavings}`);
          updateSavings(newSavings);
           // Ensure original savings is stored if applying for the first time
           if (originalSavings === null) {
             setOriginalSavings(currentSavings);
           }
        }
        // *** IMPORTANT: We are NOT modifying updatedFinancials for SAVINGS ***
        // We use updateSavings which triggers context updates and recalculations elsewhere.
        break; // Add break for SAVINGS case
      }

      default:
        console.warn(`Scenario type ${scenario.type} not implemented yet for applying.`);
        // Don't modify financials or update applied scenarios if type not handled for apply/revert logic
        return; 
    }

    // If the scenario type was handled (not default case):
    // Update the main financials state in context *only if* it was modified (i.e., not SAVINGS)
    if (scenario.type !== 'SAVINGS') {
      setFinancials(updatedFinancials);
    }

    // Update the list of applied scenarios
    if (isApplied) {
      setAppliedScenarios(prev => prev.filter(id => id !== scenario.id));
      console.log(`Scenario ${scenario.id} removed.`);
       // If all scenarios are removed, clear originalFinancials and originalSavings
       if (appliedScenarios.length === 1) { 
         setOriginalFinancials(null);
         setOriginalSavings(null); // Also clear original savings
         console.log("Last scenario removed, clearing original state stores.");
       }
    } else {
      setAppliedScenarios(prev => [...prev, scenario.id]);
      console.log(`Scenario ${scenario.id} applied.`);
    }
    
    // Note: The useEffect hook that depends on `financials` OR context changes triggered 
    // by `updateSavings` will automatically trigger the recalculation.

  }, [
    financials, 
    setFinancials, 
    appliedScenarios, 
    originalFinancials, 
    updateSavings, 
    depositDetails, 
    originalSavings, 
    setOriginalSavings, // Add setter 
    setOriginalFinancials // Add setter
  ]); // Corrected dependency array syntax

  // Handler for slider updates from AffordabilityCard_2
  const handleSliderPropertyValueChange = useCallback((newValue: number) => {
    console.log(`[PFJ] Slider value changed: ${newValue}`);
    setCurrentSliderPropertyValue(newValue);
    // Note: We don't directly trigger calculateVisualisationState here.
    // Instead, we'll modify calculateVisualisationState to use currentSliderPropertyValue if available.
  }, []); // No complex dependencies needed

  // *** Central Calculation Function ***
  const calculateVisualisationState = useCallback((): VisualisationState | null => {
    console.log("[calculateVisualisationState] Running calculation...");

    // Check prerequisites first (excluding basePropertyValueForCalc initially)
    if (!hasCalculatedAffordability || !financials || !selectedProperty || !depositDetails || maxBorrowingPower <= 0) {
        console.log("[calculateVisualisationState] Missing primary prerequisites, returning null.", {
            hasCalculatedAffordability,
            financials: !!financials,
            selectedProperty: !!selectedProperty,
            depositDetails: !!depositDetails,
            maxBorrowingPower
        });
        return null; // Not ready to calculate
    }

    // --- Recalculate Max Affordable Property Value (Iterative) ---
    // This remains the same, calculating the *theoretical max*
    let iterativeMaxPropValue = 0;
    try {
      let currentEstimate = maxBorrowingPower + depositDetails.savings;
      let previousEstimate = 0;
      let iterations = 0;
      while (Math.abs(currentEstimate - previousEstimate) > 100 && iterations < 10) {
        previousEstimate = currentEstimate;
        const costs = depositService.calculateDepositComponents(currentEstimate, selectedProperty.address.state, isFirstHomeBuyer, loanPurpose === 'INVESTMENT');
        const availableDeposit = Math.max(0, depositDetails.savings - (costs.stampDuty + costs.legalFees + costs.otherUpfrontCosts));
        currentEstimate = maxBorrowingPower + availableDeposit;
        iterations++;
      }
      iterativeMaxPropValue = currentEstimate;
      console.log(`[calculateVisualisationState] Iterative Max Prop Value: ${formatCurrency(iterativeMaxPropValue)}`)
    } catch (error) {
      console.error("Error calculating iterative max property value:", error);
      iterativeMaxPropValue = selectedProperty.valuation.mid * 1.2; // Fallback
    }

    // --- Determine Initial Display Property Value (based on affordability) ---
    const initialCosts = depositService.calculateDepositComponents(selectedProperty.valuation.mid, selectedProperty.address.state, isFirstHomeBuyer, loanPurpose === 'INVESTMENT');
    const initialAvailableDeposit = Math.max(0, depositDetails.savings - (initialCosts.stampDuty + initialCosts.legalFees + initialCosts.otherUpfrontCosts));
    const requiredLoan = Math.max(selectedProperty.valuation.mid - initialAvailableDeposit, 0);
    const isAffordable = maxBorrowingPower >= requiredLoan;
    const initialDisplayPropertyValue = isAffordable ? selectedProperty.valuation.mid : iterativeMaxPropValue;
    console.log(`[calculateVisualisationState] Initial Affordable: ${isAffordable}, Initial Display Prop Value: ${formatCurrency(initialDisplayPropertyValue)}`);

    // --- Determine Property Value to Use (Slider overrides initial) ---
    const displayPropertyValue = currentSliderPropertyValue ?? initialDisplayPropertyValue;
    console.log(`[calculateVisualisationState] Using Property Value for Calculation: ${formatCurrency(displayPropertyValue)}`);

    // --- Calculate Loan Amount (Constrained) ---
    const displayCosts = depositService.calculateDepositComponents(displayPropertyValue, selectedProperty.address.state, isFirstHomeBuyer, loanPurpose === 'INVESTMENT');
    const calculatedDeposit = Math.max(0, Math.min(depositDetails.savings - (displayCosts.stampDuty + displayCosts.legalFees + displayCosts.otherUpfrontCosts), displayPropertyValue));
    let calculatedLoanAmount = Math.max(0, displayPropertyValue - calculatedDeposit);
    calculatedLoanAmount = Math.min(calculatedLoanAmount, maxBorrowingPower);
    console.log(`[calculateVisualisationState] Display Loan Amount: ${formatCurrency(calculatedLoanAmount)}`);

    // --- Calculate Other Display Values ---
    const displayDeposit = Math.max(0, displayPropertyValue - calculatedLoanAmount - displayCosts.stampDuty - displayCosts.legalFees - displayCosts.otherUpfrontCosts);
    const displayStampDuty = displayCosts.stampDuty;
    const displayUpfrontCosts = displayCosts.legalFees + displayCosts.otherUpfrontCosts;
    const displayLvr = displayPropertyValue > 0 ? (calculatedLoanAmount / displayPropertyValue) * 100 : 0;

    // --- Get Product Details ---
    const displayProductDetails = getProductForLvr(
        displayLvr / 100,
        calculatedLoanAmount,
        loanPurpose === 'INVESTMENT',
        loanPreferences.interestOnlyTerm ? loanPreferences.interestOnlyTerm > 0 : false,
        loanPreferences.interestRateType === 'FIXED',
        loanPreferences.fixedTerm || 0,
        loanPreferences.loanFeatureType || 'redraw'
    );
    console.log(`[calculateVisualisationState] Product: ${displayProductDetails?.productName || 'None'}`);

    // --- Calculate Repayment ---
    const displayMonthlyRepayment = calculateMonthlyRepayment(
        calculatedLoanAmount,
        displayProductDetails?.interestRate, // Pass rate directly
        loanPreferences.loanTerm || 30
    );
    console.log(`[calculateVisualisationState] Repayment: ${formatCurrency(displayMonthlyRepayment)}`);

    // --- Calculate Min Property Value (Simplified) ---
    // Use displayCosts for consistency, although min value calc might need separate logic
    const displayMinPropertyValue = Math.max(100000 + depositDetails.savings - displayCosts.stampDuty, 500000); 

    return {
      displayPropertyValue,
      displayLoanAmount: calculatedLoanAmount,
      displayDeposit,
      displayStampDuty,
      displayUpfrontCosts,
      displayLvr,
      displayProductDetails,
      displayMonthlyRepayment,
      displayMinPropertyValue,
      displayMaxPropertyValue: iterativeMaxPropValue,
      needsRecalculation: false // Reset flag after calculation
    };

  }, [
      hasCalculatedAffordability,
      financials,
      selectedProperty,
      depositDetails,
      maxBorrowingPower,
      loanPurpose,
      isFirstHomeBuyer,
      loanPreferences,
      currentSliderPropertyValue
  ]);

  // *** Effect to run the central calculation ***
  useEffect(() => {
    console.log("[VisualisationEffect] Checking if calculation needed...");
    // Only run if affordability has been calculated and we have the necessary inputs
    if (hasCalculatedAffordability && financials && selectedProperty && depositDetails && maxBorrowingPower > 0) {
       console.log("[VisualisationEffect] Triggering calculation...");
       const newState = calculateVisualisationState();
       setVisualisationState(newState);
    } else {
       // Reset if conditions aren't met
       // setVisualisationState(null);
    }
    // Depend on the primary inputs that drive the calculation
  }, [
      hasCalculatedAffordability, 
      financials, 
      selectedProperty, 
      depositDetails, 
      maxBorrowingPower, 
      loanPreferences, // Recalc needed if prefs change
      calculateVisualisationState // Depend on the callback itself
    ]);

  if (!selectedProperty) {
    return null;
  }

  // Check if we have all the required data for AffordabilityCalculator
  const canShowAffordability = hasCalculatedAffordability && 
    !!financials && 
    !!selectedProductForAffordability && // Use memoized value
    maxBorrowingPower > 0; // Only show when we have a valid maxBorrowingPower value

  // Check if we need to display loan products - Redefine based on visualisationState
  const showLoanProducts = 
    showLoanProductSection && 
    visualisationState && 
    visualisationState.displayLoanAmount > 0 && 
    !!visualisationState.displayProductDetails;
  
  // Check if we're showing a Tailored product (80-85% LVR) - Redefine based on visualisationState
  const isTailoredProduct = 
    !!visualisationState && // Ensure visualisationState is not null
    visualisationState.displayLvr > 80 && 
    visualisationState.displayLvr <= 85;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Property Lending Snapshot Header - only show if hideHeader is false */}
      {!hideHeader && (
        <Box 
          sx={{ 
            width: '100%', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
            mt: 0 // Ensure no top margin
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <KeyboardBackspaceIcon 
              sx={{ mr: 2, color: '#666', fontSize: 24, cursor: 'pointer' }} 
              onClick={() => window.history.back()} // Navigate back to property search
            />
            <Typography variant="h5" component="h1" fontWeight="700" color="#333">
              Your property lending snapshot
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Powered by
            </Typography>
            <Box 
              component="img" 
              src={propertyLogo} 
              alt="Property.com.au" 
              sx={{ height: { xs: 20, md: 26 }, mr: 1 }} 
            />
            <Box 
              component="img" 
              src={reaGroupLogo} 
              alt="REA Group" 
              sx={{ height: { xs: 20, md: 26 } }} 
            />
          </Box>
        </Box>
      )}

      {/* LoanOptions temporarily removed */}
      {/* <LoanOptions 
        onCalculateAffordability={
          hasCalculatedAffordability ? undefined : handleCalculateAffordability
        } 
      /> */}

      {/* Always show Purchase Costs and Financials Grid */}
      <Box mt={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <PurchaseCosts />
          </Grid>
          <Grid item xs={12} md={6} sx={{
            display: 'flex',
            flexDirection: 'column',
            height: { xs: 'auto', md: '100%' }
          }}>
            <YourFinancials 
              onFinancialsChange={(financials) => console.log('Financials updated:', financials)} 
              onOpenModal={() => setShowFinancialsModal(true)}
            />
            
            {/* Show AffordabilityCard only if not yet calculated */}
            {!hasCalculatedAffordability && (
              <Box sx={{ 
                mt: 3,
                width: '100%', 
                display: 'flex',
                flexGrow: { xs: 0, md: 1 },
                alignItems: 'stretch',
                justifyContent: 'center',
                pb: { xs: 0, md: 2 }
              }}>
                <AffordabilityCard onClick={handleCalculateAffordability} />
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Show affordability visualization after calculation */}
      {canShowAffordability && visualisationState ? ( // Check for visualisationState
        <Box id="affordability-section">
          <AffordabilityVisualization
            key="affordability-visualization" 
            // Pass down calculated state values
            propertyPrice={visualisationState.displayPropertyValue}
            loanAmount={visualisationState.displayLoanAmount} // Pass calculated loan amount
            depositAmount={visualisationState.displayDeposit} // Pass calculated deposit
            stampDuty={visualisationState.displayStampDuty} // Pass calculated stamp duty
            upfrontCosts={visualisationState.displayUpfrontCosts} // Pass calculated costs
            lvrPercentage={visualisationState.displayLvr} // Pass calculated LVR
            productDetails={visualisationState.displayProductDetails} // Pass calculated product
            monthlyRepayment={visualisationState.displayMonthlyRepayment} // Pass calculated repayment
            minPropertyValue={visualisationState.displayMinPropertyValue} // Pass calc min
            maxPropertyValue={visualisationState.displayMaxPropertyValue} // Pass calc max
            savings={depositDetails?.savings || 0} // Keep passing raw savings if needed by child
            propertyState={selectedProperty.address.state}
            propertyPostcode={selectedProperty.address.postcode}
            isFirstHomeBuyer={isFirstHomeBuyer}
            isInvestmentProperty={loanPurpose === 'INVESTMENT'}
            requiredLoanAmount={loanAmount?.required || 0} // Keep for alert message context
            maxBorrowingPower={maxBorrowingPower} // Keep for alert message context
            financials={financials} // Keep for suggestions
            maxBorrowResult={maxBorrowResult} // Keep for suggestions
            desiredPropertyValue={selectedProperty.valuation.mid} // Pass original desired price for alert
            onEditLoanPreferences={handleConfigureClick}
            onApplySuggestion={handleApplySuggestion}
            onPropertyValueChange={handleSliderPropertyValueChange} // Pass down the new handler
            // Remove props that are now passed within the calculated state
            // baseInterestRate={...}
            // selectedProduct={...}
          />
        </Box>
      ) : hasCalculatedAffordability ? (
        // Very simple loading state - no spinner animation that causes flashing
        <Box id="affordability-section" sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Calculating your borrowing power...
          </Typography>
        </Box>
      ) : null}

      {/* Show Loan Products Display */}
      {showLoanProducts && loanProductDetails.athenaProduct && (
        <Box mt={4}>
          <Typography variant="h5" mb={2} fontWeight={600}>
            {loanProductDetails.ownHomeProduct 
              ? 'Combined loan solution' 
              : 'Recommended loan product'}
          </Typography>
          
          {loanProductDetails.ownHomeProduct ? (
            <OwnHomeLoanProductCard_New 
              athenaProduct={loanProductDetails.athenaProduct}
              ownHomeProduct={loanProductDetails.ownHomeProduct}
              onEdit={handleConfigureClick}
            />
          ) : (
            <LoanProductCard_New 
              product={loanProductDetails.athenaProduct}
              isTailored={isTailoredProduct}
              onEdit={handleConfigureClick}
            />
          )}
        </Box>
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

      <FinancialsModal
        open={showFinancialsModal}
        onClose={() => setShowFinancialsModal(false)}
        onSubmit={handleFinancialsSubmit}
      />

      {/* Add the max borrow logs at the bottom of the page */}
      {(maxBorrowResult || affordabilityLogs.length > 0) && (
        <Box sx={{ mt: 4, mx: 'auto', maxWidth: 800, px: 2 }}>
          {maxBorrowResult && (
            <MaxBorrowLogs 
              maxBorrowResult={maxBorrowResult} 
              affordabilityLogs={affordabilityLogs}
            />
          )}
          
          {/* If MaxBorrowLogs is not displayed but we have affordability logs */}
          {/* REMOVE THIS BLOCK START */}
          {/* {!maxBorrowResult && affordabilityLogs.length > 0 && (
            <Box sx={{ mt: 4, border: '1px solid #e0e0e0', borderRadius: 2, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Affordability Suggestions Debug Logs
              </Typography>
              <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
                {affordabilityLogs.map((log, index) => (
                  <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', mb: 0.5 }}>
                    [{log.timestamp.split('T')[1].split('.')[0]}] {log.message}
                  </Typography>
                ))}
              </Box>
            </Box>
          )} */}
           {/* REMOVE THIS BLOCK END */}
        </Box>
      )}
    </Box>
  );
}; 