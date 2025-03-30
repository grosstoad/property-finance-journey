import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { PropertyFinanceComponents } from '../components/PropertyFinanceComponents';

export const PropertyFinanceDemoPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F5F5F5',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          Property Finance Journey
        </Typography>
        
        {/* This component handles the responsive Grid layout */}
        <PropertyFinanceComponents />
      </Container>
    </Box>
  );
};

export default PropertyFinanceDemoPage; 