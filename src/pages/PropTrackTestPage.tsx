import { 
  Box, 
  Typography, 
  TextField, 
  Autocomplete, 
  Button, 
  Card, 
  CardContent, 
  List, 
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Container,
  Grid,
  Paper,
  styled
} from '@mui/material';
import { useState } from 'react';
import { usePropTrack } from '../hooks/usePropTrack';
import { JsonViewer } from '../components/JsonViewer';
import { AddressSuggestion } from '../types/proptrack';
import HouseIcon from '@mui/icons-material/House';
import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const PageContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const Title = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  fontWeight: 700,
}));

const SubTitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(2),
  fontWeight: 600,
}));

const SearchCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const SearchForm = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}));

const PropertyDetailCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const PropertyAttributesList = styled(List)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: theme.spacing(1),
}));

const AttributeItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}));

const ValuationCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
}));

const ValuationAmount = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '2rem',
  marginBottom: theme.spacing(1),
}));

export const PropTrackTestPage = () => {
  const [addressInput, setAddressInput] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<AddressSuggestion | null>(null);
  
  const {
    suggestions,
    addressMatch,
    propertyAttributes,
    loading,
    error,
    getAddressSuggestions,
    matchAddress,
    getPropertyDetails,
    propertyValuation,
  } = usePropTrack();
  
  const handleInputChange = (_event: React.SyntheticEvent, value: string) => {
    setAddressInput(value);
    getAddressSuggestions(value);
  };
  
  const handleSuggestionSelect = (_event: React.SyntheticEvent, suggestion: string | AddressSuggestion | null) => {
    if (typeof suggestion === 'string') {
      setSelectedSuggestion(null);
      setAddressInput(suggestion);
    } else {
      setSelectedSuggestion(suggestion as AddressSuggestion);
      if (suggestion) {
        setAddressInput((suggestion as AddressSuggestion).address.fullAddress);
      }
    }
  };
  
  const handleSearch = async () => {
    if (!addressInput) return;
    
    try {
      const match = await matchAddress(addressInput);
      if (match && match.propertyId) {
        await getPropertyDetails(match.propertyId);
      }
    } catch (err) {
      console.error('Error searching for property:', err);
    }
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  return (
    <PageContainer maxWidth="lg">
      <Title variant="h4">PropTrack API Test</Title>
      
      <SearchCard>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Enter an address to search
          </Typography>
          
          <SearchForm>
            <Autocomplete
              freeSolo
              options={suggestions}
              getOptionLabel={(option) => 
                typeof option === 'string' ? option : option.address.fullAddress
              }
              inputValue={addressInput}
              onInputChange={handleInputChange}
              onChange={handleSuggestionSelect}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Property Address"
                  placeholder="Enter at least 3 characters"
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading && <CircularProgress size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              loading={loading}
              sx={{ flexGrow: 1 }}
            />
            
            <Button 
              variant="contained" 
              onClick={handleSearch}
              disabled={loading || !addressInput}
              startIcon={<SearchIcon />}
              sx={{ minWidth: '120px' }}
            >
              Search
            </Button>
          </SearchForm>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </SearchCard>
      
      {addressMatch && (
        <Box mb={4}>
          <SubTitle variant="h5">Address Match</SubTitle>
          <PropertyDetailCard>
            <Typography variant="h6">
              {addressMatch.address.fullAddress}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Property ID: {addressMatch.propertyId}
            </Typography>
            <Typography variant="body2">
              Match Quality: {addressMatch.matchQuality}
            </Typography>
          </PropertyDetailCard>
          
          <JsonViewer title="Raw Address Match Response" data={addressMatch} />
        </Box>
      )}
      
      {propertyAttributes && (
        <Box mb={4}>
          <SubTitle variant="h5">
            <HouseIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Property Attributes
          </SubTitle>
          
          <PropertyDetailCard>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6">Property ID: {propertyAttributes.propertyId}</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1">Property Attributes</Typography>
                <PropertyAttributesList>
                  {propertyAttributes.attributes.bedrooms && (
                    <AttributeItem>
                      <ListItemText 
                        primary={`${propertyAttributes.attributes.bedrooms.value} Bedrooms`}
                        secondary="Bedrooms" 
                      />
                    </AttributeItem>
                  )}
                  
                  {propertyAttributes.attributes.bathrooms && (
                    <AttributeItem>
                      <ListItemText 
                        primary={`${propertyAttributes.attributes.bathrooms.value} Bathrooms`}
                        secondary="Bathrooms" 
                      />
                    </AttributeItem>
                  )}
                  
                  {propertyAttributes.attributes.carSpaces && (
                    <AttributeItem>
                      <ListItemText 
                        primary={`${propertyAttributes.attributes.carSpaces.value} Car Spaces`}
                        secondary="Parking" 
                      />
                    </AttributeItem>
                  )}
                  
                  {propertyAttributes.attributes.landArea && (
                    <AttributeItem>
                      <ListItemText 
                        primary={`${propertyAttributes.attributes.landArea.value} m²`}
                        secondary="Land Area" 
                      />
                    </AttributeItem>
                  )}
                  
                  {propertyAttributes.attributes.floorArea && (
                    <AttributeItem>
                      <ListItemText 
                        primary={`${propertyAttributes.attributes.floorArea.value} m²`}
                        secondary="Floor Area" 
                      />
                    </AttributeItem>
                  )}
                  
                  {propertyAttributes.attributes.propertyType && (
                    <AttributeItem>
                      <ListItemText 
                        primary={propertyAttributes.attributes.propertyType.value
                          .replace(/^\w/, (c) => c.toUpperCase())}
                        secondary="Property Type" 
                      />
                    </AttributeItem>
                  )}
                  
                  {propertyAttributes.attributes.yearBuilt && (
                    <AttributeItem>
                      <ListItemText 
                        primary={propertyAttributes.attributes.yearBuilt.value}
                        secondary="Year Built" 
                      />
                    </AttributeItem>
                  )}
                  
                  {propertyAttributes.attributes.features && propertyAttributes.attributes.features.length > 0 && (
                    <AttributeItem>
                      <ListItemText 
                        primary={propertyAttributes.attributes.features.join(', ')}
                        secondary="Features" 
                      />
                    </AttributeItem>
                  )}
                </PropertyAttributesList>
              </Grid>
            </Grid>
          </PropertyDetailCard>
          
          <JsonViewer title="Raw Property Attributes Response" data={propertyAttributes} />
        </Box>
      )}
      
      {propertyValuation && (
        <Box mb={4}>
          <SubTitle variant="h5">
            <AttachMoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Property Valuation (POST)
          </SubTitle>
          
          <ValuationCard>
            <ValuationAmount variant="h4">
              {formatCurrency(propertyValuation.estimatedValue)}
            </ValuationAmount>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">Lower Range:</Typography>
                <Typography variant="h6">{formatCurrency(propertyValuation.lowerRangeValue)}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">Upper Range:</Typography>
                <Typography variant="h6">{formatCurrency(propertyValuation.upperRangeValue)}</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="body2">
                  Valuation Date: {new Date(propertyValuation.valuationDate).toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          </ValuationCard>
          
          <JsonViewer title="Raw Valuation Response (POST)" data={propertyValuation} />
        </Box>
      )}
    </PageContainer>
  );
}; 