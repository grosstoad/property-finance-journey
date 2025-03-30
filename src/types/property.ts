export interface PropertyAddress {
  id: string;
  fullAddress: string;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
}

export interface PropertySuggestion {
  id: string;
  fullAddress: string;
}

export interface PropertyFeatures {
  bedrooms: number;
  bathrooms: number;
  carSpaces: number;
  landSize: number;
  buildingSize: number;
  propertyType: string;
}

export interface PropertyListing {
  isListed: boolean;
  nextInspection?: string;
  daysOnMarket?: number;
  isAuction?: boolean;
  auctionDate?: string;
  listingUrl?: string;
}

export interface PropertyValuation {
  low: number;
  mid: number;
  high: number;
  confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Property {
  id: string;
  address: PropertyAddress;
  features: PropertyFeatures;
  listing?: PropertyListing;
  valuation: PropertyValuation;
  images: string[]; // URLs to property images
}

export interface PropertySearchResult {
  suggestions: PropertySuggestion[];
} 