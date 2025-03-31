import { Property, PropertySuggestion, PropertySearchResult } from '../types/property';

// Mock data for property search suggestions
const mockSuggestions: PropertySuggestion[] = [
  { id: '1', fullAddress: '1 Straight Street, SUBURBIA NSW 2075' },
  { id: '2', fullAddress: '2 Curved Road, SUBURBIA NSW 2075' },
  { id: '3', fullAddress: '3 Round Avenue, METROPOLIS NSW 2000' },
  { id: '4', fullAddress: '4 Square Lane, COUNTRYSIDE NSW 2999' },
];

// Mock property data based on the screenshot
const mockProperty: Property = {
  id: '1',
  address: {
    id: '1',
    fullAddress: '1 Straight Street, SUBURBIA NSW 2075',
    street: '1 Straight Street',
    suburb: 'SUBURBIA',
    state: 'NSW',
    postcode: '2075',
  },
  features: {
    bedrooms: 4,
    bathrooms: 2,
    carSpaces: 2,
    landSize: 1071, // in square meters
    buildingSize: 311, // in square meters
    propertyType: 'House',
  },
  listing: {
    isListed: true,
    nextInspection: '2023-06-15T10:00:00',
    daysOnMarket: 14,
    isAuction: false,
    listingUrl: 'https://www.realestate.com.au/property/1-straight-street-suburbia-nsw-2075',
  },
  valuation: {
    low: 1000000, // $1.0m
    mid: 1200000, // $1.2m
    high: 1400000, // $1.4m
    confidenceLevel: 'MEDIUM',
  },
  images: [
    'https://source.unsplash.com/random/1200x800/?house',
    'https://source.unsplash.com/random/1200x800/?property',
    'https://source.unsplash.com/random/1200x800/?real-estate',
  ],
};

/**
 * Search for properties by address
 * This would be replaced with an actual API call to PropTrack
 */
export const searchProperties = async (query: string): Promise<PropertySearchResult> => {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Filter suggestions based on query
  const filteredSuggestions = query 
    ? mockSuggestions.filter(s => 
        s.fullAddress.toLowerCase().includes(query.toLowerCase())
      )
    : [];
  
  return { suggestions: filteredSuggestions };
};

/**
 * Get property details by ID
 * This would be replaced with an actual API call to PropTrack
 */
export const getPropertyById = async (id: string): Promise<Property> => {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 700));
  
  // In a real implementation, we would fetch the property by ID
  // For now, return the mock property
  return mockProperty;
}; 