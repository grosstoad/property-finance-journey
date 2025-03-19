import { useState } from "react";

const PROPTRACK_API_BASE_URL =
  "https://stoplight.io/mocks/proptrack/apis/67669714";
const PROPTRACK_BEARER_TOKEN = "PROPTRACK_BEARER_TOKEN";

interface Address {
  fullAddress: string;
  lotNumber?: string;
  unitNumber?: string;
  streetNumber: string;
  streetName: string;
  streetType: string;
  suburb: string;
  state: string;
  postcode: string;
}

type MatchScore = "EXCELLENT" | "GOOD" | "FAIR" | "POOR";

interface MatchResult {
  propertyId: string;
  gpid: string;
  matchScore: MatchScore;
  address: Address;
}

interface UsePropTrackMatchProps {
  address: string;
}

interface UsePropTrackMatchResult {
  match: MatchResult | null;
  isLoading: boolean;
  error: Error | null;
  fetchMatch: () => Promise<void>;
}

export const usePropTrackMatch = ({
  address,
}: UsePropTrackMatchProps): UsePropTrackMatchResult => {
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMatch = async (): Promise<void> => {
    if (!address || address.trim().length === 0) {
      setMatch(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${PROPTRACK_API_BASE_URL}/api/v2/address/match?q=${encodeURIComponent(
          address
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
      setMatch(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred")
      );
      setMatch(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    match,
    isLoading,
    error,
    fetchMatch,
  };
};
