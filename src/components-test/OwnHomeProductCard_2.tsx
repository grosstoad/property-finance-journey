import { 
  Box, 
  Card, 
  Typography, 
  styled, 
  Chip,
  Grid,
  IconButton,
  Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { formatCurrency, formatPercentage } from '../logic/formatters';
import { ATHENA_LOGO_URL, OWNHOME_LOGO_URL } from '../constants/urls';
import { LoanProductDetails, OwnHomeProductDetails } from '../types/loan';

// Card container with shadow
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  padding: theme.spacing(2, 3),
  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  width: '100%',
  position: 'relative',
  marginBottom: theme.spacing(2),
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

// Helper function to get product features based on product type
const getProductFeatures = (productName: string): string[] => {
  if (!productName) return [];
  
  const productNameLower = productName.toLowerCase();
  
  if (productNameLower.includes('straight up')) {
    return ["No lender fees", "Automatic Rate Match", "Rewarded for loyalty"];
  } else if (productNameLower.includes('fixed')) {
    return ["No lender fees", "Rate certainty"];
  } else if (productNameLower.includes('power up')) {
    return ["No lender fees", "Automatic Rate Match", "Offset account"];
  } else if (productNameLower.includes('tailored')) {
    return ["No LMI"];
  }
  
  return ["No lender fees"]; // Default feature
};

// Interface for the component props
interface OwnHomeProductCard_2Props {
  athenaProduct: LoanProductDetails;
  ownHomeProduct: OwnHomeProductDetails;
  onEdit?: () => void;
}

export function OwnHomeProductCard_2({
  athenaProduct,
  ownHomeProduct,
  onEdit
}: OwnHomeProductCard_2Props) {
  // Get product features
  const athenaFeatures = getProductFeatures(athenaProduct.productName || "");
  const ownHomeFeatures = ["Co-investment", "No LMI", "Reduced deposit"];

  // Calculate combined monthly payment
  const combinedMonthlyPayment = (athenaProduct.monthlyRepayment || 0) + (ownHomeProduct.monthlyRepayment || 0);
  
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Combined loan solution
      </Typography>
      
      {/* Edit button */}
      {onEdit && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <IconButton 
            color="primary"
            onClick={onEdit}
            size="small"
          >
            <EditIcon />
          </IconButton>
        </Box>
      )}
      
      {/* Athena Card */}
      <StyledCard>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <LogoContainer>
            <BrandLogo 
              src={athenaProduct.brandLogoSrc || ATHENA_LOGO_URL}
              alt="Athena logo" 
            />
          </LogoContainer>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              {"Athena"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {athenaProduct.productName || "Variable Rate P&I"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatCurrency(athenaProduct.loanAmount || 0)} loan amount
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, my: 1.5 }}>
          {athenaFeatures.map((feature, index) => (
            <FeatureChip key={index} label={feature} size="small" />
          ))}
        </Box>
        
        <Grid container spacing={1} sx={{ my: 1.5 }}>
          <Grid item xs={6}>
            <Box>
              <Typography variant="h4" component="p" fontWeight={700} color="primary.dark">
                {formatPercentage(athenaProduct.interestRate || 0)}
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
              <Typography variant="h4" component="p" fontWeight={700} color="primary.dark">
                {formatCurrency(athenaProduct.monthlyRepayment || 0)}
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
      </StyledCard>
      
      {/* OwnHome Card */}
      <StyledCard>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <LogoContainer>
            <BrandLogo 
              src={ownHomeProduct.brandLogoSrc || OWNHOME_LOGO_URL}
              alt="OwnHome logo" 
            />
          </LogoContainer>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              {"OwnHome"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {ownHomeProduct.productName || "Co-investment"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatCurrency(ownHomeProduct.loanAmount || 0)} investment
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, my: 1.5 }}>
          {ownHomeFeatures.map((feature, index) => (
            <FeatureChip key={index} label={feature} size="small" />
          ))}
        </Box>
        
        <Grid container spacing={1} sx={{ my: 1.5 }}>
          <Grid item xs={6}>
            <Box>
              <Typography variant="h4" component="p" fontWeight={700} color="primary.dark">
                {formatPercentage(ownHomeProduct.interestRate || 0)}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                p.a.
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                Service fee
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box>
              <Typography variant="h4" component="p" fontWeight={700} color="primary.dark">
                {formatCurrency(ownHomeProduct.monthlyRepayment || 0)}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                / per month
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                Monthly payment
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Box>
          <Typography variant="body2" color="text.secondary">
            OwnHome helps reduce your initial loan amount by co-investing in your property.
            You can buy them out anytime within the {ownHomeProduct.term || 7} year term.
          </Typography>
        </Box>
      </StyledCard>
      
      {/* Combined details */}
      <Box sx={{ 
        bgcolor: 'primary.light', 
        color: 'primary.contrastText', 
        p: 2, 
        borderRadius: 2, 
        mt: 1, 
        mb: 2 
      }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Combined monthly payment: {formatCurrency(combinedMonthlyPayment)}
        </Typography>
        <Typography variant="body2">
          This combined solution helps you enter the market without Lenders Mortgage Insurance,
          even though your deposit is less than 20%.
        </Typography>
      </Box>
    </Box>
  );
} 