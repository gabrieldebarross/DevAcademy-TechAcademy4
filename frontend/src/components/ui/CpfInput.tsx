import { forwardRef, type InputHTMLAttributes } from 'react';
import { Input } from './Input';
import { maskCpf } from '@/utils/formatters';

interface CpfInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: string;
  onValueChange: (value: string) => void;
  invalid?: boolean;
}

/**
 * CPF field that masks the input as `000.000.000-00` while the user types and
 * never allows more than 11 digits.
 */
export const CpfInput = forwardRef<HTMLInputElement, CpfInputProps>(
  function CpfInput({ value, onValueChange, ...rest }, ref) {
    return (
      <Input
        ref={ref}
        inputMode="numeric"
        autoComplete="off"
        maxLength={14}
        placeholder="000.000.000-00"
        value={maskCpf(value)}
        onChange={(event) => onValueChange(maskCpf(event.target.value))}
        {...rest}
      />
    );
  },
);
