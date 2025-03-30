import React from 'react';
import { 
  Box, 
  Card, 
  Grid, 
  Typography, 
  Stack, 
  styled 
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import { formatCurrency, formatSquareMeters } from '../logic/formatters';

interface PropertyCardProps {
  imageSrc: string;
  address: string;
  suburb: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  carSpaces: number;
  landSize: number;
  buildingSize: number;
  estimatedValue: number;
  lowEstimate: number;
  highEstimate: number;
  confidenceLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Styled components
const PropertyImage = styled('img')(({ theme }) => ({
  width: '100%',
  aspectRatio: '1280 / 420', // Maintain aspect ratio from design
  objectFit: 'cover',
  borderTopLeftRadius: theme.shape.borderRadius,
  borderTopRightRadius: theme.shape.borderRadius,
  [theme.breakpoints.up('md')]: {
    borderTopLeftRadius: 0,
    borderBottomRightRadius: theme.shape.borderRadius,
    height: '100%',
  },
}));

const PropertyContentBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  gap: theme.spacing(2),
}));

const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

const ValuationSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const ValuationBar = styled(Box)(({ theme }) => ({
  height: 40,
  backgroundColor: '#F2ECFF',
  borderRadius: 20,
  position: 'relative',
  width: '100%',
  zIndex: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
}));

const EstimateBox = styled(Box)(() => ({
  backgroundColor: '#350736',
  borderRadius: 16,
  padding: '8px 16px',
  minWidth: 100,
  textAlign: 'center',
  color: 'white',
  fontWeight: 600,
  zIndex: 1,
  position: 'relative',
}));

// Confidence indicator color mapping
const getConfidenceColor = (level: 'LOW' | 'MEDIUM' | 'HIGH' = 'HIGH') => {
  switch (level) {
    case 'LOW':
      return '#d32f2f'; // Red for low confidence
    case 'MEDIUM':
      return '#f9a825'; // Yellow for medium confidence
    case 'HIGH':
      return '#007443'; // Green for high confidence
    default:
      return '#007443'; // Default to green
  }
};

export const PropertyCard: React.FC<PropertyCardProps> = ({
  imageSrc,
  address,
  suburb,
  propertyType,
  bedrooms,
  bathrooms,
  carSpaces,
  landSize,
  buildingSize,
  estimatedValue,
  lowEstimate,
  highEstimate,
  confidenceLevel = 'HIGH',
}) => {
  return (
    <Card 
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Grid container direction={{ xs: 'column', md: 'row' }}>
        {/* Property Details - Full width on mobile, left side on desktop */}
        <Grid item xs={12} md={6}>
          <PropertyContentBox>
            {/* Address Section */}
            <Box>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {address}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {suburb}
              </Typography>
            </Box>
            
            {/* Property Features */}
            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1.5 }}>
              <FeatureItem>
                <HomeIcon fontSize="small" color="action" />
                <Typography variant="body2">{propertyType}</Typography>
              </FeatureItem>
              <FeatureItem>
                <BedIcon fontSize="small" color="action" />
                <Typography variant="body2">{bedrooms}</Typography>
              </FeatureItem>
              <FeatureItem>
                <BathtubIcon fontSize="small" color="action" />
                <Typography variant="body2">{bathrooms}</Typography>
              </FeatureItem>
              <FeatureItem>
                <DirectionsCarIcon fontSize="small" color="action" />
                <Typography variant="body2">{carSpaces}</Typography>
              </FeatureItem>
              <FeatureItem>
                <SquareFootIcon fontSize="small" color="action" />
                <Typography variant="body2">{formatSquareMeters(landSize)}</Typography>
              </FeatureItem>
              <FeatureItem>
                <SquareFootIcon fontSize="small" color="action" />
                <Typography variant="body2">{formatSquareMeters(buildingSize)}</Typography>
              </FeatureItem>
            </Stack>
            
            {/* Valuation Section */}
            <ValuationSection>
              {/* Bar with Values */}
              <Box sx={{ position: 'relative' }}>
                <ValuationBar>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(lowEstimate)}
                  </Typography>
                  <Box sx={{ flex: 1 }} />
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(highEstimate)}
                  </Typography>
                </ValuationBar>
                
                {/* Centered Estimate Box */}
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0,
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <EstimateBox>
                    <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap' }}>
                      {formatCurrency(estimatedValue)}
                    </Typography>
                  </EstimateBox>
                </Box>
              </Box>
              
              {/* Labels */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                  Low
                </Typography>
                <Stack 
                  direction="row" 
                  alignItems="center" 
                  spacing={0.5} 
                  sx={{ flex: 1, justifyContent: 'center' }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Estimated value
                  </Typography>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      backgroundColor: getConfidenceColor(confidenceLevel),
                      borderRadius: '50%',
                    }}
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1, textAlign: 'right' }}>
                  High
                </Typography>
              </Box>
            </ValuationSection>
          </PropertyContentBox>
        </Grid>
        
        {/* Property Image - Full width on mobile, right side on desktop */}
        <Grid item xs={12} md={6}>
          <PropertyImage src={imageSrc} alt={address} />
        </Grid>
      </Grid>
    </Card>
  );
};

export default PropertyCard; 