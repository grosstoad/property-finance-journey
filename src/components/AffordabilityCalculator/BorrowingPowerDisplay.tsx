import { useContext, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  Alert,
  Stack,
  styled,
  CircularProgress,
} from '@mui/material';
import { AffordabilityContext } from '../../contexts/AffordabilityContext';
import { formatCurrency } from '../../logic/formatters';

const SliderContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  padding: theme.spacing(0, 2),
}));

const SliderLabels = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: theme.spacing(1),
}));

const SliderLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
}));

const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 100,
});

interface BorrowingPowerDisplayProps {
  onSliderChange: (amount: number) => void;
  minValue: number;
  maxValue: number;
  defaultValue: number;
  isLoading?: boolean;
}

export function BorrowingPowerDisplay({
  onSliderChange,
  minValue,
  maxValue,
  defaultValue,
  isLoading = false,
}: BorrowingPowerDisplayProps) {
  // Local state to manage the slider value
  const [sliderValue, setSliderValue] = useState(defaultValue);
  
  // Update local state when props change
  useEffect(() => {
    setSliderValue(defaultValue);
  }, [defaultValue]);
  
  // Initialize with defaultValue (only on first render)
  useEffect(() => {
    // No need to call onSliderChange here, it will be called when user moves the slider
  }, []);

  // Ensure we have valid numbers
  const validMinValue = minValue || 100000;
  const validMaxValue = maxValue || 1000000;

  if (isLoading) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  return (
    <Box>
      <SliderContainer>
        <Typography variant="h6" gutterBottom>
          Loan amount: {formatCurrency(sliderValue)}
        </Typography>
        
        <Slider
          value={sliderValue}
          min={validMinValue}
          max={validMaxValue}
          onChange={(_, value) => {
            const newValue = value as number;
            setSliderValue(newValue);
            onSliderChange(newValue);
          }}
          step={1000}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => formatCurrency(value)}
        />

        <SliderLabels>
          <SliderLabel>{formatCurrency(validMinValue)}</SliderLabel>
          <SliderLabel>{formatCurrency(validMaxValue)}</SliderLabel>
        </SliderLabels>
      </SliderContainer>
    </Box>
  );
} 