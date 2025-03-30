import { 
  Box, 
  Card, 
  Typography, 
  styled, 
  Chip,
  Grid,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { formatCurrency, formatPercentage } from '../logic/formatters';
import { ATHENA_LOGO_URL } from '../constants/urls';

// Card container with shadow
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  padding: theme.spacing(2, 3),
  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  width: '100%',
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5, 2),
  }
}));

// Logo container
const LogoContainer = styled(Box)({
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent',
  marginRight: '16px'
});

// BrandLogo
const BrandLogo = styled('img')({
  height: '42px',
  width: 'auto',
  maxWidth: '100%',
  objectFit: 'contain'
});

// Custom styled chip for product features
const FeatureChip = styled(Chip)(({ theme }) => ({
  backgroundColor: '#F5F0FF', // Light purple background
  color: theme.palette.primary.main, // Deep purple text
  fontWeight: 500,
  fontSize: '0.7rem',
  height: '24px',
  '& .MuiChip-label': {
    padding: '0 8px',
  },
}));

// Interfaces for the component props
interface ProductCard_2Props {
  interestRate?: number;
  monthlyRepayment?: number;
  revertingInterestRate?: number;
  revertingYears?: number;
  remainingYears?: number;
  loanProductName?: string;
  lvrRange?: string;
  isInterestOnly?: boolean;
  isFixed?: boolean;
  hasRevertingRate?: boolean;
  revertingProductName?: string;
  features?: string[];
  onEdit?: () => void;
}

export function ProductCard_2({
  interestRate = 2.99,
  monthlyRepayment = 5600,
  revertingInterestRate = 3.45,
  revertingYears = 3,
  remainingYears = 27,
  loanProductName = "Straight Up Variable Rate P&I",
  lvrRange = "70-80% LVR",
  isInterestOnly = false,
  isFixed = false,
  hasRevertingRate = false,
  revertingProductName = "Athena Variable P&I",
  features = ["No lender fees", "Automatic Rate Match", "Rewarded for loyalty"],
  onEdit
}: ProductCard_2Props) {
  // Determine the repayment type to display
  const repaymentTypeText = isInterestOnly ? "Interest Only" : "Principal & Interest";
  const rateTypeText = isFixed ? "Fixed" : "Variable";

  // Create product display name if not provided
  const displayName = loanProductName || `${rateTypeText} Rate ${repaymentTypeText}`;
  
  // Is this a tailored product?
  const isTailored = loanProductName?.toLowerCase().includes('tailored') || lvrRange?.includes('80-85');

  return (
    <StyledCard>
      {/* Edit button positioned at top-right */}
      {onEdit && (
        <IconButton 
          sx={{ position: 'absolute', top: 10, right: 10, color: 'primary.main' }}
          onClick={onEdit}
        >
          <EditIcon />
        </IconButton>
      )}

      {/* Title */}
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Your loan
      </Typography>

      {/* Product info */}
      <Box sx={{ display: 'flex', alignItems: 'center', my: 1.5 }}>
        <LogoContainer>
          <BrandLogo 
            src={ATHENA_LOGO_URL}
            alt="Athena logo" 
          />
        </LogoContainer>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Athena
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {/* Combined product name and LVR */}
            {/* {`${displayName} (${lvrRange})`} */}
            {/* Display only the product name */} 
            {displayName}
          </Typography>
        </Box>
      </Box>

      {/* Tailored loan message - only show for tailored products */}
      {isTailored && (
        <Box sx={{ 
          bgcolor: 'primary.light', 
          color: 'primary.contrastText', 
          p: 1.5, 
          borderRadius: 2, 
          mb: 2 
        }}>
          <Typography variant="body2">
            This tailored loan has no LMI costs despite having a higher LVR.
          </Typography>
        </Box>
      )}

      {/* Product Feature Chips */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, my: 1.5 }}>
        {features.map((feature, index) => (
          <FeatureChip key={index} label={feature} size="small" />
        ))}
      </Box>

      {/* Interest Rate and Repayments */}
      <Grid container spacing={1} sx={{ my: 1.5 }}>
        <Grid item xs={6}>
          <Box>
            <Typography variant="h3" component="p" fontWeight={700} color="primary.dark">
              {formatPercentage(interestRate/100)}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              p.a.
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              Interest rate
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box>
            <Typography variant="h3" component="p" fontWeight={700} color="primary.dark">
              {formatCurrency(monthlyRepayment)}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              / per month
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              Monthly repayment
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Reverting Rate Info - Only show for fixed rate or if explicitly has a reverting rate */}
      {(isFixed || hasRevertingRate) && revertingInterestRate && (
        <Box sx={{ mt: 1.5, width: '100%' }}>
          <Typography variant="body2" color="text.secondary" sx={{ width: '100%' }}>
            After {revertingYears} years, reverts to {revertingProductName} for the remaining {remainingYears} years at {formatPercentage(revertingInterestRate/100)} interest rate
          </Typography>
        </Box>
      )}
    </StyledCard>
  );
} 