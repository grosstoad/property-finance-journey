import { useState } from "react";

const PROPTRACK_API_BASE_URL =
  "https://stoplight.io/mocks/proptrack/apis/67669714";
const PROPTRACK_BEARER_TOKEN = "PROPTRACK_BEARER_TOKEN";

interface Address {
  fullAddress: string;
  unitNumber?: string;
  lotNumber?: string;
  streetNumber: string;
  streetName: string;
  streetType: string;
  suburb: string;
  postcode: number;
  state: string;
}

export interface AddressSuggestion {
  propertyId: string;
  address: Address;
}

interface UsePropTrackSuggestProps {
  query: string;
}

interface UsePropTrackSuggestResult {
  suggestions: AddressSuggestion[];
  isLoading: boolean;
  error: Error | null;
  fetchSuggestions: () => Promise<void>;
}

export const usePropTrackSuggest = ({
  query,
}: UsePropTrackSuggestProps): UsePropTrackSuggestResult => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSuggestions = async (): Promise<void> => {
    if (!query || query.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${PROPTRACK_API_BASE_URL}/api/v2/address/suggest?q=${encodeURIComponent(
          query
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${PROPTRACK_BEARER_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`PropTrack API error: ${response.status}`);
      }

      const data = await response.json();
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    suggestions,
    isLoading,
    error,
    fetchSuggestions,
  };
};
