import React from 'react';
import { Box } from '@mui/material';
// import { PropertyCard, PropertyCardProps } from './PropertyCard'; // Avoid importing PropertyCardProps
import { PropertyCard } from './PropertyCard'; // Import only the component
// import { useProperty } from '../contexts/PropertyContext';

// Define props needed by PropertyDetails, mirroring what PropertyCard expects
interface PropertyDetailsProps {
  address: string;
  suburb: string;
  propertyType?: string;
  bedrooms: number;
  bathrooms: number;
  carSpaces: number;
  landSize?: number | null;
  buildingSize?: number | null;
  estimatedValue?: number | null;
  lowEstimate?: number | null;
  highEstimate?: number | null;
  confidenceLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  imageSrc?: string;
  onEdit?: () => void;
}

// Helper to safely cast confidence level
const getValidConfidenceLevel = (level: string | null | undefined): 'LOW' | 'MEDIUM' | 'HIGH' | undefined => {
  if (level === 'LOW' || level === 'MEDIUM' || level === 'HIGH') {
    return level;
  }
  return undefined;
}

export const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  address,
  suburb,
  propertyType = 'House',
  bedrooms,
  bathrooms,
  carSpaces,
  landSize,
  buildingSize,
  estimatedValue,
  lowEstimate,
  highEstimate,
  confidenceLevel,
  imageSrc = "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  onEdit
}) => {
  // const { selectedProperty } = useProperty(); // Can potentially remove context usage if all data comes via props

  // Remove this if context is not used
  // if (!selectedProperty) {
  //   return null;
  // }

  // Remove this derivation if propertyType comes from props
  // const propertyType = (selectedProperty.features as any).propertyType || 'House';

  const validConfidenceLevel = getValidConfidenceLevel(confidenceLevel);

  return (
    <Box sx={{ width: '100%' }}>
      <PropertyCard
        imageSrc={imageSrc}
        address={address}
        suburb={suburb}
        propertyType={propertyType}
        bedrooms={bedrooms}
        bathrooms={bathrooms}
        carSpaces={carSpaces}
        landSize={landSize ?? 0}
        buildingSize={buildingSize ?? 0}
        estimatedValue={estimatedValue ?? 0}
        lowEstimate={lowEstimate ?? 0}
        highEstimate={highEstimate ?? 0}
        confidenceLevel={validConfidenceLevel}
      />
      {/* Add edit button if needed */}
    </Box>
  );
};

// Remove default export if adhering strictly to named exports guideline
// export default PropertyDetails; 