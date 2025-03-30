import React, { useState } from 'react';
import { Grid, Container, Box } from '@mui/material';
import { PurchaseCosts } from './PurchaseCosts';
import { YourFinancials } from './YourFinancials';

interface PropertyFinanceComponentsProps {
  initialPropertyPrice?: number;
  initialSavings?: number;
  onFinancialsChange?: (financials: any) => void;
  onCostsChange?: (costs: any) => void;
}

export const PropertyFinanceComponents: React.FC<PropertyFinanceComponentsProps> = ({
  initialPropertyPrice = 1960000,
  initialSavings = 800000,
  onFinancialsChange,
  onCostsChange,
}) => {
  // Handle state and callbacks as needed
  const handleFinancialsChange = (financials: any) => {
    console.log('Financials updated:', financials);
    if (onFinancialsChange) onFinancialsChange(financials);
  };
  
  const handleCostsChange = (costs: any) => {
    console.log('Costs updated:', costs);
    if (onCostsChange) onCostsChange(costs);
  };
  
  return (
    <Container maxWidth="lg">
      {/* 
        This Grid container will:
        1. Display components side by side on desktop (md and up)
        2. Stack components on mobile (xs to sm)
        3. Add appropriate spacing between components
      */}
      <Grid container spacing={{ xs: 3, md: 4 }}>
        {/* 
          Left component (PurchaseCosts):
          - Takes full width (12/12 columns) on mobile
          - Takes 6/12 columns on desktop for equal width
        */}
        <Grid item xs={12} md={6}>
          <PurchaseCosts onCostsChange={handleCostsChange} />
        </Grid>
        
        {/* 
          Right component (YourFinancials):
          - Takes full width (12/12 columns) on mobile
          - Takes 6/12 columns on desktop for equal width
        */}
        <Grid item xs={12} md={6}>
          <YourFinancials onFinancialsChange={handleFinancialsChange} />
        </Grid>
      </Grid>
    </Container>
  );
}; 