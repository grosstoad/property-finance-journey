import { Tooltip, Typography, Box } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import React from 'react';

interface FinancialTooltipProps {
  title: string;
  content: React.ReactNode;
}

export function FinancialTooltip({ title, content }: FinancialTooltipProps) {
  return (
    <Tooltip
      title={
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2">{title}</Typography>
          <Typography variant="body2">{content}</Typography>
        </Box>
      }
      arrow
      placement="top"
    >
      <InfoOutlinedIcon 
        fontSize="small" 
        sx={{ 
          fontSize: 16, 
          ml: 0.5, 
          color: 'text.secondary', 
          verticalAlign: 'text-bottom',
          cursor: 'help'
        }} 
      />
    </Tooltip>
  );
} 