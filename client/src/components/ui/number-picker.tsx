import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NumberPickerProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
  label?: string;
}

export function NumberPicker({ value, min, max, step = 1, onChange, className, label }: NumberPickerProps) {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - step);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + step);
    }
  };

  return (
    <div className={cn("flex items-center justify-between bg-card/30 p-2 rounded-lg border border-white/5", className)}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleDecrease}
        disabled={value <= min}
        className="h-10 w-10 rounded-md hover:bg-primary/20 hover:text-primary"
      >
        <Minus className="w-4 h-4" />
      </Button>
      
      <div className="text-center">
        <div className="text-xl font-mono font-bold tracking-tight">{value}</div>
        {label && <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>}
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleIncrease}
        disabled={value >= max}
        className="h-10 w-10 rounded-md hover:bg-primary/20 hover:text-primary"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
