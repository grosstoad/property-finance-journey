import { useState, useEffect } from 'react';
import { formatCurrency } from '../../logic/formatters';

interface SimplifiedAnimatedNumberProps {
  value: number;
  format?: 'currency' | 'percent' | 'number';
  decimals?: number;
}

export function SimplifiedAnimatedNumber({ 
  value, 
  format = 'currency',
  decimals = 0
}: SimplifiedAnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    // Animate over time
    const duration = 500; // ms
    const startTime = Date.now();
    const startValue = displayValue;
    const targetValue = value || 0;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Use an easing function for smoother transition
      const easedProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      const currentValue = startValue + (targetValue - startValue) * easedProgress;
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [value]);
  
  if (format === 'currency') {
    return <span>{formatCurrency(displayValue)}</span>;
  } else if (format === 'percent') {
    return <span>{displayValue.toFixed(decimals)}%</span>;
  } else {
    return <span>{displayValue.toFixed(decimals)}</span>;
  }
} 