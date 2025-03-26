import { 
  TextField, 
  InputAdornment, 
  TextFieldProps,
  styled
} from '@mui/material';
import { useState, useEffect } from 'react';
import { formatCurrency } from '../logic/formatters';

// Create styled TextField with right alignment and appropriate sizing
const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius,
    textAlign: "right",
    "& input": {
      textAlign: "right",
      fontSize: "0.9rem", // Smaller to match loan card
      fontWeight: 500,
      padding: "8px 12px", // Smaller padding
    },
  },
}));

// Parse currency string to number
const parseCurrencyValue = (value: string): number => {
  // Remove currency symbol, commas, and other non-numeric characters except decimal point
  const numericValue = value.replace(/[^0-9.]/g, '');
  return numericValue ? parseFloat(numericValue) : 0;
};

interface CurrencyTextFieldProps extends Omit<TextFieldProps, 'onChange'> {
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CurrencyTextField = ({ 
  value, 
  onChange, 
  InputProps,
  ...props 
}: CurrencyTextFieldProps) => {
  // Convert value to string for display
  const [displayValue, setDisplayValue] = useState<string>('');
  
  // Update display value when the numeric value changes
  useEffect(() => {
    const numericValue = typeof value === 'string' ? parseCurrencyValue(value) : value;
    setDisplayValue(formatCurrency(numericValue));
  }, [value]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Create a synthetic event to pass back the numeric value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: parseCurrencyValue(rawValue).toString()
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
  };
  
  return (
    <StyledTextField
      value={displayValue}
      onChange={handleChange}
      InputProps={{
        ...InputProps,
        // Default to no adornment if not specified
        startAdornment: InputProps?.startAdornment
      }}
      {...props}
    />
  );
}; 