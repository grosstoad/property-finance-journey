export interface AddressSuggestion {
  propertyId: string;
  address: {
    fullAddress: string;
    unitNumber?: string;
    streetNumber?: string;
    streetName?: string;
    streetType?: string;
    suburb: string;
    postcode: number;
    state: string;
  };
}

export interface AddressMatch {
  propertyId: string;
  address: {
    fullAddress: string;
    unitNumber?: string;
    streetNumber?: string;
    streetName?: string;
    streetType?: string;
    suburb: string;
    postcode: number;
    state: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
  matchQuality: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
}

export interface PropertySummary {
  propertyId: number;
  address: {
    fullAddress: string;
    unitNumber: string | null;
    streetNumber: string;
    streetName: string;
    streetType: string;
    suburb: string;
    state: string;
    postcode: string;
    location: {
      latitude: number;
      longitude: number;
    };
  };
  attributes: {
    bedrooms: {
      value: number;
      sourceDate: string;
    };
    bathrooms: {
      value: number;
      sourceDate: string;
    };
    carSpaces: {
      value: number;
      sourceDate: string;
    };
    livingArea: {
      value: number;
      sourceDate: string;
    } | null;
    landArea: {
      value: number;
      sourceDate: string;
    } | null;
    propertyType: {
      value: string;
      sourceDate: string;
    };
  };
  recentSale?: {
    transactionDate: string;
    sourceCategory: string;
    saleValueSuppressed: boolean;
    listingId: string;
  };
  image?: {
    id: string;
    extension: string;
    type: string;
    sha: string;
  };
  activeListings: any[];
  marketStatus: string[];
}

export interface PropertyAttributes {
  propertyId: number;
  attributes: {
    bedrooms?: {
      value: number;
      sourceDate: string;
    };
    bathrooms?: {
      value: number;
      sourceDate: string;
    };
    carSpaces?: {
      value: number;
      sourceDate: string;
    };
    floorArea?: {
      value: number;
      sourceDate: string;
    };
    landArea?: {
      value: number;
      sourceDate: string;
    };
    landUse?: {
      classifications: Array<{
        value: string;
      }>;
    };
    livingArea?: {
      value: number;
      sourceDate: string;
    };
    propertyType?: {
      value: string;
      sourceDate: string;
    };
    roofType?: {
      value: string;
      sourceDate: string;
    };
    wallType?: {
      value: string;
      sourceDate: string;
    };
    yearBuilt?: {
      value: number;
      sourceDate: string;
    };
    features?: string[];
  };
}

export interface PropertyValuation {
  valuationId: string;
  valuationDate: string;
  effectiveDate: string;
  propertyId: number;
  estimatedValue: number;
  fsd: number;
  upperRangeValue: number;
  lowerRangeValue: number;
  usedAttributes: {
    bedrooms: number;
    bathrooms: number;
    carSpaces: number;
    propertyType: string;
  };
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface PropTrackError {
  errors: Array<{
    code: number;
    level: string;
    description: string;
    parameters?: Record<string, string>;
  }>;
} 