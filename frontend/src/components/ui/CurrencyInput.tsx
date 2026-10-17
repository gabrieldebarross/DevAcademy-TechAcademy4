import { forwardRef, type InputHTMLAttributes } from 'react';
import { Input } from './Input';
import { maskCurrency } from '@/utils/formatters';

interface CurrencyInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: string;
  onValueChange: (value: string) => void;
  invalid?: boolean;
}

/**
 * Currency field that masks the input in Brazilian format (`0,00`) while the
 * user types. The parent stores the masked string and converts it back to a
 * number with `parseCurrency` before sending it to the API.
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput({ value, onValueChange, ...rest }, ref) {
    return (
      <Input
        ref={ref}
        inputMode="numeric"
        autoComplete="off"
        placeholder="0,00"
        value={maskCurrency(value)}
        onChange={(event) => onValueChange(maskCurrency(event.target.value))}
        {...rest}
      />
    );
  },
);
