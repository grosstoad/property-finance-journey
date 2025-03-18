import { 
  TextField, 
  InputAdornment, 
  TextFieldProps,
  styled
} from '@mui/material';
import { useState, useEffect, forwardRef } from 'react';

// Format number with commas for thousands
const formatValue = (value: number): string => {
  return value.toLocaleString('en-AU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Parse string to number, removing non-numeric characters
const parseValue = (value: string): number => {
  const numericValue = value.replace(/[^0-9]/g, '');
  return numericValue ? parseInt(numericValue, 10) : 0;
};

interface CurrencyInputProps extends Omit<TextFieldProps, 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
}

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& input': {
    textAlign: 'right',
  },
}));

export const CurrencyInput = forwardRef<HTMLDivElement, CurrencyInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(formatValue(value));

    useEffect(() => {
      // Update display value when value prop changes
      setDisplayValue(formatValue(value));
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;
      setDisplayValue(rawValue);
      
      // Parse value and call onChange only with numeric value
      const numericValue = parseValue(rawValue);
      onChange(numericValue);
    };

    const handleBlur = () => {
      // Format the value properly on blur
      setDisplayValue(formatValue(value));
    };

    return (
      <StyledTextField
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>,
        }}
        {...props}
      />
    );
  }
); 