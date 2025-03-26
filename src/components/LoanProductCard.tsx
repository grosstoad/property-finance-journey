import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  styled,
  Grid,
  Divider,
  Chip
} from '@mui/material';
import { LoanProductDetails, OwnHomeProductDetails } from '../types/loan';
import { formatCurrency, formatPercentage } from '../logic/formatters';
import { ATHENA_LOGO_URL, OWNHOME_LOGO_URL } from '../constants/urls';

const ProductCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
  borderRadius: theme.shape.borderRadius,
  overflow: 'visible',
  maxWidth: 800,
  marginLeft: 'auto',
  marginRight: 'auto',
  [theme.breakpoints.down('md')]: {
    maxWidth: '100%'
  }
}));

const BrandLogo = styled('img')({
  height: '38px',
  maxHeight: '100%',
  width: 'auto',
  maxWidth: '100%',
  objectFit: 'contain',
  display: 'block'
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

// Styled component for rate boxes
const RateBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: '#FAF1E2', // Light beige background
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

// Styled component for info boxes (fees, reverting rates)
const InfoBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: '#F5F5F5',
  marginTop: theme.spacing(1),
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:last-child': {
    paddingBottom: theme.spacing(2)
  }
}));

const LogoContainer = styled(Box)({
  height: '40px',
  width: '100px',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start'
});

// Helper function to get product features based on product type
const getProductFeatures = (productName: string): string[] => {
  if (!productName) return [];
  
  const productNameLower = productName.toLowerCase();
  
  if (productNameLower.includes('straight up')) {
    return ["No Athena Fees", "Automatic Rate Match", "Rewarded for your Loyalty"];
  } else if (productNameLower.includes('fixed')) {
    return ["No Athena Fees", "Rate certainty"];
  } else if (productNameLower.includes('power up')) {
    return ["No Athena Fees", "Automatic Rate Match", "Offset account"];
  } else if (productNameLower.includes('tailored')) {
    return ["No LMI"];
  }
  
  return ["No Athena Fees"]; // Default feature
};

interface LoanProductCardProps {
  product: LoanProductDetails;
  showLoanAmount?: boolean;
}

export const LoanProductCard = ({ 
  product, 
  showLoanAmount = false 
}: LoanProductCardProps) => {
  const productFeatures = getProductFeatures(product.productName);
  
  return (
    <ProductCard>
      <StyledCardContent>
        {/* Logo and Product Info */}
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={2}>
            <LogoContainer>
              <BrandLogo 
                src={product.brandLogoSrc || ATHENA_LOGO_URL}
                alt="Lender logo" 
              />
            </LogoContainer>
          </Grid>
          <Grid item xs={10}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 0.25, 
                lineHeight: 1.3, 
                fontWeight: 600 
              }}
            >
              {product.productName}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ lineHeight: 1.3 }}
            >
              {formatCurrency(product.loanAmount)} loan over 30 years
            </Typography>
          </Grid>
          
          {/* Product Feature Chips */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1, mb: 0.5 }}>
              {productFeatures.map((feature, index) => (
                <FeatureChip key={index} label={feature} size="small" />
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 0.75 }} />
          </Grid>
          
          {/* Interest Rate and Repayments */}
          <Grid item xs={6}>
            <RateBox>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{
                  mb: 0,
                  lineHeight: 1.2,
                  textAlign: "center",
                  fontSize: "0.75rem"
                }}
              >
                Interest Rate
              </Typography>
              <Typography
                variant="h5"
                component="p"
                sx={{
                  fontWeight: "bold",
                  lineHeight: 1.2,
                  color: "primary.main",
                  textAlign: "center",
                }}
              >
                {formatPercentage(product.interestRate)}
              </Typography>
            </RateBox>
          </Grid>
          
          <Grid item xs={6}>
            <RateBox>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{
                  mb: 0,
                  lineHeight: 1.2,
                  textAlign: "center",
                  fontSize: "0.75rem"
                }}
              >
                Monthly Repayments
              </Typography>
              <Typography
                variant="h5"
                component="p"
                sx={{
                  fontWeight: "bold",
                  lineHeight: 1.2,
                  color: "secondary.main",
                  textAlign: "center",
                }}
              >
                {formatCurrency(product.monthlyRepayment)}
              </Typography>
            </RateBox>
          </Grid>
          
          {/* Optional Loan Amount Display */}
          {showLoanAmount && (
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>Loan amount:</strong> {formatCurrency(product.loanAmount)}
              </Typography>
            </Grid>
          )}
          
          {/* Upfront Fee Display */}
          {product.upfrontFee && product.upfrontFeeAmount && (
            <Grid item xs={12}>
              <InfoBox>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                  There will be upfront fees of {formatCurrency(product.upfrontFeeAmount)} 
                  {' '}equal to {(product.upfrontFee * 100).toFixed(2)}% of the loan amount
                </Typography>
              </InfoBox>
            </Grid>
          )}
          
          {/* Reverting Rate Display */}
          {product.revertingInterestRate && product.revertingMonthlyRepayment && (
            <Grid item xs={12}>
              <InfoBox>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                  Once the term ends it will revert to
                  {product.revertingProductName ? ` the ${product.revertingProductName}` : ''} rate of {(product.revertingInterestRate * 100).toFixed(2)}% 
                  with {formatCurrency(product.revertingMonthlyRepayment)} monthly repayments
                </Typography>
              </InfoBox>
            </Grid>
          )}
        </Grid>
      </StyledCardContent>
    </ProductCard>
  );
};

interface OwnHomeLoanProductCardProps {
  athenaProduct: LoanProductDetails;
  ownHomeProduct: OwnHomeProductDetails;
}

export const OwnHomeLoanProductCard = ({
  athenaProduct,
  ownHomeProduct
}: OwnHomeLoanProductCardProps) => {
  const athenaProductFeatures = getProductFeatures(athenaProduct.productName);
  
  return (
    <Box>
      <ProductCard>
        <StyledCardContent>
          {/* Athena Product */}
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={2}>
              <LogoContainer>
                <BrandLogo 
                  src={athenaProduct.brandLogoSrc}
                  alt="Athena logo"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = ATHENA_LOGO_URL;
                  }}
                />
              </LogoContainer>
            </Grid>
            <Grid item xs={10}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 0.25, 
                  lineHeight: 1.3, 
                  fontWeight: 600 
                }}
              >
                {athenaProduct.productName}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ lineHeight: 1.3 }}
              >
                {formatCurrency(athenaProduct.loanAmount)} loan over 30 years
              </Typography>
            </Grid>
            
            {/* Product Feature Chips */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1, mb: 0.5 }}>
                {athenaProductFeatures.map((feature, index) => (
                  <FeatureChip key={index} label={feature} size="small" />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1, mb: 0.5 }}>
                <FeatureChip key="no-lmi" label="No LMI" size="small" />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 0.75 }} />
            </Grid>
            
            {/* Interest Rate and Repayments */}
            <Grid item xs={6}>
              <RateBox>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{
                    mb: 0,
                    lineHeight: 1.2,
                    textAlign: "center",
                    fontSize: "0.75rem"
                  }}
                >
                  Interest Rate
                </Typography>
                <Typography
                  variant="h5"
                  component="p"
                  sx={{
                    fontWeight: "bold",
                    lineHeight: 1.2,
                    color: "primary.main",
                    textAlign: "center",
                  }}
                >
                  {formatPercentage(athenaProduct.interestRate)}
                </Typography>
              </RateBox>
            </Grid>
            
            <Grid item xs={6}>
              <RateBox>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{
                    mb: 0,
                    lineHeight: 1.2,
                    textAlign: "center",
                    fontSize: "0.75rem"
                  }}
                >
                  Monthly Repayments
                </Typography>
                <Typography
                  variant="h5"
                  component="p"
                  sx={{
                    fontWeight: "bold",
                    lineHeight: 1.2,
                    color: "secondary.main",
                    textAlign: "center",
                  }}
                >
                  {formatCurrency(athenaProduct.monthlyRepayment)}
                </Typography>
              </RateBox>
            </Grid>
            
            {/* Upfront Fee Display */}
            {athenaProduct.upfrontFee && athenaProduct.upfrontFeeAmount && (
              <Grid item xs={12}>
                <InfoBox>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                    There will be upfront fees of {formatCurrency(athenaProduct.upfrontFeeAmount)} 
                    {' '}equal to {(athenaProduct.upfrontFee * 100).toFixed(2)}% of the loan amount
                  </Typography>
                </InfoBox>
              </Grid>
            )}
          </Grid>
        </StyledCardContent>
      </ProductCard>
      
      {/* OwnHome Product */}
      <ProductCard>
        <StyledCardContent>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={2}>
              <LogoContainer>
                <BrandLogo 
                  src={ownHomeProduct.brandLogoSrc}
                  alt="OwnHome logo"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = OWNHOME_LOGO_URL;
                  }}
                />
              </LogoContainer>
            </Grid>
            <Grid item xs={10}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 0.25, 
                  lineHeight: 1.3, 
                  fontWeight: 600 
                }}
              >
                {ownHomeProduct.productName}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ lineHeight: 1.3 }}
              >
                {formatCurrency(ownHomeProduct.loanAmount)} loan over {ownHomeProduct.term} years
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1, mb: 0.5 }}>
                <FeatureChip key="no-lmi" label="No LMI" size="small" />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 0.75 }} />
            </Grid>
            
            {/* Interest Rate and Repayments */}
            <Grid item xs={6}>
              <RateBox>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{
                    mb: 0,
                    lineHeight: 1.2,
                    textAlign: "center",
                    fontSize: "0.75rem"
                  }}
                >
                  Interest Rate
                </Typography>
                <Typography
                  variant="h5"
                  component="p"
                  sx={{
                    fontWeight: "bold",
                    lineHeight: 1.2,
                    color: "primary.main",
                    textAlign: "center",
                  }}
                >
                  {formatPercentage(ownHomeProduct.interestRate)}
                </Typography>
              </RateBox>
            </Grid>
            
            <Grid item xs={6}>
              <RateBox>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{
                    mb: 0,
                    lineHeight: 1.2,
                    textAlign: "center",
                    fontSize: "0.75rem"
                  }}
                >
                  Monthly Repayments
                </Typography>
                <Typography
                  variant="h5"
                  component="p"
                  sx={{
                    fontWeight: "bold",
                    lineHeight: 1.2,
                    color: "secondary.main",
                    textAlign: "center",
                  }}
                >
                  {formatCurrency(ownHomeProduct.monthlyRepayment)}
                </Typography>
              </RateBox>
            </Grid>
            
            {/* Upfront Fee Display */}
            {ownHomeProduct.upfrontFee && ownHomeProduct.upfrontFeeAmount && (
              <Grid item xs={12}>
                <InfoBox>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                    There will be upfront fees of {formatCurrency(ownHomeProduct.upfrontFeeAmount)} 
                    {' '}equal to {(ownHomeProduct.upfrontFee * 100).toFixed(2)}% of the loan amount
                  </Typography>
                </InfoBox>
              </Grid>
            )}
          </Grid>
        </StyledCardContent>
      </ProductCard>
    </Box>
  );
}; 