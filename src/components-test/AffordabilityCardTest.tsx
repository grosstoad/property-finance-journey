import { useState } from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import { AffordabilityCard_2 } from './AffordabilityCard_2';
import { ProductCard_2 } from './ProductCard_2';

export function AffordabilityCardTest() {
  const [propertyValue, setPropertyValue] = useState(1960000);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Component Test Page
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Current property value: ${propertyValue.toLocaleString()}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <AffordabilityCard_2 
            initialPropertyValue={propertyValue}
            minPropertyValue={1000000}
            maxPropertyValue={3000000}
            savings={800000}
            onChange={(value) => setPropertyValue(value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ProductCard_2 
            interestRate={2.99}
            monthlyRepayment={5600}
            revertingInterestRate={3.45}
            revertingYears={3}
            remainingYears={27}
            onEdit={() => console.log('Edit loan clicked')}
          />
        </Grid>
      </Grid>
    </Container>
  );
} 