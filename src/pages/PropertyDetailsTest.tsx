import React from 'react';
import { Container, Box } from '@mui/material';
import { PropertyDetails } from '../components/PropertyDetails';

export const PropertyDetailsTest = () => {
  const sampleData = {
    address: '1 Straight Street',
    suburb: 'SUBURBIA NSW 2075',
    bedrooms: 4,
    bathrooms: 2,
    carSpaces: 2,
    landSize: 1071,
    floorSize: 311,
    estimatedValue: 1960000,
    lowEstimate: 1740000,
    highEstimate: 2670000,
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1000',
  };

  const handleEdit = () => {
    console.log('Edit clicked');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F5F5F5',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <PropertyDetails {...sampleData} onEdit={handleEdit} />
      </Container>
    </Box>
  );
};

export default PropertyDetailsTest; 