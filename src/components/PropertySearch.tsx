import { useState, useEffect } from 'react';
import { 
  TextField, 
  Autocomplete, 
  Box, 
  CircularProgress, 
  Paper,
  Typography,
  styled,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ApartmentIcon from '@mui/icons-material/Apartment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useProperty } from '../contexts/PropertyContext';
import { searchProperties, getPropertyById } from '../logic/propertyService';
import { PropertySuggestion } from '../types/property';
import twilightGarden from '../assets/images/twilight-garden.jpeg';

// Hero section container
const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '600px',
  width: '100vw', // Use viewport width
  maxWidth: '100%', // Ensure it doesn't overflow
  margin: 0,
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  overflow: 'hidden',
}));

// Background image container
const BackgroundImage = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent overlay for better text readability
  },
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }
}));

// Content container for the hero section
const HeroContent = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(0, 2), // Add horizontal padding for mobile
}));

// Search container styling
const SearchContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 600,
  margin: '0 auto',
  marginTop: theme.spacing(4),
  padding: theme.spacing(3),
  backgroundColor: 'white',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[4],
}));

// Title styling
const HeroTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 700,
  color: 'white',
  maxWidth: '800px',
}));

// Subtitle styling
const HeroSubtitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  color: 'white',
  maxWidth: '700px',
}));

// Value proposition section styling
const ValuePropositionSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 0),
  backgroundColor: 'white', // Change from grey to white
}));

// Card title styling
const CardTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  fontWeight: 600,
}));

// Circular number badge styling
const NumberBadge = styled(Avatar)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  width: 30,
  height: 30,
  fontSize: '0.875rem',
  fontWeight: 'bold',
}));

// Icon avatar styling
const IconAvatar = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  marginBottom: theme.spacing(3),
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
    selectedProperty,
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

  // Don't render the search UI if a property is selected
  if (selectedProperty) {
    return null;
  }

  return (
    <Box sx={{ bgcolor: 'white', width: '100%', margin: 0, padding: 0 }}>
      {/* Hero Section with Property Background and Search */}
      <HeroSection>
        <BackgroundImage>
          <img 
            src={twilightGarden} 
            alt="Beautiful garden pathway at twilight with flowers and property" 
          />
        </BackgroundImage>
        
        <HeroContent>
          <HeroTitle variant="h3">
            Find Your Dream Home with Athena
          </HeroTitle>
          <HeroSubtitle variant="h6">
            Discover the perfect property with personalized insights and financing options
          </HeroSubtitle>
          
          {/* Floating Search Component */}
          <SearchContainer elevation={4}>
            <Typography 
              variant="subtitle1" 
              sx={{ mb: 2, fontWeight: 500, color: 'text.primary', textAlign: 'left' }}
            >
              Enter property address
            </Typography>
            
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
              noOptionsText="No properties found"
            />
            <Typography 
              variant="caption" 
              sx={{ mt: 1, display: 'block', color: 'text.secondary', textAlign: 'left' }}
            >
              Search will begin automatically as you type your address
            </Typography>
          </SearchContainer>
        </HeroContent>
      </HeroSection>
      
      {/* Value Proposition Section */}
      <ValuePropositionSection>
        <Container>
          <Typography variant="h4" align="center" sx={{ mb: 6, fontWeight: 'bold', color: '#5a2ca0' }}>
            How Athena Helps You Find Your Dream Home
          </Typography>
          
          <Grid container spacing={4}>
            {/* Card 1 */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', position: 'relative', p: 2 }}>
                <NumberBadge sx={{ bgcolor: '#f0e6fa', color: '#5a2ca0' }}>1</NumberBadge>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <IconAvatar sx={{ bgcolor: '#5a2ca0' }}>
                    <HomeIcon fontSize="large" />
                  </IconAvatar>
                  <CardTitle variant="h6">In-Depth Property Insights</CardTitle>
                  <Typography variant="body2" color="text.secondary">
                    Understand the property's value, history, and neighborhood trends.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Card 2 */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', position: 'relative', p: 2 }}>
                <NumberBadge sx={{ bgcolor: '#fce4f0', color: '#e6007e' }}>2</NumberBadge>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <IconAvatar sx={{ bgcolor: '#e6007e' }}>
                    <ApartmentIcon fontSize="large" />
                  </IconAvatar>
                  <CardTitle variant="h6">Recommended Loan Options</CardTitle>
                  <Typography variant="body2" color="text.secondary">
                    See how much you need to borrow and explore loan products suited to you.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Card 3 */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', position: 'relative', p: 2 }}>
                <NumberBadge sx={{ bgcolor: '#e6f9ef', color: '#00c853' }}>3</NumberBadge>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <IconAvatar sx={{ bgcolor: '#00c853' }}>
                    <TrendingUpIcon fontSize="large" />
                  </IconAvatar>
                  <CardTitle variant="h6">Personalized Affordability Check</CardTitle>
                  <Typography variant="body2" color="text.secondary">
                    Determine if it's within your budget, view your maximum borrowing power, and get tips to improve it.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </ValuePropositionSection>
    </Box>
  );
}; 