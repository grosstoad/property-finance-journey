"use client"

import type React from "react"
import { Box, Card, CardContent, Typography, Grid, Divider, useTheme, styled, Chip } from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"

// Define the theme with Athena's color palette
const athenaTheme = createTheme({
  palette: {
    primary: {
      main: "#4C108C", // Deep purple
      light: "#A245EC", // Medium purple
    },
    secondary: {
      main: "#E30088", // Magenta pink
      light: "#FE55A6", // Light pink
    },
    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#260937", // Dark purple
      secondary: "#666666",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontFamily: '"Ciutadella", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
      fontSize: "1rem",
    },
    h6: {
      fontFamily: '"Ciutadella", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
      fontSize: "0.9rem",
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: "0.85rem",
    },
    body2: {
      fontSize: "0.8rem",
    },
    subtitle2: {
      fontSize: "0.75rem",
    },
  },
  components: {
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "16px", // Increased padding to match purchase calculator
          "&:last-child": {
            paddingBottom: "16px",
          },
        },
      },
    },
  },
})

// Styled components
const RateBox = styled(Box)(({ theme }) => ({
  padding: "8px 12px",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "#FAF1E2", // Light beige from the color palette
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
}))

const RevertInfo = styled(Box)(({ theme }) => ({
  padding: "8px",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "#F5F5F5",
  marginTop: "8px",
}))

// Custom styled chip for product features
const FeatureChip = styled(Chip)(({ theme }) => ({
  backgroundColor: "#F5F0FF", // Light purple background
  color: "#4C108C", // Deep purple text
  fontWeight: 500,
  fontSize: "0.7rem",
  height: "24px",
  "& .MuiChip-label": {
    padding: "0 8px",
  },
}))

// Square logo component
const SquareLogo = () => (
  <Box
    sx={{
      width: "38px",
      height: "38px",
      backgroundColor: "#260937", // Dark purple background
      borderRadius: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Main triangle shape */}
    <Box
      sx={{
        position: "absolute",
        width: "70%",
        height: "70%",
        clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
        background: "linear-gradient(135deg, #E30088 0%, #FE55A6 100%)",
      }}
    />

    {/* Optional: Add a small accent element */}
    <Box
      sx={{
        position: "absolute",
        bottom: "6px",
        right: "6px",
        width: "8px",
        height: "8px",
        backgroundColor: "#A245EC",
        borderRadius: "1px",
      }}
    />
  </Box>
)

// Types
interface LoanProductProps {
  productName: string
  loanAmount: number
  loanTerm: number
  interestRate: number
  repaymentAmount: number
  repaymentFrequency: "weekly" | "fortnightly" | "monthly"
  variant?: "standard" | "revert" | "fees"
  revertDetails?: {
    productName: string
    remainingYears: number
    interestRate: number
  }
  feeDetails?: {
    upfrontFee: number
    percentageOfLoan: number
  }
}

export const SquareLoanCard: React.FC<LoanProductProps> = ({
  productName,
  loanAmount,
  loanTerm,
  interestRate,
  repaymentAmount,
  repaymentFrequency,
  variant = "standard",
  revertDetails,
  feeDetails,
}) => {
  const theme = useTheme()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Product features to display as chips
  const productFeatures = ["No lender fees", "Automatic Rate Match", "Rewarded for loyalty"]

  return (
    <ThemeProvider theme={athenaTheme}>
      <Card
        elevation={1}
        sx={{
          width: "100%",
          maxWidth: "100%",
          overflow: "hidden",
          borderRadius: "4px",
          backgroundColor: "#ffffff",
        }}
      >
        <CardContent>
          {/* Container with horizontal padding */}
          <Box sx={{ px: 1 }}>
            <Grid container spacing={0.5} alignItems="center">
              {/* Square Logo */}
              <Grid item xs={2}>
                <SquareLogo />
              </Grid>
              <Grid item xs={10}>
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{
                    mb: 0.25,
                    lineHeight: 1.3,
                    color: "#260937",
                    fontWeight: 600,
                  }}
                >
                  {productName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#666666",
                    lineHeight: 1.3,
                  }}
                >
                  {formatCurrency(loanAmount)} loan over {loanTerm} years
                </Typography>
              </Grid>

              {/* Product Feature Chips */}
              <Grid item xs={12}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1, mb: 0.5 }}>
                  {productFeatures.map((feature, index) => (
                    <FeatureChip key={index} label={feature} size="small" />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 0.75 }} />
              </Grid>

              {/* Interest Rate and Repayments with reduced vertical padding */}
              <Grid item xs={6}>
                <RateBox>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{
                      mb: 0, // No bottom margin
                      lineHeight: 1.2,
                      textAlign: "center",
                    }}
                  >
                    Interest Rate
                  </Typography>
                  <Typography
                    variant="h5"
                    component="p"
                    sx={{
                      fontWeight: "bold",
                      lineHeight: 1.2,
                      color: "#4C108C", // Deep purple
                      textAlign: "center",
                    }}
                  >
                    {interestRate.toFixed(2)}%
                  </Typography>
                </RateBox>
              </Grid>

              <Grid item xs={6}>
                <RateBox>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{
                      mb: 0, // No bottom margin
                      lineHeight: 1.2,
                      textAlign: "center",
                    }}
                  >
                    {repaymentFrequency.charAt(0).toUpperCase() + repaymentFrequency.slice(1)} Repayments
                  </Typography>
                  <Typography
                    variant="h5"
                    component="p"
                    sx={{
                      fontWeight: "bold",
                      lineHeight: 1.2,
                      color: "#E30088", // Magenta pink
                      textAlign: "center",
                    }}
                  >
                    {formatCurrency(repaymentAmount)}
                  </Typography>
                </RateBox>
              </Grid>

              {/* Revert Details */}
              {variant === "revert" && revertDetails && (
                <Grid item xs={12}>
                  <RevertInfo>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                      After {loanTerm - revertDetails.remainingYears} years, reverts to {revertDetails.productName} for
                      the remaining {revertDetails.remainingYears} years at {revertDetails.interestRate.toFixed(2)}%
                      interest rate
                    </Typography>
                  </RevertInfo>
                </Grid>
              )}

              {/* Fee Details */}
              {variant === "fees" && feeDetails && (
                <Grid item xs={12}>
                  <RevertInfo>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                      There will be upfront fees of {formatCurrency(feeDetails.upfrontFee)} equal to{" "}
                      {feeDetails.percentageOfLoan.toFixed(2)}% of the loan amount
                    </Typography>
                  </RevertInfo>
                </Grid>
              )}
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </ThemeProvider>
  )
}

export default SquareLoanCard



import { Box, Container, Typography, Stack, CssBaseline } from "@mui/material"
import SquareLoanCard from "./square-loan-card"

export default function SquareLogoDemo() {
  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", py: 1.5 }}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ px: 1.5 }}>
        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          sx={{
            mb: 1,
            fontFamily: '"Ciutadella", "Roboto", "Arial", sans-serif',
            fontWeight: 600,
            color: "#260937",
            fontSize: "1.2rem",
          }}
        >
          Athena Loan Products
        </Typography>

        <Stack spacing={1.25}>
          {/* Version 1: Standard Loan */}
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                color: "#4C108C",
                mb: 0.25,
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              Standard Variable Loan
            </Typography>
            <SquareLoanCard
              productName="Athena Variable P&I 70-80% LVR"
              loanAmount={300000}
              loanTerm={30}
              interestRate={7.98}
              repaymentAmount={2198}
              repaymentFrequency="monthly"
              variant="standard"
            />
          </Box>

          {/* Version 2: Loan with Reversion */}
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                color: "#4C108C",
                mb: 0.25,
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              Fixed Rate Loan with Reversion
            </Typography>
            <SquareLoanCard
              productName="Athena Fixed Rate P&I 70-80% LVR"
              loanAmount={300000}
              loanTerm={30}
              interestRate={6.45}
              repaymentAmount={1892}
              repaymentFrequency="monthly"
              variant="revert"
              revertDetails={{
                productName: "Athena Variable P&I 70-80% LVR",
                remainingYears: 27,
                interestRate: 3.45,
              }}
            />
          </Box>

          {/* Version 3: Loan with Fee Disclosure */}
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                color: "#4C108C",
                mb: 0.25,
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              Interest Only Loan with Fees
            </Typography>
            <SquareLoanCard
              productName="Athena Interest Only 70-80% LVR"
              loanAmount={300000}
              loanTerm={30}
              interestRate={8.25}
              repaymentAmount={2063}
              repaymentFrequency="monthly"
              variant="fees"
              feeDetails={{
                upfrontFee: 1500,
                percentageOfLoan: 0.5,
              }}
            />
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}

