import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";

interface MoneyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number;
  onValueChange: (value: number) => void;
  label?: string;
}

export function MoneyInput({ value, onValueChange, className, ...props }: MoneyInputProps) {
  // Use local string state to handle typing "1000" without fighting format
  const [displayValue, setDisplayValue] = useState(value.toString());

  useEffect(() => {
    // Only sync back if valid and different significantly
    if (!isNaN(parseFloat(displayValue)) && parseFloat(displayValue) !== value) {
        // Allow user to type
    } else if (document.activeElement !== document.getElementById(props.id || '')) {
       // Only update from prop if not focused to avoid cursor jumping
       // But for simple implementation, we can just use the number type input
    }
  }, [value, displayValue, props.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDisplayValue(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onValueChange(num);
    } else if (val === '') {
      onValueChange(0);
    }
  };

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        <DollarSign className="w-4 h-4" />
      </div>
      <Input
        type="number"
        value={value || ''}
        onChange={handleChange}
        className={`pl-9 ${className}`}
        {...props}
      />
    </div>
  );
}
