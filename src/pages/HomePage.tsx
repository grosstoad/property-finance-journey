import { Box, Container, Typography, styled } from '@mui/material';
import { PropertySearch } from '../components/PropertySearch';
import { PropertyInsights } from '../components/PropertyInsights';
import { PropertyFinanceJourney } from '../components/PropertyFinanceJourney';
import { useProperty } from '../contexts/PropertyContext';

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(4, 0),
  backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  backgroundAttachment: 'fixed',
}));

const Header = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  color: theme.palette.text.primary,
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  maxWidth: 600,
  margin: '0 auto',
}));

export const HomePage = () => {
  const { selectedProperty } = useProperty();

  return (
    <PageContainer>
      <Container maxWidth="lg">
        <Header>
          <Title variant="h3">Property Finance Journey</Title>
          <Subtitle variant="h6">
            Find a property and discover your loan options in just a few steps
          </Subtitle>
        </Header>

        <PropertySearch />

        {selectedProperty && (
          <>
            <PropertyInsights />
            <Box sx={{ mt: 4 }}>
              <PropertyFinanceJourney />
            </Box>
          </>
        )}
      </Container>
    </PageContainer>
  );
}; 