import { Box, Card, Typography, styled, useTheme, useMediaQuery } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface AffordabilityCardProps {
  onClick: () => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  padding: theme.spacing(2, 4),
  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  width: '100%',
  cursor: 'pointer',
  transition: 'transform 0.2s, box-shadow 0.2s',
  backgroundColor: '#F5F1FF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: 'calc(100% - 32px)', // Adjust height to match YourFinancials with proper padding
  minHeight: '80px',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0px 6px 8px rgba(0, 0, 0, 0.3)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5, 3),
    height: 'auto',
  }
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.light,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 16,
}));

export const AffordabilityCard = ({ onClick }: AffordabilityCardProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <StyledCard onClick={onClick}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconWrapper>
          <AttachMoneyIcon sx={{ color: '#348433', fontSize: 36 }} />
        </IconWrapper>
        <Box>
          <Typography variant="h6" component="h2" fontWeight={700}>
            Calculate my affordability
          </Typography>
          <Typography variant="body2" color="text.secondary">
            And maximum borrowing power
          </Typography>
        </Box>
      </Box>
      <ArrowForwardIcon />
    </StyledCard>
  );
}; 