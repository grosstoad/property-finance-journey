# PropTrack API Integration Plan (BFF Architecture)

This document outlines the steps required to integrate the PropTrack API into the application using a Backend-For-Frontend (BFF) architecture, following the guidelines in `project-code-guidelines.md`.

## Phase 1: Backend (BFF) Setup and Configuration

**Goal:** Create a simple backend service to act as the BFF, securely handling PropTrack API credentials and authentication.

1.  **BFF Project Setup:**
    *   Choose a backend technology stack (e.g., Node.js with Express, Python with Flask/FastAPI, etc.). *Decision needed: Which stack? Assuming Node.js/Express for this plan.*
    *   Initialize a new backend project in a separate directory (e.g., `/bff` or `/server`).
    *   Set up basic project structure, dependencies (`express`, `axios`, `dotenv`, `cors`), and scripts (`dev`, `start`).

2.  **Secure Configuration (BFF):**
    *   Use environment variables on the BFF server to store the PropTrack API Key (`PROPTRACK_API_KEY`) and Secret (`PROPTRACK_API_SECRET`).
    *   Use an environment variable for the PropTrack Base URL (`PROPTRACK_BASE_URL="https://data.proptrack.com"`).
    *   Use `.env` file for local development and ensure it's in `.gitignore`.
    *   Load environment variables securely (e.g., using `dotenv`).

3.  **BFF Core Service (`propTrackBffService.js` or similar):**
    *   Create a service module within the BFF to handle interactions with the real PropTrack API.
    *   Implement OAuth 2.0 token generation (`POST /oauth2/token`) using the secure credentials.
    *   Implement secure and efficient token storage/refresh logic *within the BFF*. The BFF maintains the token, not the frontend.
    *   Implement helper functions for making authenticated GET/POST requests *from the BFF* to the PropTrack API, automatically adding the `Authorization: Bearer {token}` header.
    *   Implement robust error handling for PropTrack API calls, logging errors on the server.

4.  **BFF API Endpoints:**
    *   Set up basic Express server (`server.js` or `index.js`).
    *   Implement CORS (Cross-Origin Resource Sharing) middleware to allow requests from your frontend's domain (e.g., `http://localhost:5173` during development).
    *   Define initial BFF API endpoints that the frontend will call:
        *   `POST /api/v1/proptrack/suggest` (accepts `{ query: string }` in body)
        *   `POST /api/v1/proptrack/match` (accepts `{ query: string }` in body)
        *   `GET /api/v1/proptrack/properties/:propertyId/summary`
        *   `GET /api/v1/proptrack/properties/:propertyId/attributes`
        *   `GET /api/v1/proptrack/properties/:propertyId/valuation`
        *   `GET /api/v1/proptrack/properties/:propertyId/listings`
    *   These endpoints will initially just be stubs, logging requests.

## Phase 2: BFF Endpoint Implementation

**Goal:** Implement the logic within the BFF endpoints to call the actual PropTrack API via the `propTrackBffService`.

1.  **Connect Endpoints to Service:**
    *   In each BFF endpoint handler:
        *   Extract necessary parameters (query, propertyId) from the request (body/params).
        *   Call the corresponding method in `propTrackBffService` (e.g., `bffSuggestEndpoint` calls `propTrackBffService.getSuggestions`).
        *   Handle responses from the service (success or error).
        *   Format the response to be sent back to the frontend. Handle PropTrack errors gracefully, potentially returning specific status codes/messages to the frontend.
    *   Implement `getSuggestions`, `matchAddress`, `getPropertySummary`, `getPropertyAttributes`, `getPropertyValuation`, `getPropertyListings` methods within `propTrackBffService` to call the respective PropTrack API endpoints.

2.  **Data Transformation (Optional):**
    *   If needed, transform the data received from PropTrack into a simpler format more suitable for the frontend before sending the response.

## Phase 3: Frontend Service and Hook Layer

**Goal:** Update the frontend service and hook to interact with the BFF instead of directly with PropTrack.

1.  **Environment Configuration (Frontend):**
    *   Define an environment variable for the BFF's base URL (`VITE_BFF_BASE_URL`). This will be different for local development (e.g., `http://localhost:3001`) and production.
    *   *Remove* `VITE_PROPTRACK_API_KEY` and `VITE_PROPTRACK_API_SECRET` from the frontend's environment variables.

2.  **API Environment Context/Toggle (Frontend):**
    *   *Remove* the Dev/Prod toggle for the PropTrack API itself. The frontend now always points to the *single* BFF URL defined by `VITE_BFF_BASE_URL`. The distinction between dev/prod PropTrack environments is handled solely by the BFF's configuration.
    *   *Optional:* You might still want a toggle if the BFF has separate dev/prod deployments, but it simplifies things if the single `VITE_BFF_BASE_URL` points to the correct BFF environment based on the frontend's build mode (development/production).

3.  **Frontend `PropTrackService` (`src/services/propTrackService.ts`):**
    *   **Major Refactor:** This service no longer handles PropTrack authentication or direct calls.
    *   Modify the constructor/setup to take the BFF base URL (`VITE_BFF_BASE_URL`).
    *   Rewrite methods (`getSuggestions`, `matchAddress`, `getPropertySummary`, etc.) to make simple HTTP requests (using `axios` or `fetch`) to the corresponding *BFF endpoints* (e.g., `GET ${bffBaseUrl}/api/v1/proptrack/properties/:propertyId/summary`).
    *   Remove all OAuth logic and credential handling.

4.  **Type Definitions (`src/types/proptrack.ts`):**
    *   Keep these types as they define the expected shape of the *data* returned *by the BFF* (which should ideally match the structure coming from PropTrack, unless transformed by the BFF).

5.  **`usePropTrack` Hook (`src/hooks/usePropTrack.ts`):**
    *   No major changes needed here if the `PropTrackService` methods retain the same signature (arguments and return types).
    *   It will now implicitly call the BFF via the refactored `PropTrackService`.
    *   Ensure the hook correctly uses the updated service.

## Phase 4: Frontend UI Integration

**Goal:** Integrate the hook and display data fetched via the BFF in the UI components.

*   **No fundamental changes required from the previous plan's Phase 4.**
*   The UI components (`AddressSearchInput`, `PropertyDetailsCard`, etc.) continue to use the `usePropTrack` hook.
*   Data fetching, display, loading/error handling, image handling (including URL construction/resizing - *Note: Image URLs might now be proxied or constructed by the BFF*), and disclaimer display remain the same from the frontend's perspective.

## Phase 5: Testing and Refinement

**Goal:** Ensure both the BFF and the frontend integration are robust and reliable.

1.  **BFF Testing:**
    *   Write unit tests for the `propTrackBffService`, mocking calls to the actual PropTrack API.
    *   Write integration tests for the BFF API endpoints (e.g., using `supertest`), testing request handling, validation, and responses.
    *   Test error handling and propagation from PropTrack API to BFF response.
    *   Test authentication/token refresh logic within the BFF service.

2.  **Frontend Service/Hook Tests:**
    *   Update unit/integration tests for `PropTrackService` and `usePropTrack`.
    *   Mock calls to the *BFF endpoints* (e.g., using `msw` or `jest.mock`).
    *   Verify that the frontend service makes the correct calls to the BFF.

3.  **Component Tests (Frontend):**
    *   No major changes required from the previous plan's Phase 5.
    *   Continue mocking the `usePropTrack` hook and testing component rendering based on its state.

4.  **End-to-End Testing:**
    *   Manually test the full workflow involving frontend -> BFF -> PropTrack.
    *   Ensure CORS is configured correctly for different environments.
    *   Consider automated E2E tests covering the frontend-BFF interaction.

5.  **Deployment:**
    *   Plan deployment for both the frontend application and the new BFF service.
    *   Ensure environment variables are configured correctly in the production environments for both.

6.  **Code Review and Refinement:**
    *   Review both frontend and BFF code against guidelines.
    *   Refactor based on testing and review.

7.  **Performance Considerations:**
    *   Ensure performance considerations (memoization) are applied where necessary. 