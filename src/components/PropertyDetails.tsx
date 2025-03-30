import React from 'react';
import { Box } from '@mui/material';
import { PropertyCard } from './PropertyCard';
import { useProperty } from '../contexts/PropertyContext';

export const PropertyDetails: React.FC = () => {
  const { selectedProperty } = useProperty();

  if (!selectedProperty) {
    return null;
  }

  // Cast to any to get around TypeScript property check
  // and provide fallback in case propertyType is not available
  const propertyType = (selectedProperty.features as any).propertyType || 'House';

  return (
    <Box sx={{ width: '100%' }}>
      <PropertyCard
        imageSrc="https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
        address={selectedProperty.address.street}
        suburb={`${selectedProperty.address.suburb} ${selectedProperty.address.state} ${selectedProperty.address.postcode}`}
        propertyType={propertyType}
        bedrooms={selectedProperty.features.bedrooms}
        bathrooms={selectedProperty.features.bathrooms}
        carSpaces={selectedProperty.features.carSpaces}
        landSize={selectedProperty.features.landSize}
        buildingSize={selectedProperty.features.buildingSize}
        estimatedValue={selectedProperty.valuation.mid}
        lowEstimate={selectedProperty.valuation.low}
        highEstimate={selectedProperty.valuation.high}
        confidenceLevel={selectedProperty.valuation.confidenceLevel}
      />
    </Box>
  );
};

export default PropertyDetails; 