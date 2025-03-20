import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  styled, 
  useMediaQuery
} from '@mui/material';
import { LoanProductDetails, OwnHomeProductDetails } from '../types/loan';
import { formatCurrency, formatPercentage } from '../logic/formatters';
import { ATHENA_LOGO_URL, OWNHOME_LOGO_URL } from '../constants/urls';

const ProductCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)',
  borderRadius: theme.shape.borderRadius,
  overflow: 'visible'
}));

const BrandLogo = styled('img')(({ theme }) => ({
  height: 36,
  marginRight: theme.spacing(1),
  objectFit: 'contain',
  background: 'transparent'
}));

const ProductRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(0.75),
}));

const ProductNameContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '12px',
  background: 'transparent'
});

const ProductName = styled(Typography)({
  fontWeight: 600,
  fontSize: '1.1rem',
});

const RateValue = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.25rem',
  color: theme.palette.primary.main,
}));

const RepaymentValue = styled(Typography)({
  fontWeight: 600,
  fontSize: '1rem',
});

const LoanAmountValue = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  fontSize: '0.9rem',
  color: theme.palette.text.secondary,
}));

const FeeInfo = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.75),
}));

const RevertingInfo = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.75),
  fontStyle: 'italic',
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  '&:last-child': {
    paddingBottom: theme.spacing(1.5)
  }
}));

const LogoContainer = styled(Box)({
  width: '100px',
  height: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '12px',
  backgroundColor: '#f5f5f5',
  borderRadius: '4px'
});

interface LoanProductCardProps {
  product: LoanProductDetails;
  showLoanAmount?: boolean;
}

export const LoanProductCard = ({ 
  product, 
  showLoanAmount = false 
}: LoanProductCardProps) => {
  return (
    <ProductCard>
      <StyledCardContent>
        <ProductNameContainer>
          <LogoContainer>
            <BrandLogo 
              src={product.brandLogoSrc || ATHENA_LOGO_URL}
              alt="Lender logo" 
            />
          </LogoContainer>
          <Box>
            <ProductName variant="h6">{product.productName}</ProductName>
            {showLoanAmount && (
              <Typography variant="body2" color="text.secondary">
                {formatCurrency(product.loanAmount)} over 30 years
              </Typography>
            )}
          </Box>
        </ProductNameContainer>
        
        <ProductRow>
          <Typography variant="body2">Interest rate</Typography>
          <RateValue>{formatPercentage(product.interestRate)}</RateValue>
        </ProductRow>
        
        <ProductRow>
          <Typography variant="body2">Monthly repayments</Typography>
          <RepaymentValue>{formatCurrency(product.monthlyRepayment)}</RepaymentValue>
        </ProductRow>
        
        {showLoanAmount && (
          <ProductRow>
            <Typography variant="body2">Loan amount</Typography>
            <LoanAmountValue>{formatCurrency(product.loanAmount)}</LoanAmountValue>
          </ProductRow>
        )}
        
        {product.upfrontFee && product.upfrontFeeAmount && (
          <FeeInfo>
            There will be upfront fees of {formatCurrency(product.upfrontFeeAmount)} 
            {' '}which is {formatPercentage(product.upfrontFee)} of the loan amount
          </FeeInfo>
        )}
        
        {product.revertingInterestRate && product.revertingMonthlyRepayment && (
          <RevertingInfo>
            Once the term ends it will revert to 
            {product.revertingProductName ? ` the ${product.revertingProductName}` : ''} rate of {formatPercentage(product.revertingInterestRate)} 
            with {formatCurrency(product.revertingMonthlyRepayment)} monthly repayments
          </RevertingInfo>
        )}
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
  return (
    <Box>
      <ProductCard>
        <StyledCardContent>
          <ProductNameContainer>
            <LogoContainer>
              <BrandLogo 
                src={athenaProduct.brandLogoSrc || ATHENA_LOGO_URL}
                alt="Athena logo" 
              />
            </LogoContainer>
            <Box>
              <ProductName variant="h6">{athenaProduct.productName}</ProductName>
              <Typography variant="body2" color="text.secondary">
                {formatCurrency(athenaProduct.loanAmount)} over 30 years
              </Typography>
            </Box>
          </ProductNameContainer>
          
          <ProductRow>
            <Typography variant="body2">Interest rate</Typography>
            <RateValue>{formatPercentage(athenaProduct.interestRate)}</RateValue>
          </ProductRow>
          
          <ProductRow>
            <Typography variant="body2">Monthly repayments</Typography>
            <RepaymentValue>{formatCurrency(athenaProduct.monthlyRepayment)}</RepaymentValue>
          </ProductRow>
          
          {athenaProduct.upfrontFee && athenaProduct.upfrontFeeAmount && (
            <FeeInfo>
              There will be upfront fees of {formatCurrency(athenaProduct.upfrontFeeAmount)} 
              {' '}which is {formatPercentage(athenaProduct.upfrontFee)} of the loan amount
            </FeeInfo>
          )}
        </StyledCardContent>
      </ProductCard>
      
      <ProductCard>
        <StyledCardContent>
          <ProductNameContainer>
            <LogoContainer>
              <BrandLogo 
                src={ownHomeProduct.brandLogoSrc || OWNHOME_LOGO_URL}
                alt="OwnHome logo" 
              />
            </LogoContainer>
            <Box>
              <ProductName variant="h6">{ownHomeProduct.productName}</ProductName>
              <Typography variant="body2" color="text.secondary">
                {formatCurrency(ownHomeProduct.loanAmount)} over {ownHomeProduct.term} years
              </Typography>
            </Box>
          </ProductNameContainer>
          
          <ProductRow>
            <Typography variant="body2">Interest rate</Typography>
            <RateValue>{formatPercentage(ownHomeProduct.interestRate)}</RateValue>
          </ProductRow>
          
          <ProductRow>
            <Typography variant="body2">Monthly repayments</Typography>
            <RepaymentValue>{formatCurrency(ownHomeProduct.monthlyRepayment)}</RepaymentValue>
          </ProductRow>
          
          {ownHomeProduct.upfrontFee && ownHomeProduct.upfrontFeeAmount && (
            <FeeInfo>
              There will be upfront fees of {formatCurrency(ownHomeProduct.upfrontFeeAmount)} 
              {' '}which is {formatPercentage(ownHomeProduct.upfrontFee)} of the loan amount
            </FeeInfo>
          )}
        </StyledCardContent>
      </ProductCard>
    </Box>
  );
}; 