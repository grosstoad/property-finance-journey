import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
} from '@mui/material';
import { TrendingUp, CreditCard, AccountBalance, Savings } from '@mui/icons-material';
import type { ImprovementScenario } from '../../types';
import { formatCurrency } from '../../logic/formatters';

// Map scenario titles to appropriate icons
const getScenarioIcon = (title: string) => {
  if (title.toLowerCase().includes('savings')) return <Savings />;
  if (title.toLowerCase().includes('expenses')) return <AccountBalance />;
  if (title.toLowerCase().includes('credit')) return <CreditCard />;
  return <TrendingUp />;
};

interface ImprovementSuggestionsProps {
  scenarios: ImprovementScenario[];
  onScenarioClick: (scenario: ImprovementScenario) => void;
}

export function ImprovementSuggestions({
  scenarios,
  onScenarioClick,
}: ImprovementSuggestionsProps) {
  if (!scenarios.length) {
    return null;
  }

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Options to improve your borrowing power:
      </Typography>
      <Grid container spacing={2}>
        {scenarios.map((scenario, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardActionArea
                sx={{ height: '100%' }}
                onClick={() => onScenarioClick(scenario)}
              >
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Box sx={{ color: 'primary.main' }}>{getScenarioIcon(scenario.title)}</Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {scenario.title}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {scenario.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={`+${formatCurrency(scenario.potentialIncrease)}`}
                      color="success"
                      size="small"
                      icon={<TrendingUp />}
                    />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 