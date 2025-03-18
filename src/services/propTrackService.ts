import {
  AddressSuggestion,
  AddressMatch,
  PropertySummary,
  PropertyAttributes,
  PropertyValuation,
  AuthResponse,
  PropTrackError
} from '../types/proptrack';

/**
 * PropTrack API Service
 * Handles authentication and provides methods to interact with the PropTrack API
 */
export class PropTrackService {
  private apiUrl: string;
  private proxyUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private isRefreshingToken: boolean = false;
  private tokenRefreshPromise: Promise<string> | null = null;

  constructor() {
    // Real API URL from env (used only for logging)
    this.apiUrl = import.meta.env.VITE_PROPTRACK_API_URL || '';
    this.apiKey = import.meta.env.VITE_PROPTRACK_API_KEY || '';
    this.apiSecret = import.meta.env.VITE_PROPTRACK_API_SECRET || '';
    
    // Proxy URL for ALL requests (to avoid CORS)
    this.proxyUrl = '/proptrack-api';

    if (!this.apiUrl || !this.apiKey || !this.apiSecret) {
      console.error('PropTrack API credentials not configured. Please check your .env file.');
    }
  }

  /**
   * Get the access token, refreshing if necessary
   */
  public async getAccessToken(): Promise<string> {
    const now = Date.now();

    // If token is still valid, return it
    if (this.accessToken && now < this.tokenExpiry) {
      return this.accessToken;
    }

    // If a token refresh is already in progress, wait for it
    if (this.isRefreshingToken && this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    // Start a new token refresh
    this.isRefreshingToken = true;
    this.tokenRefreshPromise = this.refreshAccessToken();

    try {
      this.accessToken = await this.tokenRefreshPromise;
      return this.accessToken;
    } finally {
      this.isRefreshingToken = false;
      this.tokenRefreshPromise = null;
    }
  }

  /**
   * Refresh the OAuth access token
   */
  private async refreshAccessToken(): Promise<string> {
    try {
      // Create API credentials string and encode it
      const credentials = `${this.apiKey}:${this.apiSecret}`;
      const encodedCredentials = btoa(credentials);

      // Use the proxy URL for token requests to avoid CORS
      const tokenUrl = `${this.proxyUrl}/oauth2/token`;
      
      console.log('Requesting token via proxy:', tokenUrl);
      
      // Build request for token
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${encodedCredentials}`
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token response error:', response.status, errorText);
        
        try {
          const errorData = JSON.parse(errorText) as PropTrackError;
          throw new Error(`Failed to get access token: ${JSON.stringify(errorData)}`);
        } catch (e) {
          throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json() as AuthResponse;
      console.log('Token received successfully');
      
      // Set token expiry time (subtract 60 seconds for safety margin)
      this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
      return data.access_token;
    } catch (error) {
      console.error('Error refreshing PropTrack access token:', error);
      throw error;
    }
  }

  /**
   * Make an authenticated API request
   */
  private async apiRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' = 'GET', 
    queryParams?: Record<string, string>,
    body?: any
  ): Promise<T> {
    try {
      const token = await this.getAccessToken();
      
      // Always use the proxy URL for all requests
      const url = new URL(`${this.proxyUrl}${endpoint}`, window.location.origin);
      
      // Add query parameters if provided
      if (queryParams) {
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, value);
          }
        });
      }

      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      if (body && method === 'POST') {
        headers['Content-Type'] = 'application/json';
      }

      const requestOptions: RequestInit = {
        method,
        headers,
        credentials: 'omit' // Don't send cookies with the request
      };

      if (body && method === 'POST') {
        requestOptions.body = JSON.stringify(body);
      }

      console.log(`Making ${method} request to ${url.toString()}`);
      
      // Make the request
      const response = await fetch(url.toString(), requestOptions);

      if (!response.ok) {
        // Try to parse error response
        const errorText = await response.text();
        console.error('API response error:', response.status, errorText);
        
        try {
          const errorData = JSON.parse(errorText) as PropTrackError;
          throw new Error(`PropTrack API error: ${JSON.stringify(errorData)}`);
        } catch (e) {
          // If can't parse JSON, use status text
          throw new Error(`PropTrack API error: ${response.status} ${response.statusText}`);
        }
      }

      return await response.json() as T;
    } catch (error) {
      console.error(`Error in PropTrack API request to ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get address suggestions based on partial input
   */
  public async getSuggestions(addressQuery: string, limit = 5): Promise<AddressSuggestion[]> {
    if (!addressQuery || addressQuery.trim().length < 3) {
      return [];
    }

    return this.apiRequest<AddressSuggestion[]>('/api/v2/address/suggest', 'GET', {
      q: addressQuery,
      numberOfResults: limit.toString()
    });
  }

  /**
   * Match an address string to a specific property
   */
  public async matchAddress(addressQuery: string): Promise<AddressMatch> {
    return this.apiRequest<AddressMatch>('/api/v2/address/match', 'GET', {
      q: addressQuery
    });
  }

  /**
   * Get property summary by propertyId
   */
  public async getPropertySummary(propertyId: string): Promise<PropertySummary> {
    return this.apiRequest<PropertySummary>(`/api/v2/properties/${propertyId}/summary`);
  }

  /**
   * Get property attributes by propertyId
   */
  public async getPropertyAttributes(propertyId: string): Promise<PropertyAttributes> {
    return this.apiRequest<PropertyAttributes>(`/api/v2/properties/${propertyId}/attributes`);
  }

  /**
   * Create a property valuation using the POST endpoint
   * This endpoint has different permissions than the GET endpoint and may work
   * when the GET endpoint returns 403 Forbidden
   * 
   * @param addressData Either a full address string or a propertyId
   * @param updatedAttributes Optional property attributes to enhance the valuation
   * @param additionalInfo Optional context for the valuation (loan amount, etc.)
   * @param requestType Optional request type (defaults to "enquiry")
   */
  public async createPropertyValuation(
    addressData: { fullAddress: string } | { propertyId: string },
    updatedAttributes?: {
      bedrooms?: number;
      bathrooms?: number;
      carSpaces?: number;
      propertyType?: string;
      landArea?: number;
      floorArea?: number;
    },
    additionalInfo?: {
      applicantEstimate?: number;
      loanAmount?: number;
      customerReference?: string;
    },
    requestType: 'enquiry' | 'origination' = 'enquiry'
  ): Promise<PropertyValuation> {
    // Build the request body
    const body: Record<string, any> = {
      requestType
    };
    
    // Add address information (either fullAddress or propertyId)
    if ('fullAddress' in addressData) {
      body.fullAddress = addressData.fullAddress;
    } else {
      body.propertyId = addressData.propertyId;
    }
    
    // Add optional property attributes if provided
    if (updatedAttributes && Object.keys(updatedAttributes).length > 0) {
      body.updatedAttributes = updatedAttributes;
    }
    
    // Add optional additional information if provided
    if (additionalInfo && Object.keys(additionalInfo).length > 0) {
      body.additionalInformation = additionalInfo;
    }
    
    console.log('Creating property valuation with:', body);
    
    // Make the POST request
    return this.apiRequest<PropertyValuation>('/api/v1/properties/valuations/sale', 'POST', {}, body);
  }
} 