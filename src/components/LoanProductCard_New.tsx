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

// Interfaces for the component props
interface LoanProductCard_NewProps {
  product: LoanProductDetails;
  isTailored?: boolean;
  onEdit?: () => void;
}

export function LoanProductCard_New({
  product,
  isTailored = false,
  onEdit
}: LoanProductCard_NewProps) {
  // Get product features based on product name
  const productFeatures = getProductFeatures(product.productName);
  
  // Extract product details
  const isFixed = product.productName?.toLowerCase().includes('fixed') || false;
  const isIO = product.productName?.toLowerCase().includes('interest only') || false;
  const productType = isFixed ? 'Fixed' : 'Variable';
  const repaymentType = isIO ? 'IO' : 'P&I';
  const lvrRange = isTailored ? '80-85% LVR' : '70-80% LVR';
  
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
            src={product.brandLogoSrc || ATHENA_LOGO_URL}
            alt="Athena logo" 
          />
        </LogoContainer>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            {"Athena"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {product.productName}
          </Typography>
        </Box>
      </Box>

      {/* Tailored loan message if applicable */}
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
        {productFeatures.map((feature, index) => (
          <FeatureChip key={index} label={feature} size="small" />
        ))}
      </Box>

      {/* Interest Rate and Repayments */}
      <Grid container spacing={1} sx={{ my: 1.5 }}>
        <Grid item xs={6}>
          <Box>
            <Typography variant="h3" component="p" fontWeight={700} color="primary.dark">
              {formatPercentage(product.interestRate)}
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
              {formatCurrency(product.monthlyRepayment)}
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

      {/* Reverting Rate Info - Only show for fixed rate loans */}
      {isFixed && product.revertingInterestRate && (
        <Box sx={{ mt: 1.5, width: '100%' }}>
          <Typography variant="body2" color="text.secondary" sx={{ width: '100%' }}>
            After {product.fixedTerm || 1} {(product.fixedTerm || 1) === 1 ? 'year' : 'years'}, 
            reverts to {product.revertingProductName || "Variable P&I"} 
            for the remaining {(product.loanTerm || 30) - (product.fixedTerm || 1)} years 
            at {formatPercentage(product.revertingInterestRate)} interest rate
          </Typography>
        </Box>
      )}
    </StyledCard>
  );
}

interface OwnHomeLoanProductCard_NewProps {
  athenaProduct: LoanProductDetails;
  ownHomeProduct: OwnHomeProductDetails;
  onEdit?: () => void;
}

export function OwnHomeLoanProductCard_New({
  athenaProduct,
  ownHomeProduct,
  onEdit
}: OwnHomeLoanProductCard_NewProps) {
  // Get product features
  const athenaFeatures = getProductFeatures(athenaProduct.productName);
  const ownHomeFeatures = ["Co-investment", "No LMI", "Reduced deposit"];
  
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
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
              {athenaProduct.productName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatCurrency(athenaProduct.loanAmount)} loan amount
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
              <Typography variant="h5" component="p" fontWeight={700} color="primary.dark">
                {formatPercentage(athenaProduct.interestRate)}
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
              <Typography variant="h5" component="p" fontWeight={700} color="primary.dark">
                {formatCurrency(athenaProduct.monthlyRepayment)}
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
              {formatCurrency(ownHomeProduct.loanAmount)} investment
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
              <Typography variant="h5" component="p" fontWeight={700} color="primary.dark">
                {formatPercentage(ownHomeProduct.interestRate)}
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
              <Typography variant="h5" component="p" fontWeight={700} color="primary.dark">
                {formatCurrency(ownHomeProduct.monthlyRepayment)}
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
            You can buy them out anytime within the {ownHomeProduct.term} year term.
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
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Combined monthly payment: {formatCurrency(athenaProduct.monthlyRepayment + ownHomeProduct.monthlyRepayment)}
        </Typography>
        <Typography variant="body2">
          This combined solution helps you enter the market without Lenders Mortgage Insurance,
          even though your deposit is less than 20%.
        </Typography>
      </Box>
    </Box>
  );
} 