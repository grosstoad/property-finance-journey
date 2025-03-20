import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  DepositDetails, 
  LoanPurposeType, 
  PropertyDetails, 
  PropertyType 
} from '../types/FinancialTypes';
import { GLOBAL_LIMITS } from '../constants/financialConstants';
import { calculateDepositDetails } from '../logic/calculateMaxBorrowingDeposit';

// Define property suggestion and property types
interface PropertySuggestion {
  id: string;
  fullAddress: string;
}

interface Property {
  id: string;
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
    fullAddress: string;
  };
  features: {
    bedrooms: number;
    bathrooms: number;
    carSpaces: number;
    landSize: number;
    buildingSize: number;
  };
  valuation: {
    low: number;
    mid: number;
    high: number;
    confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  images: string[];
}

interface PropertyContextType {
  propertyDetails: PropertyDetails;
  updateProperty: (updates: Partial<PropertyDetails>) => void;
  depositDetails: DepositDetails;
  requiredLoanAmount: number;
  updateSavings: (savings: number) => void;
  updatePropertyPrice: (price: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: PropertySuggestion[];
  setSearchResults: (results: PropertySuggestion[]) => void;
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

// Initialize with default values
const getDefaultPropertyDetails = (): PropertyDetails => {
  return {
    address: '',
    postcode: '2000', // Default to Sydney CBD
    propertyType: PropertyType.HOUSE,
    propertyValue: 750000, // Default property value
    purpose: LoanPurposeType.OWNER_OCCUPIED,
    isFirstHomeBuyer: false
  };
};

const getDefaultDepositDetails = (): DepositDetails => {
  return {
    savings: 150000, // Default savings
    depositAmount: 150000 - GLOBAL_LIMITS.DEFAULT_UPFRONT_COSTS, // Savings minus upfront costs
    stampDuty: 0, // Will be calculated
    otherCosts: GLOBAL_LIMITS.DEFAULT_UPFRONT_COSTS
  };
};

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails>(getDefaultPropertyDetails());
  const [depositDetails, setDepositDetails] = useState<DepositDetails>(getDefaultDepositDetails());
  const [requiredLoanAmount, setRequiredLoanAmount] = useState<number>(0);
  
  // Add new states for property search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<PropertySuggestion[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  
  // Calculate deposit details whenever property details or savings change
  useEffect(() => {
    const updatedDepositDetails = calculateDepositDetails(
      propertyDetails.propertyValue,
      depositDetails.savings,
      propertyDetails
    );
    
    setDepositDetails(updatedDepositDetails);
    
    // Calculate required loan amount
    const newRequiredLoanAmount = Math.max(
      0, 
      propertyDetails.propertyValue - updatedDepositDetails.depositAmount
    );
    setRequiredLoanAmount(newRequiredLoanAmount);
  }, [propertyDetails, depositDetails.savings]);
  
  const updateProperty = (updates: Partial<PropertyDetails>) => {
    setPropertyDetails((prev: PropertyDetails) => ({ ...prev, ...updates }));
  };
  
  const updateSavings = (savings: number) => {
    setDepositDetails((prev: DepositDetails) => ({ ...prev, savings }));
  };
  
  const updatePropertyPrice = (price: number) => {
    setPropertyDetails((prev: PropertyDetails) => ({ ...prev, propertyValue: price }));
  };
  
  const value = {
    propertyDetails,
    updateProperty,
    depositDetails,
    requiredLoanAmount,
    updateSavings,
    updatePropertyPrice,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    selectedProperty,
    setSelectedProperty,
    isSearching,
    setIsSearching
  };
  
  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = (): PropertyContextType => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
}; 