import { Box, Container, Typography, styled } from '@mui/material';
import { DepositCalculator } from '../components/DepositCalculator';

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(4, 0),
  backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  backgroundAttachment: 'fixed',
}));

const Header = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  color: theme.palette.text.primary,
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  maxWidth: 600,
  margin: '0 auto',
}));

export const DepositCalculatorPage = () => {
  return (
    <PageContainer>
      <Container maxWidth="lg">
        <Header>
          <Title variant="h3">Deposit & Stamp Duty Calculator</Title>
          <Subtitle variant="h6">
            Calculate your deposit, stamp duty, and loan requirements for any property in Australia
          </Subtitle>
        </Header>

        <DepositCalculator />
      </Container>
    </PageContainer>
  );
}; 