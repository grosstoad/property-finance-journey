import { Box, Paper, Typography, styled } from '@mui/material';

const Container = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: '#f5f5f5',
  overflow: 'auto',
  maxHeight: '400px',
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  marginTop: theme.spacing(2)
}));

const Title = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  fontWeight: 600
}));

interface JsonViewerProps {
  title?: string;
  data: unknown;
}

export const JsonViewer = ({ title, data }: JsonViewerProps) => {
  // Format the JSON data with 2-space indentation
  const formattedJson = JSON.stringify(data, null, 2);
  
  return (
    <Box>
      {title && <Title variant="subtitle1">{title}</Title>}
      <Container aria-label={title ? `${title} JSON data` : 'JSON data'} tabIndex={0}>
        <pre data-testid="json-content">
          {formattedJson}
        </pre>
      </Container>
    </Box>
  );
}; 