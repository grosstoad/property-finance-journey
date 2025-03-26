import { Box, Container, Typography, styled, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PropertySearch } from '../components/PropertySearch';
import { PropertyInsights } from '../components/PropertyInsights';
import { PropertyFinanceJourney } from '../components/PropertyFinanceJourney';
import { useProperty } from '../contexts/PropertyContext';

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: 0,
  backgroundColor: 'white',
  overflow: 'hidden',
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  width: '730px', // Fixed width as requested
  margin: '0 auto',
  padding: theme.spacing(4, 0),
}));

const StyledComponent = styled(Box)(({ theme }) => ({
  width: '100%', // Ensure all children components take the full 730px width
  maxWidth: '730px',
}));

const BackButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

export const HomePage = () => {
  const { selectedProperty, setSelectedProperty } = useProperty();

  const handleBackToSearch = () => {
    setSelectedProperty(null);
  };

  return (
    <PageContainer>
      <PropertySearch />

      {selectedProperty && (
        <ContentContainer>
          <BackButton 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBackToSearch}
            variant="outlined"
          >
            Back to property search
          </BackButton>
          
          <StyledComponent>
            <PropertyInsights />
          </StyledComponent>
          
          <Box sx={{ mt: 4, width: '100%' }}>
            <StyledComponent>
              <PropertyFinanceJourney />
            </StyledComponent>
          </Box>
        </ContentContainer>
      )}
    </PageContainer>
  );
}; 