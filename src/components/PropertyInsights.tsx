import { 
  Box, 
  Card, 
  Grid, 
  Typography, 
  Chip,
  Divider,
  styled,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useProperty } from '../contexts/PropertyContext';
import { 
  formatCurrency, 
  formatSquareMeters 
} from '../logic/formatters';
import HomeIcon from '@mui/icons-material/Home';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SquareFootIcon from '@mui/icons-material/SquareFoot';

const FeatureChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: 16,
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  '& .MuiChip-icon': {
    color: theme.palette.text.primary,
  },
}));

const PropertyCard = styled(Card)(({ theme }) => ({
  margin: 0,
  overflow: 'hidden',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: '#ffffff',
  width: '100%',
  [theme.breakpoints.down('md')]: {
    width: '100%'
  }
}));

const PropertyImage = styled('img')({
  width: '100%',
  height: '350px',
  objectFit: 'cover',
  display: 'block'
});

const PropertyInfo = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2)
}));

const PropertyAddress = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(0.5),
}));

const PropertySuburb = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

const ValuationSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
}));

const ValuationContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  position: 'relative',
}));

const ValuationBar = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: 56,
  backgroundColor: '#f0f0f0',
  borderRadius: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 2),
}));

const ValuationLabels = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: theme.spacing(1),
}));

const ValueMarker = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
}));

const EstimatedValueText = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  position: 'relative',
  margin: theme.spacing(0, 1),
  display: 'flex',
  alignItems: 'center',
}));

const ConfidenceIndicator = styled('div')<{ level: 'LOW' | 'MEDIUM' | 'HIGH' }>(({ theme, level }) => {
  const colorMap = {
    LOW: theme.palette.error.main,
    MEDIUM: theme.palette.success.main,
    HIGH: theme.palette.success.dark,
  };
  
  return {
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: colorMap[level],
    display: 'inline-block',
    marginLeft: theme.spacing(0.5),
  };
});

const ValuationValue = styled(Box)(({ theme }) => ({
  backgroundColor: '#6c5ce7',
  color: '#ffffff',
  padding: theme.spacing(1.5, 3),
  borderRadius: 24,
  fontWeight: 'bold',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  zIndex: 1,
}));

// Fix TypeScript error by creating a proper interface for SideValue props
interface SideValueProps {
  isMobile: boolean;
  children: React.ReactNode;
}

// Change to a functional component that accepts props
const SideValue = styled(Box)<{ isMobile: boolean }>(({ theme, isMobile }) => ({
  fontSize: isMobile ? '0.75rem' : '0.875rem',
  color: theme.palette.text.secondary,
  fontWeight: 500,
}));

const FeatureChipsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  marginBottom: theme.spacing(2),
}));

export const PropertyInsights = () => {
  const { selectedProperty } = useProperty();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  if (!selectedProperty) {
    return null;
  }

  const { address, features, valuation, images } = selectedProperty;

  return (
    <Box sx={{ width: '100%' }}>
      <PropertyCard>
        <Grid container>
          {/* Left section: Property details */}
          <Grid item xs={12} md={6}>
            <PropertyInfo>
              <Box>
                <PropertyAddress variant="h4">{address.street}</PropertyAddress>
                <PropertySuburb variant="h6">{address.suburb} {address.state} {address.postcode}</PropertySuburb>
                
                <FeatureChipsContainer>
                  <FeatureChip 
                    icon={<HomeIcon />}
                    label="House" 
                  />
                  <FeatureChip 
                    icon={<BedIcon />}
                    label={features.bedrooms.toString()} 
                  />
                  <FeatureChip 
                    icon={<BathtubIcon />}
                    label={features.bathrooms.toString()} 
                  />
                  <FeatureChip 
                    icon={<DirectionsCarIcon />}
                    label={features.carSpaces.toString()} 
                  />
                  <FeatureChip 
                    icon={<SquareFootIcon />}
                    label={formatSquareMeters(features.landSize)} 
                  />
                  <FeatureChip 
                    icon={<SquareFootIcon />}
                    label={formatSquareMeters(features.buildingSize)} 
                  />
                </FeatureChipsContainer>
              </Box>
              
              <Divider />
              
              <ValuationSection>
                {/* Single valuation bar with values inside */}
                <ValuationContainer>
                  <ValuationBar>
                    <SideValue isMobile={isMobile}>{formatCurrency(valuation.low)}</SideValue>
                    <ValuationValue>
                      {formatCurrency(valuation.mid)}
                    </ValuationValue>
                    <SideValue isMobile={isMobile}>{formatCurrency(valuation.high)}</SideValue>
                  </ValuationBar>
                  
                  {/* Text labels */}
                  <ValuationLabels>
                    <ValueMarker>Low</ValueMarker>
                    <EstimatedValueText>
                      <Typography variant="body2" component="span">
                        Estimated value
                      </Typography>
                      <ConfidenceIndicator level={valuation.confidenceLevel} />
                    </EstimatedValueText>
                    <ValueMarker>High</ValueMarker>
                  </ValuationLabels>
                </ValuationContainer>
              </ValuationSection>
            </PropertyInfo>
          </Grid>
          
          {/* Right section: Property image */}
          <Grid item xs={12} md={6}>
            <PropertyImage 
              src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
              alt={address.fullAddress} 
            />
          </Grid>
        </Grid>
      </PropertyCard>
    </Box>
  );
}; 