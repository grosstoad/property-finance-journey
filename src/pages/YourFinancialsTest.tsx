import React, { useEffect } from 'react';
import { Container, Box, Stack, Grid, Typography, Divider } from '@mui/material';
import { YourFinancials } from '../components/YourFinancials';
import { PropertyDetails } from '../components/PropertyDetails';
import { PurchaseCosts } from '../components/PurchaseCosts';
import { PropertyCard } from '../components/PropertyCard';
import { AffordabilityCardTest } from '../components-test/AffordabilityCardTest';
import { FinancialsProvider } from '../contexts/FinancialsContext';
import { PropertyProvider, useProperty } from '../contexts/PropertyContext';
import { LoanProvider } from '../contexts/LoanContext';
import { FinancialsModal } from '../components/FinancialsModal';

// Property Sample data setup component
const PropertySetup = ({ children }: { children: React.ReactNode }) => {
  const { setSelectedProperty } = useProperty();
  
  useEffect(() => {
    // Create a sample property object that matches the structure expected by the app
    const sampleProperty = {
      id: 'sample-property-1',
      address: {
        street: '1 Straight Street',
        suburb: 'SUBURBIA',
        state: 'NSW',
        postcode: '2075',
        latitude: -33.8688,
        longitude: 151.2093,
        id: 'address-1',
        fullAddress: '1 Straight Street, SUBURBIA NSW 2075',
      },
      features: {
        bedrooms: 4,
        bathrooms: 2,
        carSpaces: 2,
        landSize: 1071,
        buildingSize: 311,
        propertyType: 'House',
      },
      valuation: {
        mid: 1960000,
        low: 1740000,
        high: 2670000,
        confidenceLevel: 'HIGH' as const,
      },
      lastSoldDate: '2020-01-01',
      lastSoldPrice: 1850000,
      images: [
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1470&q=80'
      ],
    };
    
    // Set the sample property in the context
    setSelectedProperty(sampleProperty);
  }, [setSelectedProperty]);
  
  return <>{children}</>;
};

export const YourFinancialsTest = () => {
  const samplePropertyData = {
    address: '1 Straight Street',
    suburb: 'SUBURBIA NSW 2075',
    bedrooms: 4,
    bathrooms: 2,
    parking: 2,
    landSize: 1071,
    floorSize: 311,
    estimatedValue: 1960000,
    lowEstimate: 1740000,
    highEstimate: 2670000,
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1000',
  };

  const [showFinancialsModal, setShowFinancialsModal] = React.useState(false);

  const handleFinancialsChange = (financials: any) => {
    console.log('Financials updated:', financials);
  };

  const handlePropertyEdit = () => {
    console.log('Property edit clicked');
  };

  const handleCostsChange = (costs: any) => {
    console.log('Costs updated:', costs);
  };
  
  const handleOpenModal = (section?: string) => {
    console.log('Opening modal to section:', section);
    setShowFinancialsModal(true);
  };
  
  const handleCloseModal = () => {
    setShowFinancialsModal(false);
  };
  
  const handleSubmitModal = () => {
    setShowFinancialsModal(false);
    console.log('Modal submitted');
  };

  return (
    <PropertyProvider>
      <LoanProvider>
        <FinancialsProvider>
          <PropertySetup>
            <Box
              sx={{
                minHeight: '100vh',
                backgroundColor: '#F5F5F5',
                py: 4,
              }}
            >
              <Container maxWidth="lg">
                <Stack spacing={4}>
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <PurchaseCosts onCostsChange={handleCostsChange} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <YourFinancials 
                        onFinancialsChange={handleFinancialsChange}
                        onOpenModal={handleOpenModal}
                      />
                    </Grid>
                  </Grid>
                  
                  {/* Use the PropertyDetails component that pulls from the PropertyContext */}
                  <PropertyDetails />
                  
                  {/* New Section: PropertyCard Component */}
                  <Box>
                    <Typography variant="h5" gutterBottom sx={{ mt: 2, mb: 3 }}>
                      PropertyCard Component
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <PropertyCard 
                      imageSrc={samplePropertyData.imageUrl}
                      address={samplePropertyData.address}
                      suburb={samplePropertyData.suburb}
                      propertyType="House"
                      bedrooms={samplePropertyData.bedrooms}
                      bathrooms={samplePropertyData.bathrooms}
                      carSpaces={samplePropertyData.parking}
                      landSize={samplePropertyData.landSize}
                      buildingSize={samplePropertyData.floorSize}
                      estimatedValue={samplePropertyData.estimatedValue}
                      lowEstimate={samplePropertyData.lowEstimate}
                      highEstimate={samplePropertyData.highEstimate}
                    />
                    
                    {/* Second PropertyCard with different values for testing */}
                    <Box sx={{ mt: 3 }}>
                      <PropertyCard 
                        imageSrc='/property-image.jpg'
                        address="42 Modern Avenue"
                        suburb="NEWTOWN NSW 2042"
                        propertyType="Townhouse"
                        bedrooms={3}
                        bathrooms={2}
                        carSpaces={1}
                        landSize={350}
                        buildingSize={180}
                        estimatedValue={1250000}
                        lowEstimate={1100000}
                        highEstimate={1400000}
                      />
                    </Box>
                  </Box>
                  
                  {/* Affordability and Product Cards Test */}
                  <Box>
                    <Typography variant="h5" gutterBottom sx={{ mt: 2, mb: 3 }}>
                      Affordability and Product Cards
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <AffordabilityCardTest />
                  </Box>
                </Stack>
              </Container>
              
              <FinancialsModal
                open={showFinancialsModal}
                onClose={handleCloseModal}
                onSubmit={handleSubmitModal}
              />
            </Box>
          </PropertySetup>
        </FinancialsProvider>
      </LoanProvider>
    </PropertyProvider>
  );
};

export default YourFinancialsTest; 