import { useEffect, useState } from "react";
import {
  AddressSuggestion,
  usePropTrackSuggest,
} from "../hooks/usePropTrackSuggest";
import { usePropTrackMatch } from "../hooks/usePropTrackMatch";
import { usePropTrackAttributes } from "../hooks/usePropTrackAttributes";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Container,
  Typography,
  Box,
} from "@mui/material";
import { TextField, Button, CircularProgress } from "@mui/material";

const theme = createTheme();

export function PropTrackHooksPage() {
  const [query, setQuery] = useState<string>("1/67 Louisa Rd");
  const {
    suggestions,
    isLoading: isSuggestLoading,
    error: suggestError,
    fetchSuggestions,
  } = usePropTrackSuggest({ query });

  const [selectedAddress, setSelectedAddress] =
    useState<AddressSuggestion | null>(null);
  const {
    match,
    isLoading: isMatchLoading,
    error: matchError,
    fetchMatch,
  } = usePropTrackMatch({
    address: selectedAddress?.address?.fullAddress || "",
  });

  const {
    attributes,
    isLoading: isAttributesLoading,
    error: attributesError,
    fetchAttributes,
  } = usePropTrackAttributes({
    propertyId: selectedAddress?.propertyId || "",
  });

  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    setSelectedAddress(suggestion);
  };

  useEffect(() => {
    if (selectedAddress && !match) {
      fetchMatch();
      fetchAttributes();
    }
  }, [fetchMatch, fetchAttributes, match, selectedAddress]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth="md"
        sx={{
          py: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3, // Consistent gap between sections
        }}
      >
        <Container sx={{ mt: 0 }} aria-live="polite">
          <Typography variant="h3" component="h1" gutterBottom>
            PropTrack Address Search
          </Typography>
        </Container>

        <Container
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 2, // Consistent gap between input and button
            alignItems: "center",
          }}
        >
          <TextField
            label="Enter address"
            variant="outlined"
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Address search input"
            size="small"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={fetchSuggestions}
            disabled={isSuggestLoading}
            aria-label="Search for address suggestions"
            size="medium"
          >
            {isSuggestLoading ? <CircularProgress size={24} /> : "Search"}
          </Button>
        </Container>

        {isSuggestLoading && (
          <Container sx={{ mt: 2 }} aria-live="polite">
            <Typography variant="body1">Loading suggestions...</Typography>
          </Container>
        )}

        {suggestError && (
          <Container sx={{ mt: 2 }} aria-live="assertive">
            <Typography variant="body1" color="error">
              Error: {suggestError.message}
            </Typography>
          </Container>
        )}

        {suggestions.length > 0 && (
          <Container sx={{ mt: 3 }}>
            <Typography variant="h5" component="h2" id="suggestion-heading">
              Suggestions
            </Typography>
            <Box
              role="listbox"
              aria-labelledby="suggestion-heading"
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                mt: 2,
              }}
            >
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion.propertyId}
                  role="option"
                  onClick={() => handleSuggestionSelect(suggestion)}
                  aria-selected={
                    selectedAddress?.address?.fullAddress ===
                    suggestion.address.fullAddress
                  }
                  variant={
                    selectedAddress?.address?.fullAddress ===
                    suggestion.address.fullAddress
                      ? "contained"
                      : "outlined"
                  }
                  sx={{ textTransform: "none" }}
                >
                  {suggestion.address.fullAddress}
                </Button>
              ))}
            </Box>
          </Container>
        )}

        {isMatchLoading && (
          <Container sx={{ mt: 2 }} aria-live="polite">
            <Typography variant="body1">Loading address details...</Typography>
          </Container>
        )}

        {matchError && (
          <Container sx={{ mt: 2 }} aria-live="assertive">
            <Typography variant="body1" color="error">
              Match error: {matchError.message}
            </Typography>
          </Container>
        )}

        {match && (
          <Container sx={{ mt: 3 }}>
            <Typography variant="h5" component="h2">
              Address Match
            </Typography>
            <Container
              sx={{
                p: 2,
                border: "1px solid #ccc",
                borderRadius: "8px",
                mt: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2, // Consistent gap between match details
              }}
            >
              <Typography variant="body1">
                <strong>Match Quality:</strong> {match.matchScore}
              </Typography>
              <Typography variant="body1">
                <strong>Property ID:</strong> {match.propertyId}
              </Typography>
              <Typography variant="body1">
                <strong>GPID:</strong> {match.gpid}
              </Typography>
              <Typography variant="h6" component="h3" sx={{ mt: 2 }}>
                Address Details
              </Typography>
              <Typography variant="body1">
                {selectedAddress?.address?.fullAddress}
              </Typography>
              <Container
                component="dl"
                sx={{
                  display: "grid",
                  gridTemplateColumns: "auto auto",
                  gap: 1, // Consistent gap between terms and definitions
                }}
              >
                {selectedAddress?.address?.lotNumber && (
                  <>
                    <Typography
                      component="dt"
                      variant="body2"
                      fontWeight="bold"
                    >
                      Lot Number
                    </Typography>
                    <Typography component="dd" variant="body2">
                      {selectedAddress.address.lotNumber}
                    </Typography>
                  </>
                )}
                {selectedAddress?.address?.unitNumber && (
                  <>
                    <Typography
                      component="dt"
                      variant="body2"
                      fontWeight="bold"
                    >
                      Unit Number
                    </Typography>
                    <Typography component="dd" variant="body2">
                      {selectedAddress.address.unitNumber}
                    </Typography>
                  </>
                )}
                <Typography component="dt" variant="body2" fontWeight="bold">
                  Street
                </Typography>
                <Typography component="dd" variant="body2">
                  {selectedAddress?.address?.streetNumber}{" "}
                  {selectedAddress?.address?.streetName}{" "}
                  {selectedAddress?.address?.streetType}
                </Typography>
                <Typography component="dt" variant="body2" fontWeight="bold">
                  Location
                </Typography>
                <Typography component="dd" variant="body2">
                  {selectedAddress?.address?.suburb},{" "}
                  {selectedAddress?.address?.state}{" "}
                  {selectedAddress?.address?.postcode}
                </Typography>
              </Container>
            </Container>
          </Container>
        )}

        {isAttributesLoading && (
          <Container sx={{ mt: 2 }} aria-live="polite">
            <Typography variant="body1">
              Loading property attributes...
            </Typography>
          </Container>
        )}

        {attributesError && (
          <Container sx={{ mt: 2 }} aria-live="assertive">
            <Typography variant="body1" color="error">
              Attributes error: {attributesError.message}
            </Typography>
          </Container>
        )}

        {attributes && (
          <Container sx={{ mt: 3 }}>
            <Typography variant="h5" component="h2">
              Property Attributes
            </Typography>
            <Container
              sx={{
                p: 2,
                border: "1px solid #ccc",
                borderRadius: "8px",
                mt: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2, // Consistent gap between attribute details
              }}
            >
              <Typography variant="body1">
                <strong>Bedrooms:</strong> {attributes.bedrooms?.value || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Bathrooms:</strong>{" "}
                {attributes.bathrooms?.value || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Car Spaces:</strong>{" "}
                {attributes.carSpaces?.value || "N/A"}
              </Typography>
              {attributes.propertyType && (
                <Typography variant="body1">
                  <strong>Property Type:</strong>{" "}
                  {attributes.propertyType.value}
                </Typography>
              )}
              {attributes.landArea && (
                <Typography variant="body1">
                  <strong>Land Area:</strong> {attributes.landArea.value} m²
                </Typography>
              )}
              {attributes.yearBuilt && (
                <Typography variant="body1">
                  <strong>Year Built:</strong> {attributes.yearBuilt.value}
                </Typography>
              )}
            </Container>
          </Container>
        )}
      </Container>
    </ThemeProvider>
  );
}
