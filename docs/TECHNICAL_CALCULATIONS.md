# Technical Documentation: Core Calculations

## Table of Contents
1. [Serviceability Calculation](#serviceability-calculation)
2. [Max Borrowing - Financials](#max-borrowing---financials)
3. [Max Borrowing - Deposit](#max-borrowing---deposit)
4. [Max Borrowing - Combined](#max-borrowing---combined)
5. [Affordability Improvement Suggestions](#affordability-improvement-suggestions)

## Serviceability Calculation

### Overview
Serviceability determines whether a borrower can afford loan repayments based on their income, expenses, and other financial commitments.

### Calculation Steps

1. **Income Assessment**
   ```typescript
   // Annual gross income calculation
   const grossIncome = baseSalaryIncome + supplementaryIncome + rentalIncome + otherIncome;
   
   // Shaded income calculation (conservative estimate)
   const shadedIncome = {
     baseSalary: baseSalaryIncome * 1.0,      // 100% of base salary
     supplementary: supplementaryIncome * 0.8,  // 80% of supplementary
     rental: rentalIncome * 0.8,               // 80% of rental
     other: otherIncome * 0.8                  // 80% of other income
   };
   ```

2. **Expense Assessment**
   ```typescript
   // Higher of declared or HEM expenses
   const expenses = Math.max(declaredExpenses, hemAmount);
   
   // Credit commitments
   const creditCommitments = {
     otherHomeLoanRepayments: existingHomeLoanRepayments,
     otherLoanRepayments: otherLoanRepayments,
     creditCardMinimums: creditCardLimit * 0.036  // 3.6% monthly
   };
   ```

3. **Buffered Assessment**
   ```typescript
   // Apply interest rate buffer
   const bufferedRate = currentRate + 0.03;  // 3% buffer
   
   // Calculate buffered repayments
   const bufferedRepayments = calculateRepayments(loanAmount, bufferedRate);
   ```

4. **Net Position Calculation**
   ```typescript
   const netPosition = {
     monthlyIncome: shadedIncome.total / 12,
     monthlyExpenses: (expenses + bufferedRepayments + creditCommitments.total) / 12,
     surplus: (monthlyIncome - monthlyExpenses)
   };
   ```

## Max Borrowing - Financials

### Overview
Determines maximum borrowing amount based on serviceability across different LVR bands.

### LVR Bands
```typescript
const LVR_BANDS = {
  BAND_0_50: { min: 0, max: 0.50, rate: baseRate + 0.0000 },
  BAND_50_60: { min: 0.50, max: 0.60, rate: baseRate + 0.0005 },
  BAND_60_70: { min: 0.60, max: 0.70, rate: baseRate + 0.0010 },
  BAND_70_80: { min: 0.70, max: 0.80, rate: baseRate + 0.0015 },
  BAND_80_85: { min: 0.80, max: 0.85, rate: baseRate + 0.0020 }
};
```

### Calculation Steps

1. **Initial Capacity**
   ```typescript
   // Calculate initial borrowing capacity
   const initialCapacity = calculateInitialCapacity({
     netIncome: shadedIncome.total,
     expenses: expenses,
     creditCommitments: creditCommitments,
     bufferRate: baseRate + 0.03
   });
   ```

2. **LVR Band Iterations**
   ```typescript
   // Calculate max borrowing for each LVR band
   const maxBorrowingByBand = LVR_BANDS.map(band => {
     const effectiveRate = band.rate + 0.03; // Include buffer
     return calculateMaxBorrowingForBand({
       capacity: initialCapacity,
       rate: effectiveRate,
       lvrBand: band
     });
   });
   ```

3. **Final Amount**
   ```typescript
   // Take minimum of all band calculations
   const maxBorrowingFinancials = Math.min(...maxBorrowingByBand);
   ```

## Max Borrowing - Deposit

### Overview
Calculates maximum borrowing based on available deposit and LVR constraints.

### Calculation Steps

1. **Available Deposit**
   ```typescript
   // Calculate total available deposit
   const availableDeposit = savings - upfrontCosts;
   
   // Calculate stamp duty and other costs
   const stampDuty = calculateStampDuty(propertyValue, isFirstHomeBuyer);
   const upfrontCosts = calculateUpfrontCosts(propertyValue);
   ```

2. **LVR Band Calculations**
   ```typescript
   // Calculate max property value for each LVR band
   const maxPropertyByBand = LVR_BANDS.map(band => {
     return calculateMaxPropertyValue({
       deposit: availableDeposit,
       maxLvr: band.max,
       stampDuty: stampDuty,
       upfrontCosts: upfrontCosts
     });
   });
   
   // Calculate max borrowing from property values
   const maxBorrowingByBand = maxPropertyByBand.map((propertyValue, index) => {
     return propertyValue * LVR_BANDS[index].max;
   });
   ```

3. **Final Amount**
   ```typescript
   // Take minimum of all band calculations
   const maxBorrowingDeposit = Math.min(...maxBorrowingByBand);
   ```

## Max Borrowing - Combined

### Overview
Combines financial and deposit constraints to determine final maximum borrowing amount.

### Calculation Steps

1. **Global Limit Check**
   ```typescript
   const globalLimit = GLOBAL_LIMITS.MAX_BORROWING;
   ```

2. **Constraint Comparison**
   ```typescript
   const maxBorrowing = Math.min(
     globalLimit,
     maxBorrowingFinancials,
     maxBorrowingDeposit
   );
   
   const constraintReason = 
     maxBorrowing === globalLimit ? 'global' :
     maxBorrowing === maxBorrowingFinancials ? 'financials' :
     'deposit';
   ```

## Affordability Improvement Suggestions

### Overview
Generates actionable suggestions to improve borrowing power based on identified constraints.

### Scenario Types

1. **Expense Reduction**
   ```typescript
   if (declaredExpenses > hemAmount) {
     const potentialIncrease = calculateBorrowingIncrease({
       ...currentFinancials,
       expenses: hemAmount
     });
   }
   ```

2. **Credit Card Removal**
   ```typescript
   if (creditCardLimit > 0) {
     const potentialIncrease = calculateBorrowingIncrease({
       ...currentFinancials,
       creditCardLimit: 0
     });
   }
   ```

3. **Savings Increase**
   ```typescript
   const savingsIncrements = [20000, 50000, 100000];
   savingsIncrements.forEach(increment => {
     const potentialIncrease = calculateBorrowingIncrease({
       ...currentFinancials,
       savings: savings + increment
     });
   });
   ```

### Scenario Selection Logic

```typescript
// Only show scenarios that provide meaningful improvements
const meaningfulScenarios = scenarios.filter(scenario => 
  scenario.impact > 10000 && // At least $10k improvement
  scenario.impact / currentMaxBorrowing > 0.02 // At least 2% improvement
);

// Sort by impact
const sortedScenarios = meaningfulScenarios.sort((a, b) => 
  b.impact - a.impact
);
``` 