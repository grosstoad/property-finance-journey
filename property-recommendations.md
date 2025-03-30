"use client"

import type React from "react"
import { Box, Card, CardContent, CardMedia, Typography, Grid, Chip, Stack, styled } from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import BedIcon from "@mui/icons-material/Bed"
import BathtubIcon from "@mui/icons-material/Bathtub"
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar"
import HomeIcon from "@mui/icons-material/Home"
import ApartmentIcon from "@mui/icons-material/Apartment"
import HomeWorkIcon from "@mui/icons-material/HomeWork"
import SquareFootIcon from "@mui/icons-material/SquareFoot"

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
      fontWeight: 600,
      fontSize: "1.1rem",
    },
    h6: {
      fontWeight: 600,
      fontSize: "0.9rem",
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: "0.85rem",
    },
    body1: {
      fontSize: "0.85rem",
    },
    body2: {
      fontSize: "0.8rem",
    },
  },
})

// Styled components
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
}))

const ValuationChip = styled(Chip)(({ theme }) => ({
  backgroundColor: "#F5F0FF", // Light purple background
  color: "#4C108C", // Deep purple text
  fontWeight: 600,
  fontSize: "0.85rem",
  height: "28px",
  "& .MuiChip-label": {
    padding: "0 10px",
  },
}))

// Styled card to ensure equal height
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
}))

// Styled CardMedia to ensure consistent image height
const PropertyImage = styled(CardMedia)(({ theme }) => ({
  height: "160px", // Fixed height for all images
  objectFit: "cover",
  objectPosition: "center",
}))

interface Property {
  id: number
  address: string
  suburb: string
  state: string
  postcode: string
  bedrooms: number
  bathrooms: number
  parking: number
  landSize?: number
  buildingSize?: number
  propertyType: "house" | "apartment" | "townhouse"
  valuation: number
  imageUrl: string
}

interface NearbyPropertiesSectionProps {
  properties?: Property[]
}

const NearbyPropertiesSection: React.FC<NearbyPropertiesSectionProps> = ({ properties }) => {
  // Default properties if none provided
  const defaultProperties: Property[] = [
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
      valuation: 1850000,
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
      valuation: 1250000,
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
      valuation: 1650000,
      imageUrl:
        "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dG93bmhvdXNlfGVufDB8fDB8fHww",
    },
  ]

  const displayProperties = properties || defaultProperties

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case "house":
        return <HomeIcon />
      case "apartment":
        return <ApartmentIcon />
      case "townhouse":
        return <HomeWorkIcon />
      default:
        return <HomeIcon />
    }
  }

  return (
    <ThemeProvider theme={athenaTheme}>
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
          {displayProperties.map((property) => (
            <Grid item xs={12} sm={4} key={property.id}>
              <PropertyCard elevation={1}>
                <Box sx={{ height: "160px", overflow: "hidden" }}>
                  <PropertyImage component="img" image={property.imageUrl} alt={property.address} />
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
    </ThemeProvider>
  )
}

export default NearbyPropertiesSection

