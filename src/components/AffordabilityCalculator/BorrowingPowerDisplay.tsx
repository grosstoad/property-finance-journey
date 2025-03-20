import { useContext } from 'react';
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
  const {
    maxBorrowingPower,
    currentLoanAmount,
  } = useContext(AffordabilityContext);

  // Ensure we have valid numbers
  const validMaxBorrowing = maxBorrowingPower || 0;
  const validCurrent = currentLoanAmount || 0;

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
          Loan amount: {formatCurrency(validCurrent)}
        </Typography>
        
        <Slider
          value={validCurrent}
          min={minValue}
          max={maxValue}
          onChange={(_, value) => onSliderChange(value as number)}
          step={1000}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => formatCurrency(value)}
        />

        <SliderLabels>
          <SliderLabel>{formatCurrency(minValue)}</SliderLabel>
          <SliderLabel>{formatCurrency(maxValue)}</SliderLabel>
        </SliderLabels>
      </SliderContainer>
    </Box>
  );
} 