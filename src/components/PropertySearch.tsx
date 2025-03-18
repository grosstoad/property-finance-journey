import { useState, useEffect } from 'react';
import { 
  TextField, 
  Autocomplete, 
  Box, 
  CircularProgress, 
  Paper,
  Typography,
  styled
} from '@mui/material';
import { useProperty } from '../contexts/PropertyContext';
import { searchProperties, getPropertyById } from '../logic/propertyService';
import { PropertySuggestion } from '../types/property';

const SearchContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 600,
  margin: '0 auto',
  padding: theme.spacing(2),
}));

const SearchTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 500,
}));

export const PropertySearch = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<PropertySuggestion[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);
  
  const { 
    searchQuery, 
    setSearchQuery, 
    searchResults,
    setSearchResults,
    setSelectedProperty,
    isSearching,
    setIsSearching
  } = useProperty();

  // Handle search query changes
  useEffect(() => {
    if (!searchQuery) {
      setOptions([]);
      return;
    }

    // Debounce the search query to avoid too many API calls
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    setLoading(true);
    
    const timeout = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        const result = await searchProperties(searchQuery);
        setSearchResults(result.suggestions);
        setOptions(result.suggestions);
      } catch (error) {
        console.error('Error searching properties:', error);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    }, 300);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchQuery, setSearchResults, setIsSearching]);

  // Handle property selection
  const handlePropertySelect = async (_event: React.SyntheticEvent, value: PropertySuggestion | null) => {
    if (!value) {
      setSelectedProperty(null);
      return;
    }

    setLoading(true);
    try {
      const property = await getPropertyById(value.id);
      setSelectedProperty(property);
    } catch (error) {
      console.error('Error fetching property details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SearchContainer>
      <SearchTitle variant="h5">Find your property</SearchTitle>
      <Autocomplete
        id="property-search"
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        options={options}
        loading={loading}
        getOptionLabel={(option) => option.fullAddress}
        onChange={handlePropertySelect}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        filterOptions={(x) => x} // Disable built-in filtering as we use the API
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search for a property address"
            placeholder="e.g. 1 Straight Street, Suburbia"
            fullWidth
            variant="outlined"
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            <Typography>{option.fullAddress}</Typography>
          </li>
        )}
        PaperComponent={(props) => <Paper elevation={3} {...props} />}
        noOptionsText="No properties found"
      />
    </SearchContainer>
  );
}; 