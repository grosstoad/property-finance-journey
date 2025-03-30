import { Box, Container, Typography, styled, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PropertySearch } from '../components/PropertySearch';
import { PropertyDetails } from '../components/PropertyDetails';
import { PropertyFinanceJourney } from '../components/PropertyFinanceJourney';
import { useProperty } from '../contexts/PropertyContext';

// Import the logo images
import propertyLogo from '../assets/images/property-logo.svg';
import reaGroupLogo from '../assets/images/rea-group-logo.svg';

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: 0,
  backgroundColor: 'white',
  overflow: 'hidden',
}));

const BackButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

export const HomePage = () => {
  const { selectedProperty, setSelectedProperty } = useProperty();

  const handleBackToSearch = () => {
    setSelectedProperty(null);
  };

  return (
    <PageContainer>
      <PropertySearch />

      {selectedProperty && (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box 
            sx={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 2,
              mb: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ArrowBackIcon 
                sx={{ mr: 2, color: '#666', fontSize: 24, cursor: 'pointer' }} 
                onClick={handleBackToSearch} 
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
          
          <Box mb={4}>
            {selectedProperty && (
              <PropertyDetails 
                key={`property-details-${selectedProperty.id}`}
                address={selectedProperty.address.street}
                suburb={`${selectedProperty.address.suburb} ${selectedProperty.address.state} ${selectedProperty.address.postcode}`}
                propertyType={(selectedProperty.features as any).propertyType || 'House'} // Handle potential missing type
                bedrooms={selectedProperty.features.bedrooms}
                bathrooms={selectedProperty.features.bathrooms}
                carSpaces={selectedProperty.features.carSpaces}
                landSize={selectedProperty.features.landSize}
                buildingSize={selectedProperty.features.buildingSize}
                estimatedValue={selectedProperty.valuation.mid}
                lowEstimate={selectedProperty.valuation.low}
                highEstimate={selectedProperty.valuation.high}
                confidenceLevel={selectedProperty.valuation.confidenceLevel}
                // imageSrc can be added if available on selectedProperty
              />
            )}
          </Box>
          
          <Box mt={2}>
            <PropertyFinanceJourney hideHeader={true} />
          </Box>
        </Container>
      )}
    </PageContainer>
  );
}; 