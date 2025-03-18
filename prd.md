# PRD - Property Finance Activation Journey

# Introduction

This document outlines the requirements for the new product. It details the purpose, features, and target audience for the product.

# The Problem

* Property search and affordability are not well connected  
* Buyers find it difficult to know if they could get a loan for the properties they want with the budget and financial situation they have  
* Lenders don't provide early confidence or precision on affordability. It generally requires a more lengthy conversation or application to have more precision

# Target Audience

The target audience for this product includes:

* Users actively searching for properties but don't understand what they can afford  
* Users wanting to start their search but don't know what they can afford  
* Users with a budget actively searching but don't know they could borrow more

# User Experience

This experience can live on the website and be a 1-2 screen max flow webapp experience that results in a draft being created. Entry point is property search and progressively enriched by data provide and data the user provides

The experience will comprise of the following features

1. **Property search experience**  
   1. Property search  
   2. Search history  
   3. Skip property search  
2. **Property insights playback**  
   1. Property features  
   2. Listing details  
   3. Valuation estimate  
   4. Disclaimers and legal info  
3. **Loan options playback**  
   1. Loan deposit calculation  
   2. Loan amount required  
   3. Loan details and preferences  
   4. OwnHome integration  
4. **Capture financials**  
   1. Applicant info  
   2. Income  
   3. Liabilities and expenses  
5. **Affordability and max borrowing power playback**  
   1. Serviceability  
   2. Max borrowing (deposit)  
   3. Max borrowing (financials)  
   4. Max borrowing and loan details  
   5. Evaluation against loan amount required  
   6. OwnHome integration  
6. **Financial insights**  
   1. Outgoings visualisation  
   2. Options to improve borrowing power  
   3. Approval confidence  
7. **Saving, sharing and user activation**  
   1. PDF generation  
   2. Draft activation  
   3. Unique URL / query params (other sharing methods)  
8. **Partner hosted experience**  
   1. Embed version on 3rd party sites

# Requirements

A table for each part of the user experience  
Can also add information on capabilities

The following table outlines the specific requirements for each feature.

### **Property search experience**

* Simple entry point starting off with property search  
* No manual address entry, it needs to render a valid property address from the PropTrack API  
* Component to illustrate the proposition of the experience

| Feature | Requirement | Notes | Priority |
| :---- | :---- | :---- | :---- |
| Property search | Users can enter a property address and see a list of suggested addresses | Use PropTrack address suggest endpoint On selection use PropTrack address match to retrieve propertyId | High |
| Search history | Users can see a history of prior property addresses they've searched for easy access | Show Up to 3 prior property addresses alongside property image and last accessed date Confirm how this information is stored - local storage? | Medium |
| Skip property search | Users who do not have a property address to enter can skip adding an address | This should render a different experience without specific reference to property on the next page | Low |
| Suggested properties | Show a list of suggested properties based on contextual information such as  | If we have the IP address we could generate a list from the suburb we identify to help users who don't have a property address to enter | Low |

### **Property insights playback**

* Show only relevant insights - shouldn't take up too much space in the UI given we want users to engage on the loan options to purchase the property  
* Note - PropTrack explicitly states **we cannot show listing prices** - therefore any advertised price or range will not be visible. We need to consider how this impacts the experience given we'd be showing the valuation - which could differ from the listing price  
  * Probably worth doing sampling to see how different this is from the estimated valuation and the CoreLogic valuation  
* We should check with PropTrack on what else is permissible + requirements on legal disclaimers  
* Design needs to be mobile responsive - perhaps possible to render all this above the fold on mobile and expose the loan options section?

| Feature | Requirement | Notes | Priority |
| :---- | :---- | :---- | :---- |
| Property features | Show relevant property features Bedrooms Bathrooms Car spaces Image | Retrieve from PropTrack API | High |
| Listing details | Add indicator if it's listed Show next inspection date Show how long it's been on market for If auction show auction date Show link to listing on realestate.com.au | Retrieve from PropTrack API A different experience if this property is not listed | High |
| Valuation estimate | Show valuation estimate including Low, mid and high values Show confidence level | Retrieve from PropTrack Valuation API High priority design considerations The midpoint valuation pre-fills the property price field Check what other information available in the API relevant to valuation | High |
| Disclaimers and legal info |  | Retrieve from PropTrack API | High |

### **Loan options playback**

* Calculate the loan amount required and product to be able to purchase the property

| Feature | Requirement | Notes | Priority |
| :---- | :---- | :---- | :---- |
| Loan deposit calculation | Property price is prefilled with midpoint valuation, and is input that can be edited by the user Savings is prefilled with % of property price as default (let's go with 30% so it doesn't result in >80% loan amount automatically) Calculate stamp duty based on Loan purpose (OOC or INV) First home buyer concession Property state Property price Calculate other upfront costs based on a flat $3,000 Amount available for deposit is Savings minus stamp duty minus upfront costs The loan amount needed is Property price minus amount available for deposit | Input field visible as currency with comma separated value | High |
| Loan amount required | The loan amount needed is Property price minus amount available for deposit It is shown visually relative to the property price We disclose the LVR calculation and the maximum LVR that is available for the property based on what we lend to | Need to figure out if we don't lend to the postcode and property type Return maxLVR from based on property type and postcode from existing service (no change to existing service required) | High |
| Loan details and preferences | Show the Athena/Freedom product, interest rate, monthly repayments and loan term Default to variable principal and interest repayments, 30 year loan term Show OwnHome product, interest rate, monthly repayments and loan term If LVR based on loan amount required / property price is less than 80% Default to Straight Up Product If LVR based on loan amount required / property price is 80-85% LVR Default to Tailored 80-85% LVR product Show loan options CTA for Athena/Freedom Product If Fixed or IO selected then show reverting variable P&I repayments in smaller text If Tailored then also show fees | Loan options CTA to toggle between Interest rate type Variable Fixed - Show 1-3 year terms selectable Feature type (not applicable for Tailored) Redraw Offset Repayment type Principal and Interest Interest only - Show 1-3 year terms unless Fixed it will be the same Loan term 10-30 years Use existing rate / product service for Athena/Freedom product - no changes needed there, but need to figure out how the lookup works Need to add detail for Tailored Show fees Need to add detail for OwnHome product | High |
| OwnHome integration | If LVR based on loan amount required / property price is 85%+ LVR Default to Power Up product with loan amount at 80% LVR  Default to OwnHome product with remaining loan amount Show fees | Default OwnHome product to 15 year term at variable principal and interest payments at 13.00% Also disclose upfront costs of 1% of loan amount |  |

#### **Stamp duty JSON**

This is an illustrative example of updated stamp duty values and the introduction of a first home buyers concession

```json
{
  "metadata": {
    "version": "1.0.0",
    "lastUpdated": "2024-10-15",
    "description": "Australian Stamp Duty Calculator API Schema"
  },
  "apiEndpoint": {
    "path": "/api/calculate-stamp-duty",
    "method": "POST",
    "requestFormat": {
      "state": "String (NSW, VIC, QLD, WA, SA, TAS, ACT, NT)",
      "propertyPrice": "Number (in AUD)",
      "purpose": "String ('owner-occupied' or 'investment')",
      "firstHomeBuyer": "Boolean",
      "australianResident": "Boolean (default: true)"
    },
    "responseFormat": {
      "stampDuty": "Number (calculated stamp duty in AUD)",
      "breakdown": {
        "baseStampDuty": "Number",
        "foreignSurcharge": "Number (if applicable)",
        "concessionAmount": "Number (if applicable)",
        "finalAmount": "Number"
      },
      "thresholds": {
        "rate": "Number (applied rate)",
        "baseAmount": "Number",
        "appliedThreshold": "Number (threshold used for calculation)"
      }
    }
  },
  "rateData": {
    "NSW": {
      "thresholds": [
        {"min": 0, "max": 29999, "rate": 0.0125, "base": 0},
        {"min": 30000, "max": 1179998, "rate": 0.0150, "base": 375},
        {"min": 1179999, "max": 1454999, "rate": 0.0450, "base": 17805},
        {"min": 1455000, "max": 3040998, "rate": 0.0500, "base": 30393},
        {"min": 3040999, "max": null, "rate": 0.0550, "base": 109984}
      ],
      "firstHomeBuyer": {
        "exemptionThreshold": 800000,
        "concessionThreshold": 1000000,
        "concessionRate": "sliding-scale",
        "concessionFormula": "((1000000 - propertyPrice) / 200000) * baseStampDuty"
      },
      "foreignSurcharge": 0.08,
      "investorDifference": false
    },
    "VIC": {
      "thresholds": [
        {"min": 0, "max": 99999, "rate": 0.0140, "base": 0},
        {"min": 100000, "max": 374999, "rate": 0.0200, "base": 1400},
        {"min": 375000, "max": 599999, "rate": 0.0500, "base": 8750},
        {"min": 600000, "max": 959999, "rate": 0.0550, "base": 20000},
        {"min": 960000, "max": null, "rate": 0.0650, "base": 39800}
      ],
      "firstHomeBuyer": {
        "exemptionThreshold": 600000,
        "concessionThreshold": 750000,
        "concessionRate": "sliding-scale",
        "concessionFormula": "((750000 - propertyPrice) / 150000) * baseStampDuty"
      },
      "foreignSurcharge": 0.08,
      "investorDifference": false
    },
    "QLD": {
      "thresholds": [
        {"min": 0, "max": 4999, "rate": 0.0000, "base": 0},
        {"min": 5000, "max": 74999, "rate": 0.0150, "base": 0},
        {"min": 75000, "max": 539999, "rate": 0.0350, "base": 1050},
        {"min": 540000, "max": 999999, "rate": 0.0450, "base": 17325},
        {"min": 1000000, "max": null, "rate": 0.0575, "base": 38025}
      ],
      "firstHomeBuyer": {
        "exemptionThreshold": 550000,
        "concessionThreshold": 550000,
        "concessionRate": "full-exemption",
        "concessionFormula": null
      },
      "foreignSurcharge": 0.075,
      "investorDifference": false
    },
    "WA": {
      "thresholds": [
        {"min": 0, "max": 119999, "rate": 0.0190, "base": 0},
        {"min": 120000, "max": 149999, "rate": 0.0280, "base": 2280},
        {"min": 150000, "max": 359999, "rate": 0.0340, "base": 3120},
        {"min": 360000, "max": 724999, "rate": 0.0450, "base": 10320},
        {"min": 725000, "max": null, "rate": 0.0510, "base": 26870}
      ],
      "firstHomeBuyer": {
        "exemptionThreshold": 430000,
        "concessionThreshold": 530000,
        "concessionRate": "sliding-scale",
        "concessionFormula": "((530000 - propertyPrice) / 100000) * baseStampDuty"
      },
      "foreignSurcharge": 0.07,
      "investorDifference": false
    },
    "SA": {
      "thresholds": [
        {"min": 0, "max": 11999, "rate": 0.0000, "base": 0},
        {"min": 12000, "max": 29999, "rate": 0.0100, "base": 0},
        {"min": 30000, "max": 49999, "rate": 0.0200, "base": 180},
        {"min": 50000, "max": 99999, "rate": 0.0300, "base": 580},
        {"min": 100000, "max": 199999, "rate": 0.0350, "base": 2080},
        {"min": 200000, "max": 249999, "rate": 0.0400, "base": 5580},
        {"min": 250000, "max": 299999, "rate": 0.0450, "base": 7580},
        {"min": 300000, "max": 499999, "rate": 0.0500, "base": 9830},
        {"min": 500000, "max": null, "rate": 0.0550, "base": 19830}
      ],
      "firstHomeBuyer": {
        "exemptionThreshold": 0,
        "concessionThreshold": 0,
        "concessionRate": "none",
        "concessionFormula": null
      },
      "foreignSurcharge": 0.07,
      "investorDifference": false
    },
    "TAS": {
      "thresholds": [
        {"min": 0, "max": 2999, "rate": 0.0000, "base": 0},
        {"min": 3000, "max": 24999, "rate": 0.0175, "base": 50},
        {"min": 25000, "max": 74999, "rate": 0.0225, "base": 435},
        {"min": 75000, "max": 199999, "rate": 0.0275, "base": 1560},
        {"min": 200000, "max": 374999, "rate": 0.0350, "base": 5935},
        {"min": 375000, "max": 724999, "rate": 0.0400, "base": 12935},
        {"min": 725000, "max": null, "rate": 0.0450, "base": 26935}
      ],
      "firstHomeBuyer": {
        "exemptionThreshold": 0,
        "concessionThreshold": 0,
        "concessionRate": "none",
        "concessionFormula": null
      },
      "foreignSurcharge": 0.08,
      "investorDifference": false
    },
    "ACT": {
      "thresholds": [
        {"min": 0, "max": 199999, "rate": 0.0060, "base": 0},
        {"min": 200000, "max": 299999, "rate": 0.0230, "base": 1200},
        {"min": 300000, "max": 499999, "rate": 0.0400, "base": 3500},
        {"min": 500000, "max": 749999, "rate": 0.0550, "base": 11500},
        {"min": 750000, "max": 999999, "rate": 0.0575, "base": 25250},
        {"min": 1000000, "max": 1454999, "rate": 0.0600, "base": 39625},
        {"min": 1455000, "max": null, "rate": 0.0700, "base": 66925}
      ],
      "firstHomeBuyer": {
        "exemptionThreshold": 585000,
        "concessionThreshold": 930000,
        "concessionRate": "sliding-scale",
        "concessionFormula": "((930000 - propertyPrice) / 345000) * baseStampDuty"
      },
      "foreignSurcharge": 0.00,
      "investorDifference": false
    },
    "NT": {
      "thresholds": [
        {"min": 0, "max": 524999, "rate": 0.0000, "base": 0},
        {"min": 525000, "max": 2999999, "rate": 0.0490, "base": 0},
        {"min": 3000000, "max": null, "rate": 0.0590, "base": 121275}
      ],
      "firstHomeBuyer": {
        "exemptionThreshold": 650000,
        "concessionThreshold": 650000,
        "concessionRate": "full-exemption",
        "concessionFormula": null
      },
      "foreignSurcharge": 0.00,
      "investorDifference": false
    }
  },
  "calculationLogic": {
    "determineThreshold": "Find the threshold where propertyPrice falls between min and max values",
    "calculateBaseStampDuty": "base + rate * (propertyPrice - min)",
    "applyFirstHomeBuyerConcession": {
      "full-exemption": "If propertyPrice <= exemptionThreshold, stampDuty = 0",
      "sliding-scale": "If propertyPrice > exemptionThreshold && propertyPrice <= concessionThreshold, apply concessionFormula",
      "none": "No concession applied"
    },
    "applyForeignSurcharge": "If !australianResident, add (propertyPrice * foreignSurcharge)"
  },
  "pseudoCode": {
    "calculateStampDuty": [
      "function calculateStampDuty(state, propertyPrice, purpose, firstHomeBuyer, australianResident = true) {",
      "  const stateData = rateData[state];",
      "  if (!stateData) return { error: 'Invalid state' };",
      "",
      "  // Find applicable threshold",
      "  const threshold = stateData.thresholds.find(t => ",
      "    propertyPrice >= t.min && (t.max === null || propertyPrice <= t.max)",
      "  );",
      "",
      "  // Calculate base stamp duty",
      "  const baseStampDuty = threshold.base + threshold.rate * (propertyPrice - threshold.min);",
      "",
      "  // Apply first home buyer concession if applicable",
      "  let concessionAmount = 0;",
      "  let finalAmount = baseStampDuty;",
      "",
      "  if (firstHomeBuyer) {",
      "    const { exemptionThreshold, concessionThreshold, concessionRate } = stateData.firstHomeBuyer;",
      "",
      "    if (concessionRate === 'full-exemption' && propertyPrice <= exemptionThreshold) {",
      "      concessionAmount = baseStampDuty;",
      "      finalAmount = 0;",
      "    } else if (concessionRate === 'sliding-scale' && propertyPrice <= concessionThreshold) {",
      "      // Apply sliding scale formula - specific to each state",
      "      // This requires evaluating the formula string with propertyPrice and baseStampDuty variables",
      "      // In real implementation, this would be a function evaluating the concessionFormula",
      "      concessionAmount = ...; // Calculate based on formula",
      "      finalAmount = baseStampDuty - concessionAmount;",
      "    }",
      "  }",
      "",
      "  // Apply foreign buyer surcharge if applicable",
      "  let foreignSurcharge = 0;",
      "  if (!australianResident) {",
      "    foreignSurcharge = propertyPrice * stateData.foreignSurcharge;",
      "    finalAmount += foreignSurcharge;",
      "  }",
      "",
      "  // Apply investor difference if applicable",
      "  if (purpose === 'investment' && stateData.investorDifference) {",
      "    // Handle any investor-specific calculations",
      "    // Currently all states use same rates for investors",
      "  }",
      "",
      "  return {",
      "    stampDuty: finalAmount,",
      "    breakdown: {",
      "      baseStampDuty,",
      "      concessionAmount,",
      "      foreignSurcharge,",
      "      finalAmount",
      "    },",
      "    thresholds: {",
      "      rate: threshold.rate,",
      "      baseAmount: threshold.base,",
      "      appliedThreshold: threshold.min",
      "    }",
      "  };",
      "}"
    ]
  },
  "otherFactorsNotIncluded": [
    "Premium property or luxury taxes in some states",
    "Vacant residential land special rates",
    "Off-the-plan concessions",
    "Pensioner and seniors concessions",
    "Regional variations within states (metropolitan vs rural)",
    "Property type differences (established vs newly built)",
    "Transfer and registration fees",
    "Changes to rates after October 2024",
    "Special provisions for family farm transfers",
    "Commercial property different rates"
  ],
  "sampleRequests": [
    {
      "request": {
        "state": "NSW",
        "propertyPrice": 750000,
        "purpose": "owner-occupied",
        "firstHomeBuyer": true
      },
      "response": {
        "stampDuty": 0,
        "breakdown": {
          "baseStampDuty": 11189.25,
          "concessionAmount": 11189.25,
          "foreignSurcharge": 0,
          "finalAmount": 0
        },
        "thresholds": {
          "rate": 0.0150,
          "baseAmount": 375,
          "appliedThreshold": 30000
        }
      },
      "explanation": "First home buyer exemption applies as property is under $800,000 in NSW"
    },
    {
      "request": {
        "state": "VIC",
        "propertyPrice": 850000,
        "purpose": "investment",
        "firstHomeBuyer": false
      },
      "response": {
        "stampDuty": 36850,
        "breakdown": {
          "baseStampDuty": 36850,
          "concessionAmount": 0,
          "foreignSurcharge": 0,
          "finalAmount": 36850
        },
        "thresholds": {
          "rate": 0.0550,
          "baseAmount": 20000,
          "appliedThreshold": 600000
        }
      },
      "explanation": "Standard investor rate applies, no concessions"
    }
  ],
  "disclaimers": [
    "This API provides estimates only and should not be used for legal or financial decisions",
    "Rates are current as of October 2024",
    "Consult with a conveyancer, lawyer, or state revenue office for exact calculations",
    "Actual stamp duty payable may vary based on specific circumstances"
  ]
}
```

### **Capture financials**

* Inputs for servicing and max borrow amount (financials) calculation  
* Render this in modal or other experience that captures on one page for ease

| Feature | Requirement | Notes | Priority |
| :---- | :---- | :---- | :---- |
| Loan deposit calculation | Property price is prefilled with midpoint valuation, and is input that can be edited by the user Savings is prefilled with % of property price as default (let's go with 30% so it doesn't result in >80% loan amount automatically) Calculate stamp duty based on Loan purpose (OOC or INV) First home buyer concession Property state Property price Calculate other upfront costs based on a flat $3,000 Amount available for deposit is Savings minus stamp duty minus upfront costs The loan amount needed is Property price minus amount available for deposit | Input field visible as currency with comma separated value | High |
| Applicant info | Inputs for Number of applicants (1 or 2) Number of dependents (0-10)	 | For HEM purposes if 2 applicants they will be defacto/married | High |
| Income | Capture separately for each applicant with selectable frequencies of weekly, fortnightly, monthly, yearly Base income (default annual) Supplementary income (default annual) Other income (default annual) Rental income (default weekly) | Show a brief explanation under title to define each income type We could automatically enter the rental AVM if property purchase is Investor and have some instruction on adding rental income to this amount for other rental properties | High |
| Liabilities and expenses | If 2 applicants capture once with selectable frequencies of weekly, fortnightly, monthly, yearly Expenses (default monthly) Other home loan repayments (default monthly) Other loan repayments (default monthly) Credit card limit (no frequency applicable) | Show a brief explanation under title to define each liability and expense | High |

### **Affordability and max borrowing power playback**

* We take the inputs on financials, savings to calculate   
  * Whether we can lend the amount we presented earlier  
  * What their maximum borrowing amount is, which is the minimum of  
    * Max borrow amount based on deposit  
    * Max borrow amount based on serviceability/financials  
    * Global max borrowing power limit of $2,500,000  
* Outputs should clearly log what the amount is and what the borrowing amount constraint was based on (one of the above). This is important for reporting but also driving suggestions on improving borrowing power

Illustrative example

* Add here

| Feature | Requirement | Notes | Priority |
| :---- | :---- | :---- | :---- |
| Serviceability | Generate a monthly servicing surplus based on the financial inputs | Mostly same rules as existing service we use in property pre-qual with these changes If 2 applicants, always assume married/defacto Home loan repayments, multiply by 1.33 in lieu of applying a 2% buffer as we won't capture the interest rate. Roughly equivalent over a 25-30 year loan term - assuming it is P&I | High |
| Max borrowing (deposit) | Calculate max borrowing based on inputted savings amount and maxLVR for the property. Iterate on deposit for home loan and maxLVR until convergence is met on Deposit = Savings - Stamp duty - upfront costs Property price = Deposit / (1 - maxLVR) Max loan amount = Property price - deposit Max loan amount / property price = MaxLVR | Detailed calculation methodology below Requires maxLVR from postcode service for the property | High |
| Max borrowing (financials) | Calculate max borrowing based on serviceability surplus. Iterate on loan amount until convergence is met on Deposit = Savings - Stamp duty - upfront costs Calculated LVR band = Rate LVR band | Detailed calculation methodology below | High |
| Interest tax deduction | Include the interest tax deduction for investment purpose loans into the max borrowing (financials) calculation | Detailed calculation methodology below | Medium |
| Max borrowing and loan details | Calculate the max borrowing based on the minimum of these values Max borrowing (deposit) Max borrowing (financials) Global max borrowing (e.g. variable of $2.5M) Record which version was used for the max borrowing for the customer | Analytics tracking and knowledge of this is very important as it drives some of the financial insights and gives us value in understanding customer outcomes | High |
| Evaluation against loan amount required | Show experience to the borrow that tells them Whether we can lend the amount they need What is the maximum amount they can borrow What is the difference between this and their maximum borrowing amount Show a slider Default value is the loan amount required (if max is higher) or max (if loan amount required is higher) User can slider and it shows borrowing amount, rate and repayments User can edit loan preferences Based on the classification of overall LVR  | Try and always be positive/optimistic on the number Analytics tracking is very important See detailed table for possible outcomes based on the initial loan amount required LVR band | High |
| OwnHome integration | Specific experience that allows you to change the loan amount and it reduces the OwnHome loan amount |  | Medium |

#### **Max borrowing (deposit)**

The Problem

We need to find the maximum property price and borrowing amount given:

* Initial savings: $300,000  
* Maximum Loan-to-Value Ratio (maxLVR): a fixed percentage (e.g., 80%)  
* Stamp duty: a function of property price  
* Upfront costs: fixed amount

The Circular Dependency

The challenge is that:

1. Deposit depends on stamp duty  
2. Stamp duty depends on property price  
3. Property price depends on deposit

This creates a circular calculation that requires an iterative approach.

Mathematical Formulation

Definition of the variables and equations:

* S = Initial savings ($300,000)  
* U = Upfront costs (fixed)  
* maxLVR = Maximum allowed LVR (e.g., 0.8 or 80%)  
* P = Property price (what we're solving for)  
* SD(P) = Stamp duty as a function of property price  
* D = Deposit for home loan  
* B = Borrowing amount

The equations that must be satisfied:

1. D = S - SD(P) - U  
2. P = D / (1 - maxLVR)  
3. B = P - D  
4. B/P = maxLVR (this is our constraint)

Iterative Solution Method

1. Start with an initial guess for P (property price)  
2. Calculate SD(P) based on current P  
3. Calculate D = S - SD(P) - U  
4. Calculate new P = D / (1 - maxLVR)  
5. Calculate B = P - D  
6. Check if B/P = maxLVR (within an acceptable tolerance)  
7. If not equal, return to step 2 with the new P  
8. If equal, we've found our answer

Example Implementation

Key Conditions for Completion

For the calculation to be complete and correct, these conditions must be met:

1. Convergence: The iterative process must converge to a stable property price where further iterations don't change the result significantly.

2. Constraint Satisfaction: The final calculated LVR must equal the maximum allowed LVR (within an acceptable tolerance).

3. Stamp Duty Consistency: The stamp duty used in the final calculation must be based on the final property price.

4. Deposit Adequacy: The final deposit must be exactly:  
   * Initial savings  
   * Minus stamp duty (based on final property price)  
   * Minus upfront costs  
5. Property Price Equation: The final property price must equal the deposit divided by (1 - maxLVR).

Real-World Considerations

* Stamp duty scales are usually tiered, creating additional complexity  
* Lenders may have minimum deposit requirements beyond the LVR  
* Borrowing capacity might be limited by income rather than deposit  
* Additional fees might apply at different property price thresholds

#### **Max borrowing (financials)**

The max borrowing power calculation expressed with defined variables:

Variables

* MSS = Monthly Serviceability Surplus ($)  
* LA = Loan Amount ($)  
* PV = Property Value ($)  
* CL = Calculated LVR (%)  
* AL = Assumed LVR band (%)  
* IR = Interest Rate for the assumed LVR band (%)  
* B = Buffer rate (e.g., 2%)  
* ER = Effective Rate (IR + B) (%)  
* T = Loan Term (years)  
* PT = P&I Term (years)

**Key Equations**

1. Loan Amount Calculation: LA = PV(ER/12, PT×12, -MSS)  
2. LVR Calculation: CL = (LA ÷ PV) × 100  
3. Convergence Rule: AL_min ≤ CL ≤ AL_max  
4. Iterative Process: If CL falls outside of AL band, then:  
   * Update AL to match the correct band for CL  
   * Update IR based on new AL  
   * Recalculate ER = IR + B  
   * Recalculate LA using equation 1  
   * Recalculate CL using equation 2  
   * Check convergence rule (equation 3)  
   * Repeat until convergence rule is satisfied  
5. Final Maximum Borrowing Power: When AL_min ≤ CL ≤ AL_max, then: Maximum Borrowing Power = LA

This iterative approach continues until the calculated LVR (CL) falls within the assumed LVR band (AL), ensuring the correct interest rate is applied to determine the maximum borrowing capacity.

#### **Interest tax deduction**

Updated Variables

* MSS = Monthly Serviceability Surplus ($)  
* LA = Loan Amount ($)  
* PV = Property Value ($)  
* CL = Calculated LVR (%)  
* AL = Assumed LVR band (%)  
* IR = Interest Rate for the assumed LVR band (%)  
* B = Buffer rate (%)  
* ER = Effective Rate (IR + B) (%)  
* T = Total Loan Term (years)  
* PT = P&I Term (years)  
* MTR = Marginal Tax Rate (%)  
* ITD = Interest Tax Deduction (monthly, $)  
* AMSS = Adjusted Monthly Serviceability Surplus (including tax benefit, $)

Enhanced Equations

1. Adjusted Serviceability Calculation: AMSS = MSS + ITD  
2. Loan Amount Calculation: LA = PV(ER/12, PT×12, -AMSS)  
3. Interest Tax Deduction Calculation:  
   * For IO loans: ITD = (LA × IR) × MTR / 12  
   * For P&I loans: ITD = (Average 5-year interest × MTR) / 12  
4. LVR Calculation: CL = (LA ÷ PV) × 100  
5. Convergence Rule:  
   * **LVR Band Check**: AL_min ≤ CL ≤ AL_max  
   * **Loan Amount Stabilization**: |LA_new - LA_previous| < ε Where:  
     1. LA_new = Current iteration's calculated loan amount  
     2. LA_previous = Previous iteration's calculated loan amount  
     3. ε = Tolerance threshold (e.g., $500 or $1,000)  
6. **Combined Convergence Rule**: The calculation is complete when BOTH conditions are satisfied:  
   * LVR is within the assumed band: AL_min ≤ CL ≤ AL_max  
   * Loan amount has stabilized: |LA_new - LA_previous| < ε

#### **Evaluation against loan amount required**

As you reduce the loan amount the LVR reduces as more of the savings is available as deposit for the loan. This can change the rates as well as the product. Specifics are

* Lower LVR band reducing rate  
* Above 80% to below 80% switching from Tailored to Straight Up (can change to other <80% LVR options on loan preferences)  
* 85%+ LVR OwnHome option reducing loan amount from OwnHome loan amount first which could go to 0% which would switch you to Straight Up (can change back to Power Up on loan preferences)

We can consider what experience users have when the loan amount breaches these thresholds - important one to consider is <80% LVR overall  
The alternative is you keep the LVR constant and you have excess savings not used for stamp duty, upfront costs or deposit for home loan but this is not recommended

| Loan amount required LVR | <80% LVR | 80-85% LVR | 85%+ LVR |
| :---- | ----- | ----- | ----- |
| **Loan product to show** | Straight Up (default) Power Up Fixed | Tailored 80-85% LVR (default) | Power Up (default) OwnHome product |
| Max borrow amount outcome is greater | Do not calculate for above 80% LVR for max | Minimum loan amount of $x If slider reduces then LVR can increase putting into SU product as default (and loan details updates to see broader product selection) Do not calculate for above 85% LVR for max | Minimum loan amount of global minimum calculated for Athena loan Slider will reduce OwnHome amount first. Once below 80% LVR then we have choice on whether we allow this and change product |
| Max borrow amount outcome is less | Same as above | Same as above but starting position could exclude Tailored which we should be clear in the playback | Same as above but starting position could exclude OwnHome which we should be clear in the playback |

### **Financial insights**

This experience is valuable in allowing users to better understand their financial situation and game plan on different scenarios on how they could improve their borrowing power and be compelled to take action

| Feature | Requirement | Notes | Priority |
| :---- | :---- | :---- | :---- |
| Outgoings visualisation | Show a breakdown of monthly gross income across Taxation Existing loans (actual values but use 3.8% on credit card) Expenses (actual values) New loan (actual repayments) Remaining | Help users understand how much they are likely to have remaining at the end of each month | High |
| Options to improve borrowing power | Suggestions to improve borrowing power can be shown as different scenarios a user could interact with that then updates their max borrowing power. Based on the reason for their max borrowing power calc Max borrowing (deposit) Increase savings by $20,000, $50,000 and $100,000 Max borrowing (financials) Minimum expenses (if above HEM) Close credit cards (if limit >$0) Global max borrowing (e.g. variable of $2.5M) Offer no suggestions as it cannot be increased | A good way for users to engage and interact more with the experience | High |
| Approval confidence | Show visualisation of confidence in being able to get approval for their loan amount. This can be based on Size of buffer Stability of income declared We could ask questions on employment stability, credit score and deposit certainty? | Compels users to continue and get approval | Medium |

### **Saving, sharing and user activation**

### **Partner hosted experience**

### **Key things to sort out**

* Design concepts  
* Rebuild prototype with MUI components

# Timeline

**Affordability and borrowing power playback**

* Calculate max borrowing based on deposit  
  * Iterate on deposit / max LVR to determine max up to 85%  
* Calculate max borrowing based on serviceability (financials)  
  * Calculate on starting 80% and iterating from there  
  * Calculate on 80% and OwnHome

Need a lot more detail here on the interactions of this and different product options

* Breakdown of outgoings - after tax monthly income

Slider interaction for loan amount

* Default to same as required - if can be met. Can go up to max

Evaluate if can borrow property or not. What is version without it.

Approval confidence - can update based on questions on employment, credit score and deposit certainty? Prompt to calculate if you wanted to?

* high - healthy buffer

Buffer, valuation confidence for property
