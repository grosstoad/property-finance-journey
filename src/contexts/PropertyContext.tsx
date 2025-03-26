import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  DepositDetails, 
  LoanPurposeType, 
  PropertyDetails, 
  PropertyType 
} from '../types/FinancialTypes';
import { GLOBAL_LIMITS } from '../constants/financialConstants';
import { depositService } from '../logic/depositService';

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

// Create the PropertyContext
const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

const getDefaultPropertyDetails = (): PropertyDetails => {
  return {
    address: '',
    postcode: '',
    propertyType: PropertyType.HOUSE,
    propertyValue: 800000,
    purpose: LoanPurposeType.OWNER_OCCUPIED,
    isFirstHomeBuyer: false,
  };
};

const getDefaultDepositDetails = (): DepositDetails => {
  return {
    savings: 200000,
    depositAmount: 160000,
    stampDuty: 32000,
    otherCosts: 3000,
  };
};

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails>(getDefaultPropertyDetails());
  const [depositDetails, setDepositDetails] = useState<DepositDetails>(getDefaultDepositDetails());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PropertySuggestion[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Calculate required loan amount
  const requiredLoanAmount = propertyDetails.propertyValue - depositDetails.depositAmount;
  
  // Recalculate deposit details when property value or savings changes
  useEffect(() => {
    // Get property details for deposit calculation
    const isInvestmentProperty = propertyDetails.purpose === LoanPurposeType.INVESTMENT;
    
    // Calculate deposit components
    const { stampDuty, legalFees, otherUpfrontCosts } = depositService.calculateDepositComponents(
      propertyDetails.propertyValue,
      propertyDetails.postcode.substring(0, 3) || 'NSW', // Use first 3 digits of postcode as state or default to NSW
      propertyDetails.isFirstHomeBuyer,
      isInvestmentProperty
    );
    
    // Calculate available for deposit
    const totalUpfrontCosts = stampDuty + legalFees + otherUpfrontCosts;
    const depositAmount = Math.max(0, depositDetails.savings - totalUpfrontCosts);
    
    // Update deposit details
    setDepositDetails(prev => ({
      ...prev,
      depositAmount,
      stampDuty,
      otherCosts: legalFees + otherUpfrontCosts
    }));
  }, [propertyDetails.propertyValue, depositDetails.savings, propertyDetails.isFirstHomeBuyer, propertyDetails.purpose, propertyDetails.postcode]);
  
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