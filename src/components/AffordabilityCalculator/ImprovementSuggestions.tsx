import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
  Alert,
  Paper,
} from '@mui/material';
import { TrendingUp, CreditCard, AccountBalance, Savings, CheckCircle, InfoOutlined } from '@mui/icons-material';
import type { ImprovementScenario } from '../../types/FinancialTypes';
import { formatCurrency } from '../../logic/formatters';
import { keyframes } from '@mui/system';

// Create a pulse animation
const pulseAnimation = keyframes`
  0% { opacity: 0.8; transform: scale(0.3); }
  100% { opacity: 0; transform: scale(1); }
`;

// Map scenario types to appropriate icons
const getScenarioIcon = (type: string) => {
  switch(type.toLowerCase()) {
    case 'savings':
      return <Savings />;
    case 'expenses':
      return <AccountBalance />;
    case 'credit':
      return <CreditCard />;
    case 'global_max':
      return <InfoOutlined />;
    default:
      return <TrendingUp />;
  }
};

interface ImprovementSuggestionsProps {
  scenarios: ImprovementScenario[];
  onScenarioClick: (scenario: ImprovementScenario) => void;
  appliedScenarios?: string[]; // Array of applied scenario IDs
}

export function ImprovementSuggestions({
  scenarios,
  onScenarioClick,
  appliedScenarios = []
}: ImprovementSuggestionsProps) {
  if (!scenarios.length) {
    return null;
  }
  
  // Check if we have a global max message scenario
  const globalMaxScenario = scenarios.find(s => s.type === 'GLOBAL_MAX');
  
  // Check if we have any scenarios applied
  const hasAppliedScenarios = appliedScenarios.length > 0;

  return (
    <Box sx={{ my: 4 }}>
      {/* Applied Scenarios Banner */}
      {hasAppliedScenarios && (
        <Alert 
          severity="success" 
          variant="filled" 
          sx={{ mb: 2 }}
        >
          <Typography variant="body2" fontWeight="medium">
            Affordability scenarios applied! Your borrowing estimate has been updated.
          </Typography>
        </Alert>
      )}
      
      <Typography variant="h6" sx={{ mb: 2 }}>
        Options to improve your borrowing power:
      </Typography>
      
      {/* Global Max Message - Special Case */}
      {globalMaxScenario && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: 'info.light',
            color: 'info.contrastText',
            borderRadius: 1
          }}
        >
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <InfoOutlined sx={{ mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="medium">
                {globalMaxScenario.title}
              </Typography>
              <Typography variant="body2">
                {globalMaxScenario.description}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}
      
      {/* Regular Improvement Scenarios */}
      <Grid container spacing={2}>
        {scenarios.filter(scenario => scenario.type !== 'GLOBAL_MAX').map((scenario) => {
          // Check if this scenario has been applied
          const isApplied = appliedScenarios.includes(scenario.id);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={scenario.id}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Bounce effect
                  backgroundColor: isApplied ? 'success.light' : 'inherit',
                  transform: isApplied ? 'scale(1.03)' : 'scale(1)',
                  boxShadow: isApplied ? '0 3px 10px rgba(0,0,0,0.12)' : 'none',
                  '&:hover': {
                    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                    transform: isApplied ? 'scale(1.03)' : 'scale(1.02)'
                  },
                }}
              >
                <CardActionArea
                  onClick={() => onScenarioClick(scenario)}
                  sx={{ height: '100%', p: 0.5 }}
                >
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Box sx={{ color: isApplied ? 'success.dark' : 'primary.main' }}>
                        {isApplied ? <CheckCircle /> : getScenarioIcon(scenario.type)}
                      </Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {scenario.title}
                      </Typography>
                    </Stack>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {scenario.description}
                    </Typography>
                    
                    <Box sx={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      mt: 'auto'
                    }}>
                      <Chip
                        label={isApplied ? 'Applied' : `+${formatCurrency(scenario.impact)}`}
                        color={isApplied ? 'success' : 'primary'}
                        size="small"
                        icon={isApplied ? <CheckCircle /> : <TrendingUp />}
                        sx={{
                          fontWeight: 'medium',
                          transition: 'all 0.3s ease',
                          transform: isApplied ? 'scale(1.05)' : 'scale(1)'
                        }}
                      />
                      
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                          fontWeight: 'medium',
                          cursor: 'pointer', 
                          ml: 1,
                          transition: 'opacity 0.2s ease',
                          '&:hover': {
                            opacity: 0.7
                          }
                        }}
                      >
                        {isApplied ? 'Click to remove' : 'Click to apply'}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
} 