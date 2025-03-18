# PropTrack API Integration Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Getting Started](#getting-started)
4. [API Endpoints](#api-endpoints)
   - [Address API](#address-api)
   - [Listings API](#listings-api)
   - [Market API](#market-api)
   - [Properties API](#properties-api)
   - [Reports API](#reports-api)
   - [Transactions API](#transactions-api)
5. [Common Workflows](#common-workflows)
6. [Error Handling](#error-handling)
7. [Pagination](#pagination)
8. [Rate Limiting](#rate-limiting)
9. [Disclaimers and Legal Requirements](#disclaimers-and-legal-requirements)
10. [Getting Support](#getting-support)

## Introduction

PropTrack APIs provide access to comprehensive real estate data across Australia, with over 1 trillion data points covering more than 12 million properties. This guide details how to integrate with PropTrack's APIs to build powerful property applications.

## Authentication

PropTrack APIs use OAuth 2.0 for authentication. Follow these steps:

### Step 1: Generate an Access Token

**Endpoint:** `POST /oauth2/token`

**Headers:**
- `Content-Type: application/x-www-form-urlencoded`
- `Authorization: Basic {base64_encoded_credentials}`
  - The credentials should be in the format `api_key:api_secret` and base64 encoded
  - Example: If your key is "myapikey" and secret is "myapisecret", you would encode "myapikey:myapisecret"

**Request Body:**
- `grant_type=client_credentials` (always required)

**Example Request:**
```bash
curl --request POST \
  --url https://data.proptrack.com/oauth2/token \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --header 'Authorization: Basic bXlhcGlrZXk6bXlhcGlzZWNyZXQ=' \
  --data grant_type=client_credentials
```

**Example Response:**
```json
{
  "access_token": "eyJrarY0doWW9nWmJJXC9FQWlrZXNuWUk9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI2c2QxNGVpNTVkazg1OWxjcG4yZ2tnM2JuYyIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoic_lLWFw",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### Step 2: Use the Token in API Requests

Include the token in all API requests in the Authorization header:

```bash
Authorization: Bearer eyJrarY0doWW9nWmJJXC9FQWlrZXNuWUk9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI2c2QxNGVpNTVkazg1OWxjcG4yZ2tnM2JuYyIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoic_lLWFw
```

### Token Management Best Practices

1. Tokens expire after 3600 seconds (1 hour)
2. Implement token refresh logic that gets a new token before the current one expires
3. Store tokens securely and never expose them in client-side code
4. Use a secure storage mechanism (like environment variables or a secrets manager)

## Getting Started

### Base URL

All PropTrack API endpoints use the following base URL:
```
https://data.proptrack.com
```

## API Endpoints

### Address API

#### 1. Address Suggest API

**Endpoint:** `GET /api/v2/address/suggest`

**Purpose:** Returns a list of suggested addresses based on a partial address string.

**Required Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| q | string | Address string to search | "1/67 Louisa Rd" |

**Optional Parameters:**
| Parameter | Type | Description | Default | Constraints | Example |
|-----------|------|-------------|---------|------------|---------|
| numberOfResults | integer | Maximum number of results | 25 | 1-25 | 10 |

**Headers:**
- `Authorization: Bearer {access_token}`

**Example Request:**
```bash
curl --request GET \
  --url 'https://data.proptrack.com/api/v2/address/suggest?q=1%2F67%20Louisa%20Rd&numberOfResults=5' \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer {access_token}'
```

**Example Response:**
```json
[
  {
    "propertyId": "1026185",
    "address": {
      "fullAddress": "1/67 Louisa Rd, Birchgrove, NSW 2041",
      "unitNumber": "UNIT 1",
      "streetNumber": "67",
      "streetName": "LOUISA",
      "streetType": "RD",
      "suburb": "BIRCHGROVE",
      "postcode": 2041,
      "state": "NSW"
    }
  },
  {
    "propertyId": "1026131",
    "address": {
      "fullAddress": "1/2-6 Louisa Rd, Birchgrove, NSW 2041",
      "unitNumber": "UNIT 1",
      "streetNumber": "2-6",
      "streetName": "LOUISA",
      "streetType": "RD",
      "suburb": "BIRCHGROVE",
      "postcode": 2041,
      "state": "NSW"
    }
  }
  // Additional results...
]
```

#### 2. Address Match API

**Endpoint:** `GET /api/v2/address/match`

**Purpose:** Matches an address string to a specific property record.

**Required Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| q | string | Full address to match | "1/67 Louisa Rd, Birchgrove, NSW 2041" |

**Headers:**
- `Authorization: Bearer {access_token}`

**Example Request:**
```bash
curl --request GET \
  --url 'https://data.proptrack.com/api/v2/address/match?q=1%2F67%20Louisa%20Rd%2C%20Birchgrove%2C%20NSW%202041' \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer {access_token}'
```

**Example Response:**
```json
{
  "propertyId": "1026185",
  "address": {
    "fullAddress": "1/67 Louisa Rd, Birchgrove, NSW 2041",
    "unitNumber": "UNIT 1",
    "streetNumber": "67",
    "streetName": "LOUISA",
    "streetType": "RD",
    "suburb": "BIRCHGROVE",
    "postcode": 2041,
    "state": "NSW",
    "location": {
      "latitude": -33.848256,
      "longitude": 151.182632
    }
  },
  "matchQuality": "EXCELLENT"
}
```

### Listings API

#### 1. Get Listing by ID

**Endpoint:** `GET /api/v2/listings/{listingId}`

**Purpose:** Retrieves detailed information about a specific property listing.

**Path Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| listingId | string | Unique identifier for a listing | "7654321" |

**Headers:**
- `Authorization: Bearer {access_token}`

**Example Request:**
```bash
curl --request GET \
  --url https://data.proptrack.com/api/v2/listings/7654321 \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer {access_token}'
```

**Example Response:**
```json
{
  "listingId": "7654321",
  "propertyId": 1234567,
  "attributes": {
    "bedrooms": 4,
    "bathrooms": 2,
    "carSpaces": 2,
    "floorArea": 260,
    "landArea": 600,
    "propertyType": "house",
    "propertySubType": "house",
    "yearBuilt": 1998,
    "features": [
      "airConditioning"
    ]
  },
  "auctionDateTime": "2023-02-19T12:00:00+10:00",
  "auctionDate": "2023-02-19",
  "auctionTime": "01:00:00 pm",
  "description": "This stunning apartment is located in the heart of Baulkham Hills",
  "firstSeenDate": "2022-12-23",
  "listingType": "sale",
  "priceDescription": "Offers over $3,000,000",
  "listingPrice": 2850000,
  "status": "current",
  "source": "REA",
  "videoUrl": "https://www.youtube.com/embed/j4clLwXYYXA",
  "images": [
    {
      "id": "d300f1a395373a8622bb0fa1b2ec53d42951d5d363defc75d18a479b06d800c4.jpg",
      "extension": "jpg",
      "type": "image",
      "orderIndex": 0,
      "date": "2022-12-23",
      "sha": "d300f1a395373a8622bb0fa1b2ec53d42951d5d363defc75d18a479b06d800c4"
    }
    // Additional images...
  ],
  "attachments": [
    {
      "url": "https://insights.proptrack.com/documents/ba1666e6d06417d8fcdc2d4f2b622396a64d2ada61326e84b21682052af40ad8/statement.pdf",
      "type": "statement_of_information",
      "date": "2022-06-21"
    }
  ],
  "energyEfficiencyRating": 2
}
```

#### 2. Point and Radius Search for Listings

**Endpoint:** `GET /api/v2/listings/search/point-and-radius`

**Purpose:** Searches for listings within a specified radius of a location point.

**Required Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| listingTypes | string | Type of listings (comma-separated) | "sale,rent" |
| pointType | string | Type of point reference | "propertyId" or "latLong" |
| propertyId | integer | Property ID (required if pointType is propertyId) | 123456789 |
| latitude | number | Latitude (required if pointType is latLong) | -34.05438 |
| longitude | number | Longitude (required if pointType is latLong) | 151.6941 |

**Optional Parameters:**
| Parameter | Type | Description | Default | Constraints | Example |
|-----------|------|-------------|---------|------------|---------|
| radius | integer | Search radius in meters | 2000 | ≤ 55000 | 5000 |
| propertyTypes | string | Types of properties (comma-separated) | | "house,unit" | "house" |
| status | string | Status of listings (comma-separated) | | "current,sold,notSold,notLeased,leased" | "current" |
| bedroomsMin | integer | Minimum number of bedrooms | | | 2 |
| bedroomsMax | integer | Maximum number of bedrooms | | | 4 |
| bathroomsMin | integer | Minimum number of bathrooms | | | 1 |
| bathroomsMax | integer | Maximum number of bathrooms | | | 3 |
| carSpacesMin | integer | Minimum number of car spaces | | | 1 |
| carSpacesMax | integer | Maximum number of car spaces | | | 2 |
| landAreaMin | integer | Minimum land area (m²) | | | 500 |
| landAreaMax | integer | Maximum land area (m²) | | | 650 |
| priceMin | integer | Minimum price | | | 1200000 |
| priceMax | integer | Maximum price | | | 1500000 |
| startDate | string (date) | Start of date range (YYYY-MM-DD) | 6 months prior | | "2022-11-04" |
| endDate | string (date) | End of date range (YYYY-MM-DD) | today | | "2023-05-04" |
| sortBy | string | Sort order | "distanceAsc" | "distanceAsc", "dateAsc", "dateDesc" | "dateDesc" |
| pageSize | integer | Results per page | 25 | ≤ 200 | 100 |
| afterPageCursor | string | Pagination cursor for next page | | | "MAo=" |
| beforePageCursor | string | Pagination cursor for previous page | | | "MzAwMAo=" |

**Headers:**
- `Authorization: Bearer {access_token}`

**Example Request:**
```bash
curl --request GET \
  --url 'https://data.proptrack.com/api/v2/listings/search/point-and-radius?listingTypes=sale&pointType=propertyId&propertyId=123456789&radius=5000&status=current&propertyTypes=house&bedroomsMin=3&pageSize=2' \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer {access_token}'
```

**Example Response:**
```json
{
  "numberOfResults": 274,
  "pageInfo": {
    "pageStartCursor": "MA==",
    "pageEndCursor": "MQ==",
    "hasPreviousPage": false,
    "hasNextPage": true
  },
  "listings": [
    {
      "distance": 88,
      "listingId": "438163928",
      "propertyId": 890374,
      "listingType": "sale",
      "address": {
        "fullAddress": "18 Junction Street, Woollahra, NSW 2025",
        "location": {
          "longitude": 151.25029,
          "latitude": -33.89027
        }
      },
      "attributes": {
        "propertyType": "house",
        "bedrooms": 4,
        "bathrooms": 2,
        "carSpaces": 2,
        "propertySubType": "house",
        "features": [
          "airConditioning"
        ]
      },
      "source": "REA",
      "status": "current",
      "description": "This stunning house with modern features...",
      "firstSeenDate": "2023-11-29",
      "listingPrice": 2850000,
      "priceDescription": "$2,850,000",
      "images": [
        {
          "id": "300e166634cc27add8556a47dee72dc8b35d82f441d80f61754d36731a695984.jpg",
          "date": "2023-11-29",
          "extension": "jpg",
          "orderIndex": 0,
          "sha": "300e166634cc27add8556a47dee72dc8b35d82f441d80f61754d36731a695984",
          "type": "image"
        }
        // Additional images...
      ],
      "saleDate": null,
      "energyEfficiencyRating": 2
    },
    // Additional listings...
  ]
}
```

### Market API

#### 1. Market Supply and Demand

**Endpoint:** `GET /api/v2/market/supply-and-demand/{metric}`

**Purpose:** Retrieves property supply and consumer demand statistics for a given suburb.

**Path Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| metric | string | Market metric | "potential-buyers" or "potential-renters" |

**Required Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| postcode | integer | Four-digit postcode | 2000 |
| propertyTypes | string | Types of properties (comma-separated) | "house,unit" |
| state | string | State or territory abbreviation | "nsw" |
| suburb | string | Suburb name | "Sydney" |

**Optional Parameters:**
| Parameter | Type | Description | Default | Example |
|-----------|------|-------------|---------|---------|
| frequency | string | Reporting frequency | "monthly" | "weekly" |
| startDate | string (date) | Start date (YYYY-MM-DD) | 12 months prior | "2022-08-01" |
| endDate | string (date) | End date (YYYY-MM-DD) | today | "2022-09-30" |

**Headers:**
- `Authorization: Bearer {access_token}`

**Example Request:**
```bash
curl --request GET \
  --url 'https://data.proptrack.com/api/v2/market/supply-and-demand/potential-buyers?postcode=2000&propertyTypes=house&state=nsw&suburb=Sydney&frequency=monthly' \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer {access_token}'
```

**Example Response:**
```json
[
  {
    "propertyType": "house",
    "dateRanges": [
      {
        "startDate": "2022-09-01",
        "endDate": "2022-09-30",
        "metricValues": [
          {
            "bedrooms": "1",
            "supply": 22,
            "demand": 921,
            "supplyChangePercentage": 24.1379310344,
            "demandChangePercentage": 2.12539851222
          },
          {
            "bedrooms": "2",
            "supply": 28,
            "demand": 1044,
            "supplyChangePercentage": 19.175,
            "demandChangePercentage": 1.77753654
          }
          // Additional bedroom categories...
        ]
      },
      {
        "startDate": "2022-08-01",
        "endDate": "2022-08-31",
        "metricValues": [
          // Previous month's metrics...
        ]
      }
    ]
  },
  {
    "propertyType": "unit",
    "dateRanges": [
      // Unit property metrics...
    ]
  }
]
```

#### 2. Market Sale History

**Endpoint:** `GET /api/v2/market/sale/historic/{metric}`

**Purpose:** Retrieves historic sale transaction statistics for a given suburb.

**Path Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| metric | string | Market metric | (Check documentation for available metrics) |

**Required Parameters:**
- Same as Market Supply and Demand API

#### 3. Market Rent History

**Endpoint:** `GET /api/v2/market/rent/historic/{metric}`

**Purpose:** Retrieves historic rental transaction statistics for a given suburb.

**Path Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| metric | string | Market metric | (Check documentation for available metrics) |

**Required Parameters:**
- Same as Market Supply and Demand API

#### 4. Market Auctions

**Endpoint:** `GET /api/v2/market/auctions`

**Purpose:** Retrieves auction result statistics.

**Required Parameters:**
- State, suburb, or capital city statistical area information

### Properties API

#### 1. Property Summary

**Endpoint:** `GET /api/v2/properties/{propertyId}/summary`

**Purpose:** Retrieves a summary view of a property with key attributes and market status.

**Path Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| propertyId | integer | Unique identifier for a property | 3987592 |

**Headers:**
- `Authorization: Bearer {access_token}`

**Example Request:**
```bash
curl --request GET \
  --url https://data.proptrack.com/api/v2/properties/3987592/summary \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer {access_token}'
```

**Example Response:**
```json
{
  "propertyId": 3987592,
  "address": {
    "fullAddress": "21 STANLEY ST RICHMOND VIC 3121",
    "unitNumber": null,
    "streetNumber": "21",
    "streetName": "STANLEY",
    "streetType": "ST",
    "suburb": "RICHMOND",
    "state": "VIC",
    "postcode": "3121",
    "location": {
      "latitude": -37.82364584,
      "longitude": 144.99504193
    }
  },
  "attributes": {
    "bedrooms": {
      "value": 3,
      "sourceDate": "2024-11-06"
    },
    "bathrooms": {
      "value": 1,
      "sourceDate": "2024-11-06"
    },
    "carSpaces": {
      "value": 4,
      "sourceDate": "2024-11-06"
    },
    "livingArea": null,
    "landArea": {
      "value": 420,
      "sourceDate": "2024-11-06"
    },
    "propertyType": {
      "value": "house",
      "sourceDate": "2024-11-06"
    }
  },
  "recentSale": {
    "transactionDate": "2024-11-28",
    "sourceCategory": "agency",
    "saleValueSuppressed": true,
    "listingId": "146535076"
  },
  "image": {
    "id": "e7f71870fef11b2dcec2e1b65f6bae2287aa84058a9ddbc8673378dc9856bf23.jpg",
    "extension": "jpg",
    "type": "image",
    "sha": "e7f71870fef11b2dcec2e1b65f6bae2287aa84058a9ddbc8673378dc9856bf23"
  },
  "activeListings": [],
  "marketStatus": [
    "recentlySold"
  ]
}
```

#### 2. Property Attributes

**Endpoint:** `GET /api/v2/properties/{propertyId}/attributes`

**Purpose:** Retrieves comprehensive property attributes and features.

**Path Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| propertyId | integer | Unique identifier for a property | 123456789 |

**Headers:**
- `Authorization: Bearer {access_token}`

**Example Request:**
```bash
curl --request GET \
  --url https://data.proptrack.com/api/v2/properties/123456789/attributes \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer {access_token}'
```

**Example Response:**
```json
{
  "propertyId": 123456789,
  "attributes": {
    "bedrooms": {
      "value": 4,
      "sourceDate": "2023-01-25"
    },
    "bathrooms": {
      "value": 2,
      "sourceDate": "2023-01-25"
    },
    "carSpaces": {
      "value": 2,
      "sourceDate": "2023-01-25"
    },
    "floorArea": {
      "value": 325,
      "sourceDate": "2023-01-25"
    },
    "landArea": {
      "value": 650,
      "sourceDate": "2023-01-25"
    },
    "landUse": {
      "classifications": [
        {
          "value": "residential"
        }
      ]
    },
    "livingArea": {
      "value": 0,
      "sourceDate": "2023-01-25"
    },
    "propertyType": {
      "value": "unit",
      "sourceDate": "2023-01-25"
    },
    "roofType": {
      "value": "colorbond",
      "sourceDate": "2023-01-25"
    },
    "wallType": {
      "value": "brick",
      "sourceDate": "2023-01-25"
    },
    "yearBuilt": {
      "value": 2019,
      "sourceDate": "2023-01-25"
    },
    "features": [
      "airConditioning"
    ]
  }
}
```

#### 3. Property Listings

**Endpoint:** `GET /api/v2/properties/{propertyId}/listings`

**Purpose:** Retrieves current and historic listings for a specific property.

**Path Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| propertyId | string | Unique identifier for a property | "1234567" |

**Optional Query Parameters:**
| Parameter | Type | Description | Default | Example |
|-----------|------|-------------|---------|---------|
| latestListingOnly | boolean | Return only the most recent listing | false | true |
| listingType | string | Filter by listing type | | "sale" |
| numberOfResults | integer | Limit the number of listings returned | 25 | 5 |
| status | string | Filter by listing status | | "sold" |

**Headers:**
- `Authorization: Bearer {access_token}`

**Example Request:**
```bash
curl --request GET \
  --url 'https://data.proptrack.com/api/v2/properties/1234567/listings?listingType=sale&status=current' \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer {access_token}'
```

**Example Response:**
```json
{
  "propertyId": "1234567",
  "listings": [
    {
      "listingId": "7654321",
      "attributes": {
        "bedrooms": 4,
        "bathrooms": 2,
        "carSpaces": 2,
        "floorArea": 143,
        "landArea": 615,
        "propertyType": "house",
        "propertySubType": "house",
        "features": [
          "builtInRobes",
          "airConditioning"
        ]
      },
      "auctionDate": "2022-06-24",
      "auctionTime": "11:00:00 am",
      "description": "This stunning apartment is located in the heart of Baulkham Hills",
      "firstSeenDate": "2022-06-21",
      "listingType": "sale",
      "priceDescription": "Offers over $3,000,000",
      "listingPrice": 2850000,
      "status": "current",
      "source": "REA",
      "videoUrl": "https://www.youtube.com/embed/j4clLwXYYXA",
      "images": [
        {
          "id": "d300f1a395373a8622bb0fa1b2ec53d42951d5d363defc75d18a479b06d800c4.jpg",
          "extension": "jpg",
          "type": "image",
          "orderIndex": 0,
          "date": "2022-06-21",
          "sha": "d300f1a395373a8622bb0fa1b2ec53d42951d5d363defc75d18a479b06d800c4"
        }
        // Additional images...
      ],
      "attachments": [
        {
          "url": "https://insights.proptrack.com/documents/ba1666e6d06417d8fcdc2d4f2b622396a64d2ada61326e84b21682052af40ad8/statement.pdf",
          "type": "statement_of_information",
          "date": "2022-06-21"
        }
      ],
      "energyEfficiencyRating": 2
    }
  ]
}
```

#### 4. Automated Valuation Model (AVM) - Address Based

**Endpoint:** `POST /api/v1/properties/valuations/sale`

**Purpose:** Orders a sale valuation from PropTrack's AVM for a given address string.

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {access_token}`

**Request Body Parameters:**
| Parameter | Type | Description | Required | Example |
|-----------|------|-------------|----------|---------|
| fullAddress | string | Full address of the property | Yes (if address object not provided) | "1/67 Louisa Rd, Birchgrove, NSW 2041" |
| address | object | Detailed address components | Yes (if fullAddress not provided) | (See below) |
| effectiveDate | string (date) | Effective date for valuation | No | "2022-06-30" |
| updatedAttributes | object | Customer supplied property attributes | No | (See below) |
| additionalInformation | object | Additional data for valuation | No | (See below) |

**Address Object:**
```json
{
  "lotNumber": "Lot 123",
  "unitNumber": "Unit 1",
  "streetNumber": "67",
  "streetName": "Louisa",
  "streetType": "Rd",
  "suburb": "Birchgrove",
  "state": "NSW",
  "postCode": "2041"
}
```

**Updated Attributes Object:**
```json
{
  "bedrooms": 4,
  "bathrooms": 2,
  "carSpaces": 2,
  "propertyType": "house",
  "landArea": 605,
  "floorArea": 322
}
```

**Additional Information Object:**
```json
{
  "applicantEstimate": 1030000,
  "loanAmount": 850000,
  "customerReference": "abcd1234"
}
```

**Example Request:**
```bash
curl --request POST \
  --url https://data.proptrack.com/api/v1/properties/valuations/sale \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer {access_token}' \
  --header 'Content-Type: application/json' \
  --data '{
    "fullAddress": "1/67 Louisa Rd, Birchgrove, NSW 2041",
    "updatedAttributes": {
      "bedrooms": 4,
      "bathrooms": 2,
      "carSpaces": 2,
      "propertyType": "house",
      "landArea": 605,
      "floorArea": 322
    },
    "additionalInformation": {
      "applicantEstimate": 1030000,
      "loanAmount": 850000,
      "customerReference": "abcd1234"
    }
  }'
```

**Example Response:**
```json
{
  "valuationId": "9a8b3368-fc5c-4a3d-9d4b-19ceecc387b2",
  "valuationDate": "2022-05-22",
  "effectiveDate": "2022-05-22",
  "fullAddress": "1/67 Louisa Rd, Birchgrove, NSW 2041",
  "address": {
    "lotNumber": "Lot 123",
    "unitNumber": "Unit 1",
    "streetNumber": "67",
    "streetName": "Louisa",
    "streetType": "Rd",
    "suburb": "Birchgrove",
    "state": "NSW",
    "postCode": "2041"
  },
  "matchQuality": "EXCELLENT",
  "estimatedValue": 785652,
  "fsd": 0.13907999992370604,
  "upperRangeValue": 875625,
  "lowerRangeValue": 654123,
  "confidenceLevel": "HIGH CONFIDENCE",
  "usedAttributes": {
    "bedrooms": 4,
    "bathrooms": 2,
    "carSpaces": 2,
    "propertyType": "house",
    "landArea": 605,
    "floorArea": 322
  },
  "additionalInformation": {
    "applicantEstimate": 1030000,
    "loanAmount": 850000,
    "customerReference": "abcd1234"
  }
}
```

#### 5. Automated Valuation Model (AVM) - PropertyId Based

**Endpoint:** `GET /api/v1/properties/{propertyId}/valuations/sale`

**Purpose:** Orders a sale valuation from PropTrack's AVM for a given property ID.

**Path Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| propertyId | string | Unique identifier for a property | "1234567" |

**Headers:**
- `Authorization: Bearer {access_token}`

**Example Request:**
```bash
curl --request GET \
  --url https://data.proptrack.com/api/v1/properties/1234567/valuations/sale \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer {access_token}'
```

**Example Response:**
```json
{
  "valuationId": "9a8b3368-fc5c-4a3d-9d4b-19ceecc387b2",
  "valuationDate": "2022-12-25",
  "effectiveDate": "2022-12-25",
  "propertyId": 1234567,
  "estimatedValue": 785652,
  "fsd": 0.39079999923706055,
  "upperRangeValue": 875250,
  "lowerRangeValue": 712352,
  "usedAttributes": {
    "bedrooms": 4,
    "bathrooms": 2,
    "carSpaces": 2,
    "propertyType": "house"
  }
}
```

### Reports API

#### 1. AVM PDF Report

**Endpoint:** `GET /api/v1/reports/valuations/sale/{valuationId}/pdf`

**Purpose:** Generates a PDF valuation report based on a previous AVM request.

**Path Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| valuationId | string | Unique valuation identifier from an AVM response | "9a8b3368-fc5c-4a3d-9d4b-19ceecc387b2" |

**Headers:**
- `Authorization: Bearer {access_token}`

**Example Request:**
```bash
curl --request GET \
  --url https://data.proptrack.com/api/v1/reports/valuations/sale/9a8b3368-fc5c-4a3d-9d4b-19ceecc387b2/pdf \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer {access_token}'
```

**Response:** A PDF document containing the valuation report.

#### 2. Property Report

**Endpoint:** `POST /api/v1/reports/property`

**Purpose:** Generates a property report for a given property.

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {access_token}`

**Request Body Parameters:**
| Parameter | Type | Description | Required | Example |
|-----------|------|-------------|----------|---------|
| propertyId | integer | Unique identifier for a property | Yes | 123456789 |
| configId | string (uuid) | Unique report configuration identifier | No | "46ff6d11-d8b2-40d8-9197-dfa33c61cd6c" |
| expiresAt | string (date) | Date after which the report will expire | No | "2023-05-30" |
| meta | object | Custom data displayed on the report | No | {} |

**Example Request:**
```bash
curl --request POST \
  --url https://data.proptrack.com/api/v1/reports/property \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer {access_token}' \
  --header 'Content-Type: application/json' \
  --data '{
    "propertyId": 123456789
  }'
```

**Example Response:**
```json
{
  "reportUrl": "https://report.proptrack.com/r/00e7j158-b633-8874-ae81-9239f4w2f554"
}
```

### Transactions API

#### 1. Point and Radius Search for Transactions

**Endpoint:** `GET /api/v2/transactions/search/point-and-radius`

**Purpose:** Retrieves a list of sold transactions within a given radius of a property.

**Required Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| pointType | string | Type of point reference (currently only "propertyId") | "propertyId" |
| propertyId | integer | Unique property identifier | 123456789 |

**Optional Parameters:**
| Parameter | Type | Description | Default | Constraints | Example |
|-----------|------|-------------|---------|------------|---------|
| radius | integer | Search radius in meters | 2000 | ≤ 10000 | 2000 |
| proximity | string | Address proximity type | | "sameStreet", "sameBuilding", "sameSuburb" | "sameSuburb" |
| propertyType | string | Type of property | | "house", "unit" | "house" |
| sourceCategory | string | Transaction data source | | "vg", "agency" | "vg" |
| bathroomsMin | integer | Minimum number of bathrooms | | | 1 |
| bathroomsMax | integer | Maximum number of bathrooms | | | 3 |
| bedroomsMin | integer | Minimum number of bedrooms | | | 3 |
| bedroomsMax | integer | Maximum number of bedrooms | | | 4 |
| carSpacesMin | integer | Minimum number of car spaces | | | 1 |
| carSpacesMax | integer | Maximum number of car spaces | | | 2 |
| landAreaMin | integer | Minimum land area (m²) | | | 550 |
| landAreaMax | integer | Maximum land area (m²) | | | 650 |
| saleValueMin | integer | Minimum sale value | | | 865000 |
| saleValueMax | integer | Maximum sale value | | | 1030000 |
| landUse | string | Land use filter (currently only "residential") | | | "residential" |
| startDate | string (date) | Start date (YYYY-MM-DD) | 6 months prior | | "2022-11-04" |
| endDate | string (date) | End date (YYYY-MM-DD) | today | | "2023-05-04" |
| pageSize | integer | Results per page | 25 | ≤ 200 | 100 |
| afterPageCursor | string | Pagination cursor for next page | | | "Wzc3Ni4yMTQ2NjY0NTE4Mzk5LDM0Nzg0MDFd" |
| beforePageCursor | string | Pagination cursor for previous page | | | "WzU0LjgwNTYxNjE0MzQ5MTM4LDE0MDY5NjMzXQ==" |

**Headers:**
- `Authorization: Bearer {access_token}`

**Example Request:**
```bash
curl --request GET \
  --url 'https://data.proptrack.com/api/v2/transactions/search/point-and-radius?pointType=propertyId&propertyId=123456789&radius=2000&propertyType=house' \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer {access_token}'
```

**Example Response:**
```json
{
  "numberOfResults": 45,
  "pageInfo": {
    "pageStartCursor": "WzU0LjgwNTYxNjE0MzQ5MTM4LDE0MDY5NjMzXQ==",
    "pageEndCursor": "Wzc3Ni4yMTQ2NjY0NTE4Mzk5LDM0Nzg0MDFd",
    "hasPreviousPage": false,
    "hasNextPage": true
  },
  "transactions": [
    {
      "sourceCategory": "vg",
      "transactionDate": "2023-02-09",
      "contractDate": "2023-02-09",
      "transferDate": "2023-04-11",
      "transferType": "full",
      "saleValue": 946500,
      "saleValueSuppressed": false,
      "listingDetails": {
        "listingId": "141356908",
        "daysOnMarket": 9
      },
      "property": {
        "propertyId": 14069633,
        "distance": 54.80561614349138,
        "address": {
          "fullAddress": "39 Wilka Rd Mount Evie VIC 3796",
          "location": {
            "longitude": 145.38180541992188,
            "latitude": -37.802268981933594
          }
        },
        "attributes": {
          "bedrooms": 4,
          "bathrooms": 2,
          "carSpaces": 2,
          "landArea": 2151,
          "propertyType": "house",
          "landUse": {
            "classifications": [
              {
                "value": "residential"
              }
            ]
          }
        }
      }
    }
    // Additional transactions...
  ]
}
```

## Common Workflows

### Workflow 1: Property Lookup and Valuation

**Step 1: Find a Property by Address**
1. Use the Address Suggest API to get property suggestions from a partial address
```bash
GET /api/v2/address/suggest?q=1%2F67%20Louisa%20Rd
```

2. From the response, identify the correct property and note its `propertyId`

**Step 2: Get Property Details**
3. Get basic property information using the Property Summary API
```bash
GET /api/v2/properties/{propertyId}/summary
```

4. Get detailed property attributes
```bash
GET /api/v2/properties/{propertyId}/attributes
```

**Step 3: Get Property Valuation**
5. Request a valuation using the AVM API
```bash
GET /api/v1/properties/{propertyId}/valuations/sale
```

6. Generate a PDF report of the valuation
```bash
GET /api/v1/reports/valuations/sale/{valuationId}/pdf
```

### Workflow 2: Market Analysis

**Step 1: Get Property Listings in an Area**
1. Identify a reference property using Address APIs

2. Search for listings around that property
```bash
GET /api/v2/listings/search/point-and-radius?listingTypes=sale&pointType=propertyId&propertyId={propertyId}&radius=5000
```

**Step 2: Get Transaction History**
3. Search for recent sales transactions in the area
```bash
GET /api/v2/transactions/search/point-and-radius?pointType=propertyId&propertyId={propertyId}&radius=2000
```

**Step 3: Get Market Statistics**
4. Get supply and demand metrics for the suburb
```bash
GET /api/v2/market/supply-and-demand/potential-buyers?postcode={postcode}&propertyTypes=house&state={state}&suburb={suburb}
```

## Error Handling

PropTrack APIs return standard HTTP status codes with detailed error messages:

### HTTP Status Codes

| Code | Description |
| ---- | ----------- |
| 200  | Success |
| 400  | Bad Request |
| 401  | Unauthorized |
| 403  | Forbidden |
| 404  | Not Found |
| 405  | Method Not Allowed |
| 429  | Rate Limit Exceeded |
| 500  | Internal Server Error |
| 504  | Gateway Timeout |

### Common Error Response Format

```json
{
  "errors": [
    {
      "code": 7004,
      "level": "CRITICAL",
      "description": "Required parameter is missing - Please ensure that all required parameters have been included",
      "parameters": {
        "q": "q is a required parameter"
      }
    }
  ]
}
```

### Common Error Codes

| Code  | Description |
|-------|-------------|
| 7002  | Unknown ID or match failure |
| 7004  | Required parameter missing |
| 7005  | Invalid parameter format |
| 7007  | Invalid parameter value |
| 9003  | Authentication failed |
| 9011  | Access denied |
| 9012  | Token validation failed |
| 9016  | Rate limit exceeded |

## Pagination

PropTrack APIs use cursor-based pagination for endpoints returning large datasets:

### Pagination Parameters

- `pageSize`: Controls the number of results returned per page (default: 25)
- `afterPageCursor`: Returns results after this cursor (for forward pagination)
- `beforePageCursor`: Returns results before this cursor (for backward pagination)

### Pagination Response Structure

```json
{
  "pageInfo": {
    "pageStartCursor": "WzU0LjgwNTYxNjE0MzQ5MTM4LDE0MDY5NjMzXQ==",
    "pageEndCursor": "Wzc3Ni4yMTQ2NjY0NTE4Mzk5LDM0Nzg0MDFd",
    "hasPreviousPage": false,
    "hasNextPage": true
  },
  "numberOfResults": 45
  // Results array...
}
```

### Implementing Pagination

1. Make initial request with desired `pageSize`
2. Check `hasNextPage` to see if more results exist
3. Use the `pageEndCursor` value as the `afterPageCursor` in your next request
4. Continue until `hasNextPage` is false

## Rate Limiting

PropTrack APIs implement rate limiting to ensure fair usage. When exceeded, you'll receive a 429 error with details about your limit and when you can retry.

### X-Transaction-Id Header

All API responses include an `X-Transaction-Id` header that should be quoted when seeking support for unexpected errors:

```
X-Transaction-Id: bxxe12cb-a6a8-4cad-9a8c-4f1d8abfa0d9
```

## Disclaimers and Legal Requirements

When displaying PropTrack data, you must include appropriate disclaimers:

### Required Disclaimers

Different APIs require different disclaimers:
- Property data: VG (Valuer General), Geoscape, serviceAgent disclaimers
- Transaction data: VG, serviceAgent disclaimers

### Service Agent Statement Template

```
This information is supplied by [your company & ABN] on behalf of PropTrack Pty Ltd (ABN 43 127 386 298). 
Copyright and Legal Disclaimers about Property Data available at https://www.proptrack.com.au/product-disclaimers/
```

## Getting Support

When contacting PropTrack support, include:

1. **X-Transaction-Id**: From the response header
2. **Request sample**: The API endpoint and parameters you used
3. **Response body**: The full response or error message you received

**Contact Support:**
- https://www.proptrack.com.au/support/contact-support/