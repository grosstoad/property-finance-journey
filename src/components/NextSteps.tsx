import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  styled,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Styled Card to match the design
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  padding: theme.spacing(3, 3),
  backgroundColor: '#2C1B3A', // Deep purple background
  color: theme.palette.common.white,
  width: '100%', // Will match parent width
}));

// Styled Button for Share
const ShareButton = styled(Button)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  color: theme.palette.common.white,
  borderRadius: '20px',
  padding: theme.spacing(0.5, 2),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  textTransform: 'none', // Prevent uppercase
  fontSize: '0.9rem',
}));

// Styled Avatar placeholder
const PlaceholderAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.common.white, 0.3), // Lighter purple placeholder
  width: 50,
  height: 50,
}));

// Interface for component props (optional actions)
interface NextStepsProps {
  onShare?: () => void;
  onFindProperties?: () => void;
  onGetHelp?: () => void;
  onGetPreApproved?: () => void;
  sx?: SxProps<Theme>;
}

export function NextSteps({
  onShare,
  onFindProperties,
  onGetHelp,
  onGetPreApproved,
  sx,
}: NextStepsProps) {
  const steps = [
    {
      title: 'Find other properties',
      description: 'Match with other property opportunities using our AI powered Buyers Agent.',
      action: onFindProperties,
    },
    {
      title: 'Get help from an expert',
      description: 'We\'re here to help you navigate property lending',
      action: onGetHelp,
    },
    {
      title: 'Get pre-approved for this loan',
      description: 'Get the confidence you need to bid ready on auction day',
      action: onGetPreApproved,
    },
  ];

  return (
    <StyledCard sx={sx}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Where to next?
        </Typography>
        <ShareButton startIcon={<ShareIcon />} onClick={onShare}>
          Share
        </ShareButton>
      </Box>

      <List disablePadding>
        {steps.map((step, index) => (
          <ListItem
            key={index}
            disableGutters
            secondaryAction={
              <IconButton edge="end" aria-label={`go to ${step.title}`} onClick={step.action} sx={{ color: 'common.white' }}>
                <ArrowForwardIcon />
              </IconButton>
            }
            sx={{ mb: 2 }} // Add margin between list items
          >
            <ListItemAvatar sx={{ mr: 2 }}> {/* Add margin to avatar */}
              <PlaceholderAvatar />
              {/* Placeholder circle - replace with SVG/Icon later */}
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="body1" fontWeight={600}>
                  {step.title}
                </Typography>
              }
              secondary={
                <Typography variant="body2" color={alpha('#FFFFFF', 0.8)}>
                  {step.description}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </StyledCard>
  );
}

// NOTE: No default export, only named export as per guidelines. 