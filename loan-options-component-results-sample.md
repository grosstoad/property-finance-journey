```j
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Switch,
  TextField,
  Divider,
  LinearProgress,
  IconButton,
  InputAdornment,
  styled,
  Card,
  CardContent,
} from "@mui/material"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import { ThemeProvider, createTheme } from "@mui/material/styles"

// Define the theme with Athena's color palette - matching the loan card component
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
    h4: {
      fontWeight: 700,
      fontSize: "1.2rem", // Reduced to match loan card
    },
    h5: {
      fontWeight: 600,
      fontSize: "1rem", // Matching loan card
    },
    h6: {
      fontWeight: 600,
      fontSize: "0.9rem", // Matching loan card
    },
    body1: {
      fontSize: "0.8rem", // Matching loan card body text
    },
    body2: {
      fontSize: "0.75rem", // Matching loan card
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: "0.85rem",
    },
    subtitle2: {
      fontSize: "0.75rem", // Matching loan card
    },
  },
  components: {
    MuiToggleButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: "#4C108C",
            color: "#FFFFFF",
            "&:hover": {
              backgroundColor: "#3a0c6b",
            },
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          "&.Mui-checked": {
            color: "#A245EC",
            "& + .MuiSwitch-track": {
              backgroundColor: "#A245EC",
            },
          },
        },
        track: {
          backgroundColor: "#cccccc",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 8, // Slightly smaller
          borderRadius: 4,
          backgroundColor: "#E8E0F7",
        },
        bar: {
          borderRadius: 4,
          backgroundColor: "#4C108C",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "16px", // Increased padding
          "&:last-child": {
            paddingBottom: "16px",
          },
        },
      },
    },
  },
})

// Styled components
const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  width: "100%",
  borderRadius: theme.shape.borderRadius,
  "& .MuiToggleButtonGroup-grouped": {
    margin: 0,
    border: 0,
    flex: 1,
    padding: theme.spacing(1),
    "&:not(:first-of-type)": {
      borderRadius: theme.shape.borderRadius,
    },
    "&:first-of-type": {
      borderRadius: theme.shape.borderRadius,
    },
  },
}))

const CurrencyTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius,
    textAlign: "right",
    "& input": {
      textAlign: "right",
      fontSize: "0.9rem", // Smaller to match loan card
      fontWeight: 500,
      padding: "8px 12px", // Smaller padding
    },
  },
}))

interface PurchaseCalculatorProps {
  initialPropertyPrice?: number
  initialSavings?: number
  initialUpfrontCosts?: number
}

const PurchaseCalculator: React.FC<PurchaseCalculatorProps> = ({
  initialPropertyPrice = 1960000,
  initialSavings = 800000,
  initialUpfrontCosts = 25000, // Default upfront costs
}) => {
  const [purchaseType, setPurchaseType] = useState<string>("live")
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState<boolean>(true)
  const [propertyPrice, setPropertyPrice] = useState<number>(initialPropertyPrice)
  const [savings, setSavings] = useState<number>(initialSavings)
  const [upfrontCosts, setUpfrontCosts] = useState<number>(initialUpfrontCosts)
  const [loanAmount, setLoanAmount] = useState<number>(0)
  const [lvrPercentage, setLvrPercentage] = useState<number>(0)

  // Calculate loan amount and LVR when inputs change
  useEffect(() => {
    const calculatedLoanAmount = Math.max(0, propertyPrice - savings)
    setLoanAmount(calculatedLoanAmount)

    const calculatedLvr = propertyPrice > 0 ? (calculatedLoanAmount / propertyPrice) * 100 : 0
    setLvrPercentage(calculatedLvr)
  }, [propertyPrice, savings])

  const handlePurchaseTypeChange = (event: React.MouseEvent<HTMLElement>, newType: string) => {
    if (newType !== null) {
      setPurchaseType(newType)
    }
  }

  const handleFirstTimeBuyerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsFirstTimeBuyer(event.target.checked)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handlePropertyPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, "")
    setPropertyPrice(value ? Number.parseInt(value, 10) : 0)
  }

  const handleSavingsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, "")
    setSavings(value ? Number.parseInt(value, 10) : 0)
  }

  return (
    <ThemeProvider theme={athenaTheme}>
      <Box sx={{ mt: 3, mb: 3 }}>
        <Typography
          variant="subtitle1"
          sx={{
            color: "#4C108C",
            mb: 0.25,
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          Purchase costs & savings
        </Typography>

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
              {/* Purchase Type Toggle */}
              <StyledToggleButtonGroup
                value={purchaseType}
                exclusive
                onChange={handlePurchaseTypeChange}
                aria-label="purchase type"
                sx={{ mb: 2, width: "100%" }}
                size="small"
              >
                <ToggleButton value="live" aria-label="to live in">
                  To live in
                </ToggleButton>
                <ToggleButton value="investment" aria-label="as an investment">
                  As an investment
                </ToggleButton>
              </StyledToggleButtonGroup>

              {/* First Time Buyer Toggle */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="body1">First time home buyer</Typography>
                <Switch
                  checked={isFirstTimeBuyer}
                  onChange={handleFirstTimeBuyerChange}
                  inputProps={{ "aria-label": "first time home buyer toggle" }}
                  size="small"
                />
              </Box>

              {/* Property Price Input */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body1">Estimated property price</Typography>
                  <IconButton size="small" sx={{ ml: 0.5, p: 0.5 }}>
                    <InfoOutlinedIcon fontSize="small" sx={{ width: 16, height: 16 }} />
                  </IconButton>
                </Box>
                <CurrencyTextField
                  value={formatCurrency(propertyPrice)}
                  onChange={handlePropertyPriceChange}
                  variant="outlined"
                  size="small"
                  sx={{ width: "140px" }} // Reduced width
                  InputProps={{
                    startAdornment: <InputAdornment position="start"></InputAdornment>,
                  }}
                />
              </Box>

              {/* Savings Input */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="body1">Savings I have to contribute</Typography>
                <CurrencyTextField
                  value={formatCurrency(savings)}
                  onChange={handleSavingsChange}
                  variant="outlined"
                  size="small"
                  sx={{ width: "140px" }} // Reduced width
                  InputProps={{
                    startAdornment: <InputAdornment position="start"></InputAdornment>,
                  }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Loan Amount Required */}
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body1" fontWeight={500}>
                    Loan amount required
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {formatCurrency(loanAmount)}
                  </Typography>
                </Box>

                <LinearProgress variant="determinate" value={Math.min(lvrPercentage, 100)} sx={{ mb: 0.5 }} />

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(lvrPercentage)}% of the property value (LVR)
                  </Typography>
                </Box>
              </Box>

              {/* Deposit (formerly Estimated Costs) */}
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body1" fontWeight={700} sx={{ fontSize: "0.9rem" }}>
                    Deposit
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {formatCurrency(savings)}
                  </Typography>
                </Box>

                {/* Other upfront costs */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mt: 0.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Other upfront costs
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatCurrency(upfrontCosts)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  )
}

export default PurchaseCalculator

```
