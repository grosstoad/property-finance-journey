"use client"

import type React from "react"

import { useState } from "react"
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Radio,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
} from "@mui/material"
import PersonIcon from "@mui/icons-material/Person"
import PeopleIcon from "@mui/icons-material/People"
import CloseIcon from "@mui/icons-material/Close"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`borrower-tabpanel-${index}`}
      aria-labelledby={`borrower-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `borrower-tab-${index}`,
    "aria-controls": `borrower-tabpanel-${index}`,
  }
}

type FrequencyType = "weekly" | "fortnightly" | "monthly" | "annual"

interface IncomeField {
  label: string
  value: number
  frequency: FrequencyType
}

interface BorrowerData {
  baseSalary: IncomeField
  supplementaryIncome: IncomeField
  otherIncome: IncomeField
  rentalIncome: IncomeField
}

interface LiabilitiesData {
  expenses: { value: number; frequency: FrequencyType }
  existingLoanRepayments: { value: number; frequency: FrequencyType }
  creditCardLimit: number
}

export default function FinancialForm() {
  const [open, setOpen] = useState(false)
  const [applicantType, setApplicantType] = useState("individual")
  const [numApplicants, setNumApplicants] = useState(1)
  const [numDependents, setNumDependents] = useState(0)
  const [tabValue, setTabValue] = useState(0)

  const [borrower1, setBorrower1] = useState<BorrowerData>({
    baseSalary: { label: "Base Salary", value: 0, frequency: "annual" },
    supplementaryIncome: { label: "Supplementary Income", value: 0, frequency: "annual" },
    otherIncome: { label: "Other Income", value: 0, frequency: "annual" },
    rentalIncome: { label: "Rental Income", value: 0, frequency: "annual" },
  })

  const [borrower2, setBorrower2] = useState<BorrowerData>({
    baseSalary: { label: "Base Salary", value: 0, frequency: "annual" },
    supplementaryIncome: { label: "Supplementary Income", value: 0, frequency: "annual" },
    otherIncome: { label: "Other Income", value: 0, frequency: "annual" },
    rentalIncome: { label: "Rental Income", value: 0, frequency: "annual" },
  })

  const [liabilities, setLiabilities] = useState<LiabilitiesData>({
    expenses: { value: 0, frequency: "monthly" },
    existingLoanRepayments: { value: 0, frequency: "monthly" },
    creditCardLimit: 0,
  })

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleCalculate = () => {
    // Implement calculation logic here
    console.log({
      applicantType,
      numApplicants,
      numDependents,
      borrower1,
      borrower2: numApplicants > 1 ? borrower2 : null,
      liabilities,
    })

    // Close the modal after calculation
    handleClose()
  }

  const updateBorrowerField = (
    borrower: "borrower1" | "borrower2",
    field: keyof BorrowerData,
    property: keyof IncomeField,
    value: any,
  ) => {
    if (borrower === "borrower1") {
      setBorrower1({
        ...borrower1,
        [field]: {
          ...borrower1[field],
          [property]: value,
        },
      })
    } else {
      setBorrower2({
        ...borrower2,
        [field]: {
          ...borrower2[field],
          [property]: value,
        },
      })
    }
  }

  const updateLiabilityField = (field: keyof LiabilitiesData, property: string, value: any) => {
    setLiabilities({
      ...liabilities,
      [field]:
        field === "creditCardLimit"
          ? value
          : { ...liabilities[field as keyof Omit<LiabilitiesData, "creditCardLimit">], [property]: value },
    })
  }

  const renderIncomeField = (borrower: "borrower1" | "borrower2", field: keyof BorrowerData) => {
    const data = borrower === "borrower1" ? borrower1 : borrower2
    const incomeField = data[field]

    const descriptions = {
      baseSalary: "Regular income from primary employment",
      supplementaryIncome: "Additional income from secondary employment",
      otherIncome: "Any other regular income sources",
      rentalIncome: "Income from investment properties",
    }

    return (
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            {incomeField.label}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            {descriptions[field]}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            type="number"
            value={incomeField.value || ""}
            onChange={(e) => updateBorrowerField(borrower, field, "value", Number.parseFloat(e.target.value) || 0)}
            InputProps={{ inputProps: { min: 0 } }}
            size="small"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth size="small">
            <Select
              value={incomeField.frequency}
              onChange={(e) => updateBorrowerField(borrower, field, "frequency", e.target.value)}
            >
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="fortnightly">Fortnightly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="annual">Annual</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    )
  }

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Open Financial Form
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        PaperProps={{
          sx: {
            maxHeight: "90vh",
            width: "550px", // Slightly wider to accommodate the layout
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Financial Information
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Applicant Information
            </Typography>

            {/* Changed to a different layout approach to match the screenshot */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Box sx={{ width: "48%" }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Applicant Type
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                    Select whether this is an individual or joint application
                  </Typography>
                </Box>
                <Box sx={{ width: "48%" }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Number of Dependents
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                    Select the number of financial dependents
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box sx={{ width: "48%", display: "flex", gap: 1 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      py: 0.75,
                      px: 1.5,
                      border: applicantType === "individual" ? "2px solid #1976d2" : "1px solid rgba(0, 0, 0, 0.12)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      width: "48%",
                    }}
                    onClick={() => {
                      setApplicantType("individual")
                      setNumApplicants(1)
                    }}
                  >
                    <PersonIcon sx={{ mr: 1, fontSize: "1.1rem" }} />
                    <Typography variant="body2">Individual</Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Radio
                      checked={applicantType === "individual"}
                      onChange={() => {
                        setApplicantType("individual")
                        setNumApplicants(1)
                      }}
                      value="individual"
                      name="applicant-type"
                      size="small"
                    />
                  </Paper>

                  <Paper
                    variant="outlined"
                    sx={{
                      py: 0.75,
                      px: 1.5,
                      border: applicantType === "joint" ? "2px solid #1976d2" : "1px solid rgba(0, 0, 0, 0.12)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      width: "48%",
                    }}
                    onClick={() => {
                      setApplicantType("joint")
                      setNumApplicants(2)
                    }}
                  >
                    <PeopleIcon sx={{ mr: 1, fontSize: "1.1rem" }} />
                    <Typography variant="body2">Joint</Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Radio
                      checked={applicantType === "joint"}
                      onChange={() => {
                        setApplicantType("joint")
                        setNumApplicants(2)
                      }}
                      value="joint"
                      name="applicant-type"
                      size="small"
                    />
                  </Paper>
                </Box>

                <Box sx={{ width: "48%" }}>
                  <FormControl fullWidth size="small">
                    <Select value={numDependents} onChange={(e) => setNumDependents(Number(e.target.value))}>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <MenuItem key={num} value={num}>
                          {num}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="borrower tabs"
              variant={numApplicants > 1 ? "fullWidth" : "standard"}
            >
              <Tab label="Borrower 1" {...a11yProps(0)} />
              {numApplicants > 1 && <Tab label="Borrower 2" {...a11yProps(1)} />}
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Typography variant="subtitle1" gutterBottom>
              Income Details - Borrower 1
            </Typography>

            {renderIncomeField("borrower1", "baseSalary")}
            {renderIncomeField("borrower1", "supplementaryIncome")}
            {renderIncomeField("borrower1", "otherIncome")}
            {renderIncomeField("borrower1", "rentalIncome")}
          </TabPanel>

          {numApplicants > 1 && (
            <TabPanel value={tabValue} index={1}>
              <Typography variant="subtitle1" gutterBottom>
                Income Details - Borrower 2
              </Typography>

              {renderIncomeField("borrower2", "baseSalary")}
              {renderIncomeField("borrower2", "supplementaryIncome")}
              {renderIncomeField("borrower2", "otherIncome")}
              {renderIncomeField("borrower2", "rentalIncome")}
            </TabPanel>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Liabilities and Expenses
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Expenses
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                  Regular living expenses including utilities, food, etc.
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  value={liabilities.expenses.value || ""}
                  onChange={(e) => updateLiabilityField("expenses", "value", Number.parseFloat(e.target.value) || 0)}
                  InputProps={{ inputProps: { min: 0 } }}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <Select
                    value={liabilities.expenses.frequency}
                    onChange={(e) => updateLiabilityField("expenses", "frequency", e.target.value)}
                  >
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="fortnightly">Fortnightly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="annual">Annual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Existing Loan Repayments
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                  Current repayments for any existing loans
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  value={liabilities.existingLoanRepayments.value || ""}
                  onChange={(e) =>
                    updateLiabilityField("existingLoanRepayments", "value", Number.parseFloat(e.target.value) || 0)
                  }
                  InputProps={{ inputProps: { min: 0 } }}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <Select
                    value={liabilities.existingLoanRepayments.frequency}
                    onChange={(e) => updateLiabilityField("existingLoanRepayments", "frequency", e.target.value)}
                  >
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="fortnightly">Fortnightly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="annual">Annual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Credit Card Limit
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                  Total limit across all credit cards
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  value={liabilities.creditCardLimit || ""}
                  onChange={(e) => updateLiabilityField("creditCardLimit", "", Number.parseFloat(e.target.value) || 0)}
                  InputProps={{ inputProps: { min: 0 } }}
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ py: 1.5, px: 3 }}>
          <Button onClick={handleClose} color="inherit" size="small" sx={{ mr: 1 }}>
            CANCEL
          </Button>
          <Button onClick={handleCalculate} variant="contained" color="primary" size="small" sx={{ px: 3 }}>
            CALCULATE
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

