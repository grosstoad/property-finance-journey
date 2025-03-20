"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Paper,
  Typography,
  Slider,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Alert,
  Stack,
  Chip,
} from "@mui/material"
import { TrendingUp, CreditCard, AccountBalance, Work } from "@mui/icons-material"

// Format currency values
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

interface BorrowingPowerProps {
  maxBorrowingPower: number
  requiredLoanAmount: number
  minLoanAmount: number
  maxLoanAmount: number
}

export default function BorrowingPower({
  maxBorrowingPower = 450000,
  requiredLoanAmount = 500000,
  minLoanAmount = 100000,
  maxLoanAmount = 800000,
}: BorrowingPowerProps) {
  const [sliderValue, setSliderValue] = useState<number>(requiredLoanAmount)
  const [showImprovements, setShowImprovements] = useState<boolean>(false)

  // Calculate the difference between max borrowing power and required loan
  const difference = maxBorrowingPower - requiredLoanAmount
  const isPositive = difference >= 0

  // Update improvements visibility when difference changes
  useEffect(() => {
    setShowImprovements(!isPositive)
  }, [isPositive])

  // Handle slider change
  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    setSliderValue(newValue as number)
  }

  // Improvement options
  const improvementOptions = [
    {
      title: "Increase Income",
      description: "Adding income sources can increase your borrowing power",
      icon: <Work />,
      impact: "+$50,000",
    },
    {
      title: "Reduce Debt",
      description: "Paying down credit cards can improve your position",
      icon: <CreditCard />,
      impact: "+$35,000",
    },
    {
      title: "Add Co-borrower",
      description: "Adding a co-borrower with income can help",
      icon: <AccountBalance />,
      impact: "+$100,000",
    },
  ]

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Alert
        severity={isPositive ? "success" : "warning"}
        sx={{
          mb: 3,
          backgroundColor: isPositive ? "rgba(46, 125, 50, 0.1)" : "rgba(237, 108, 2, 0.1)",
          "& .MuiAlert-icon": {
            color: isPositive ? "#2e7d32" : "#ed6c02",
          },
        }}
      >
        <Typography variant="body1" fontWeight="medium">
          {isPositive
            ? `You're looking good! Your max borrowing power exceeds the loan amount you need for this property by ${formatCurrency(Math.abs(difference))}.`
            : `We could lend you up to ${formatCurrency(maxBorrowingPower)}, lower than the amount you need for this property by ${formatCurrency(Math.abs(difference))}.`}
        </Typography>
      </Alert>

      {showImprovements && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Options to improve your borrowing power:
          </Typography>
          <Grid container spacing={2}>
            {improvementOptions.map((option, index) => (
              <Grid item xs={12} sm={12} md={4} key={index}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <CardActionArea sx={{ height: "100%" }}>
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Box sx={{ color: "primary.main" }}>{option.icon}</Box>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {option.title}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {option.description}
                      </Typography>
                      <Chip label={option.impact} color="success" size="small" icon={<TrendingUp />} />
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" gutterBottom>
          Loan Amount: {formatCurrency(sliderValue)}
        </Typography>

        <Box sx={{ px: 2 }}>
          <Slider
            value={sliderValue}
            onChange={handleSliderChange}
            min={minLoanAmount}
            max={maxLoanAmount}
            step={5000}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => formatCurrency(value)}
            marks={[
              { value: minLoanAmount, label: formatCurrency(minLoanAmount) },
              { value: maxLoanAmount, label: formatCurrency(maxLoanAmount) },
            ]}
          />
        </Box>
      </Paper>
    </Box>
  )
}

