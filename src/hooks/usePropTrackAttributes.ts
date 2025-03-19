import { useState } from "react";

const PROPTRACK_API_BASE_URL = `https://stoplight.io/mocks/proptrack/apis/67669715`;
const PROPTRACK_BEARER_TOKEN = "PROPTRACK_BEARER_TOKEN";

interface AttributeValue<T> {
  value: T;
  sourceDate?: string;
}

interface LandUseClassification {
  value: string;
}

interface PropertyAttributes {
  bedrooms?: AttributeValue<number>;
  bathrooms?: AttributeValue<number>;
  carSpaces?: AttributeValue<number>;
  floorArea?: AttributeValue<number>;
  landArea?: AttributeValue<number>;
  landUse?: {
    classifications: LandUseClassification[];
  };
  livingArea?: AttributeValue<number>;
  propertyType?: AttributeValue<string>;
  roofType?: AttributeValue<string>;
  wallType?: AttributeValue<string>;
  yearBuilt?: AttributeValue<number>;
  features?: string[];
}

interface PropertyAttributesResponse {
  propertyId: number | string;
  attributes: PropertyAttributes;
}

interface UsePropTrackAttributesProps {
  propertyId: string | null;
}

interface UsePropTrackAttributesResult {
  attributes: PropertyAttributes | null;
  isLoading: boolean;
  error: Error | null;
  fetchAttributes: () => Promise<void>;
}

export const usePropTrackAttributes = ({
  propertyId,
}: UsePropTrackAttributesProps): UsePropTrackAttributesResult => {
  const [attributes, setAttributes] = useState<PropertyAttributes | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAttributes = async (): Promise<void> => {
    if (!propertyId) {
      setAttributes(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${PROPTRACK_API_BASE_URL}/api/v2/properties/123456789/attributes`,
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

      const data: PropertyAttributesResponse = await response.json();
      setAttributes(data.attributes);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred")
      );
      setAttributes(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    attributes,
    isLoading,
    error,
    fetchAttributes,
  };
};
