import { createContext, ReactNode, useContext, useState } from 'react';
import { Property, PropertySuggestion } from '../types/property';

interface PropertyContextType {
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  searchResults: PropertySuggestion[];
  setSearchResults: (results: PropertySuggestion[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

interface PropertyProviderProps {
  children: ReactNode;
}

export const PropertyProvider = ({ children }: PropertyProviderProps) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchResults, setSearchResults] = useState<PropertySuggestion[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const value = {
    selectedProperty,
    setSelectedProperty,
    searchResults,
    setSearchResults,
    searchQuery,
    setSearchQuery,
    isSearching,
    setIsSearching,
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