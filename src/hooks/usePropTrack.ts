import { useState, useCallback, useRef } from "react";
import { PropTrackService } from "../services/propTrackService";
import {
  AddressSuggestion,
  AddressMatch,
  PropertySummary,
  PropertyAttributes,
  PropertyValuation,
} from "../types/proptrack";

export const usePropTrack = () => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [addressMatch, setAddressMatch] = useState<AddressMatch | null>(null);
  const [propertySummary, setPropertySummary] =
    useState<PropertySummary | null>(null);
  const [propertyAttributes, setPropertyAttributes] =
    useState<PropertyAttributes | null>(null);
  const [propertyValuation, setPropertyValuation] =
    useState<PropertyValuation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce the suggestions request
  const debounceTimeoutRef = useRef<number | null>(null);

  // Create a singleton instance of the PropTrackService
  const serviceRef = useRef<PropTrackService | null>(null);
  if (!serviceRef.current) {
    serviceRef.current = new PropTrackService();
  }

  /**
   * Get address suggestions with debounce
   */
  const getAddressSuggestions = useCallback(async (query: string) => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    // Clear previous timeout if it exists
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set a new timeout
    debounceTimeoutRef.current = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        if (!serviceRef.current) {
          throw new Error("PropTrack service not initialized");
        }

        const results = await serviceRef.current.getSuggestions(query);
        setSuggestions(results);
      } catch (err) {
        console.error("Error getting address suggestions:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce
  }, []);

  /**
   * Match a full address
   */
  const matchAddress = useCallback(async (address: string) => {
    try {
      setLoading(true);
      setError(null);
      setAddressMatch(null);
      setPropertySummary(null);
      setPropertyAttributes(null);
      setPropertyValuation(null);

      if (!serviceRef.current) {
        throw new Error("PropTrack service not initialized");
      }

      const result = await serviceRef.current.matchAddress(address);
      setAddressMatch(result);
      return result;
    } catch (err) {
      console.error("Error matching address:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get property details by propertyId
   */
  const getPropertyDetails = useCallback(async (propertyId: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!serviceRef.current) {
        throw new Error("PropTrack service not initialized");
      }

      let attributes = null;
      let valuation = null;

      try {
        // Try to get property attributes - this endpoint works
        attributes = await serviceRef.current.getPropertyAttributes(propertyId);
        setPropertyAttributes(attributes);
      } catch (attributesError) {
        console.error("Error getting property attributes:", attributesError);
        // Don't set the main error here, just log it
      }

      try {
        // Try to get property valuation using the POST endpoint
        // Use attributes data to enhance valuation if available
        const valuationParams: Partial<{
          bedrooms: number;
          bathrooms: number;
          carSpaces: number;
          landArea: number;
          floorArea: number;
          propertyType: string;
        }> = {};

        if (attributes?.attributes) {
          const attrs = attributes.attributes;

          if (attrs.bedrooms) valuationParams.bedrooms = attrs.bedrooms.value;
          if (attrs.bathrooms)
            valuationParams.bathrooms = attrs.bathrooms.value;
          if (attrs.carSpaces)
            valuationParams.carSpaces = attrs.carSpaces.value;
          if (attrs.landArea) valuationParams.landArea = attrs.landArea.value;
          if (attrs.floorArea)
            valuationParams.floorArea = attrs.floorArea.value;
          if (attrs.propertyType)
            valuationParams.propertyType = attrs.propertyType.value;
        }

        valuation = await serviceRef.current.createPropertyValuation(
          { propertyId },
          Object.keys(valuationParams).length > 0 ? valuationParams : undefined
        );

        setPropertyValuation(valuation);
      } catch (valuationError) {
        console.error("Error getting property valuation:", valuationError);
        // Don't set the main error here, just log it
      }

      // Only set error if all requests failed
      if (!attributes && !valuation) {
        throw new Error("Failed to retrieve any property details");
      }

      return { attributes, valuation };
    } catch (err) {
      console.error("Error getting property details:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear all data
   */
  const clearData = useCallback(() => {
    setSuggestions([]);
    setAddressMatch(null);
    setPropertySummary(null);
    setPropertyAttributes(null);
    setPropertyValuation(null);
    setError(null);
  }, []);

  return {
    suggestions,
    addressMatch,
    propertySummary,
    propertyAttributes,
    propertyValuation,
    loading,
    error,
    getAddressSuggestions,
    matchAddress,
    getPropertyDetails,
    clearData,
  };
};
